// Browser.jsx (외부 prefix, bucket props 적용 + buildFullKey 적용 버전)
import React, { useEffect, useState, useRef } from "react";

import MinioTreeView from './TreeView';
import { buildTreeFromS3Keys } from '../../utils/minioTreeBuilder';
import {    ProjectService} from "../../services/projectService.js";

import './Browser.css';

const Browser = ({ externalBucket = null, externalPrefix = '', buildFullKey = null }) => {
    const [treeData, setTreeData] = useState(null);
    const [buckets, setBuckets] = useState([]);
    const [selectedBucket, setSelectedBucket] = useState('');
    const [textContent, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const [isBinary, setIsBinary] = useState(false);
    const [binaryUrl, setBinaryUrl] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewChunks, setPreviewChunks] = useState([]);
    const [chunkSize] = useState(10000);
    const [isFullyLoaded, setIsFullyLoaded] = useState(false);

    const abortControllerRef = useRef(null);

    const maxPreviewLength = 50000;
    const isLong = textContent.length > maxPreviewLength;
    const previewText = expanded || !isLong ? textContent : textContent.slice(0, maxPreviewLength) + '...';

    useEffect(() => {
        if (externalBucket) {
            setSelectedBucket(externalBucket);
            fetchFiles(externalBucket, externalPrefix);
        } else {
            fetchBuckets();
        }

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [externalBucket, externalPrefix]);

    const fetchBuckets = async () => {
        try {
            setLoading(true);
            const bucketList = await ProjectService.listBuckets();
            setBuckets(bucketList);
            if (bucketList.length > 0) {
                setSelectedBucket(bucketList[0].Name);
                await fetchFiles(bucketList[0].Name);
            }
        } catch (err) {
            setContent('❌ 버킷 불러오기 실패: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchFiles = async (bucketName, prefix = '') => {
        try {
            setLoading(true);  // 추가
            const fileList = await ProjectService.listProjects(bucketName, prefix);
            const filtered = externalPrefix
                ? fileList.filter(f => (typeof f === 'string' ? f.startsWith(externalPrefix) : (f.Key || f.Prefix || '').startsWith(externalPrefix)))
                : fileList;

            const tree = buildTreeFromS3Keys(filtered, externalPrefix);
            setTreeData(tree);
        } catch (error) {
            setContent('❌ 파일 가져오기 실패: ' + error.message);
        } finally {
            setLoading(false);  // 추가
        }
    };

    const loadPreviewChunk = (fullText) => {
        const nextIndex = previewChunks.length * chunkSize;
        const nextChunk = fullText.slice(nextIndex, nextIndex + chunkSize);
        const updatedChunks = [...previewChunks, nextChunk];

        setPreviewChunks(updatedChunks);

        if (nextIndex + chunkSize >= fullText.length) {
            setIsFullyLoaded(true);
        }
    };

    const handleFileClick = async (key) => {
        try {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            abortControllerRef.current = new AbortController();

            setIsPreviewLoading(true);
            setExpanded(false);
            setPreviewChunks([]);
            setIsFullyLoaded(false);
            setIsBinary(false);
            setBinaryUrl(null);
            setContent('');

            const fullKey = buildFullKey ? buildFullKey(key) : key;
            const url = await ProjectService.getSignedDownloadUrl(fullKey);

            const res = await fetch(url, {
                signal: abortControllerRef.current.signal
            });

            if (!res.ok) {
                setContent(`❌ 서버 오류: ${res.status} ${res.statusText}`);
                return;
            }

            const type = res.headers.get('Content-Type');
            const reader = res.body.getReader();
            const { value } = await reader.read();
            const chunk = new TextDecoder().decode(value || new Uint8Array());
            const hasBinaryChars = /[\x00-\x08\x0E-\x1F]/.test(chunk);
            setBinaryUrl(url);

            if (hasBinaryChars) {
                setIsBinary(true);
            } else {
                setContent(chunk);
                loadPreviewChunk(chunk);
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                console.log('요청이 취소되었습니다.');
            } else {
                console.error('파일 요청 중 오류 발생:', err);
                setContent(`❌ 파일을 불러오는 데 실패했습니다.\n\n에러: ${err.message}`);
            }
        } finally {
            setIsPreviewLoading(false);
            abortControllerRef.current = null;
        }
    };

    return (
        <div className="browser-wrapper">
            <div className="browser-header">
                <div className="browser-title">📂 File Browser</div>
            </div>
            <div className="tree-preview-layout">
                <div className="tree-panel">
                    {!externalBucket && (
                        <div className="tree-header">
                            <select
                                id="bucketSelect"
                                value={selectedBucket}
                                onChange={(e) => fetchFiles(e.target.value)}
                                className="bucket-select"
                            >
                                {buckets.map(bucket => (
                                    <option key={bucket.Name} value={bucket.Name}>
                                        {bucket.Name}
                                    </option>
                                ))}
                            </select>
                            <button className="refresh-button" onClick={fetchBuckets}>⟳</button>
                        </div>
                    )}
                    <div className="tree-divider" />
                    {!loading ? (
                        <MinioTreeView treeData={treeData} onFileClick={handleFileClick} />
                    ) : (
                        <div className="shimmer-wrapper">
                            <div className="shimmer-line" style={{ width: '60%' }}></div>
                            <div className="shimmer-line" style={{ width: '80%' }}></div>
                            <div className="shimmer-line" style={{ width: '40%' }}></div>
                        </div>
                    )}
                </div>
                <div className="preview-panel">
                    <div className="preview-header">
                        <div className="preview-title">📄 파일 미리보기</div>
                        {binaryUrl && (
                            <a href={binaryUrl} download className="download-button">
                                <img src="/download.svg" />
                            </a>
                        )}
                    </div>
                    {isPreviewLoading ? (
                        <div className="preview-body">
                            <div className="shimmer-line" style={{ width: '80%' }}></div>
                            <div className="shimmer-line" style={{ width: '70%' }}></div>
                            <div className="shimmer-line" style={{ width: '90%' }}></div>
                        </div>
                    ) : isBinary ? (
                        <div className="preview-body">
                            <div className="binary-placeholder">
                                <p>이 파일은 바이너리 형식으로 미리볼 수 없습니다.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="preview-body">
                                <div className="pre-scroll">
                                    <pre>{previewChunks.join('')}</pre>
                                </div>
                            </div>
                            {!isFullyLoaded ? (
                                <button onClick={() => loadPreviewChunk(previewText)} className="toggle-preview-button">
                                    <img src="./more_horiz.svg" alt="Load more" />
                                </button>
                            ) : (
                                <div className="preview-footer-note">
                                    전체 미리보기를 로드했습니다. 더 많은 내용을 보려면 파일을 다운로드하세요.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Browser;
