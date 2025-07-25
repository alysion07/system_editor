import React, { useEffect, useState, useRef } from "react";
import { ProjectService } from "../../services/projectService.js";

const chunkSize = 10000;

const FilePreview = ({ objectKey, buildFullKey }) => {
    const [textContent, setContent] = useState('');
    const [isBinary, setIsBinary] = useState(false);
    const [binaryUrl, setBinaryUrl] = useState(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewChunks, setPreviewChunks] = useState([]);
    const [isFullyLoaded, setIsFullyLoaded] = useState(false);
    const abortControllerRef = useRef(null);

    useEffect(() => {
        if (!objectKey) return;
        fetchPreview(objectKey);
        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [objectKey]);

    const fetchPreview = async (key) => {
        try {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            abortControllerRef.current = new AbortController();
            setIsPreviewLoading(true);
            setContent('');
            setIsBinary(false);
            setBinaryUrl(null);
            setPreviewChunks([]);
            setIsFullyLoaded(false);

            const { path, userId, projectName } = objectKey;
            const fullKey = `${userId}/${projectName}/${path}`;
            const url = await ProjectService.getSignedDownloadUrl(fullKey);
            const res = await fetch(url, { signal: abortControllerRef.current.signal });
            if (!res.ok) {
                setContent(`❌ 서버 오류: ${res.status} ${res.statusText}`);
                return;
            }
            const reader = res.body.getReader();
            const { value } = await reader.read();
            const chunk = new TextDecoder().decode(value || new Uint8Array());
            const hasBinaryChars = /[\x00-\x08\x0E-\x1F]/.test(chunk);
            setBinaryUrl(url);

            if (hasBinaryChars) {
                setIsBinary(true);
            } else {
                setContent(chunk);
                setPreviewChunks([chunk.slice(0, chunkSize)]);
                if (chunk.length <= chunkSize) setIsFullyLoaded(true);
            }
        } catch (err) {
            setContent(`❌ 파일을 불러오는 데 실패했습니다.\n\n에러: ${err.message}`);
        } finally {
            setIsPreviewLoading(false);
            abortControllerRef.current = null;
        }
    };

    const loadPreviewChunk = () => {
        const nextIndex = previewChunks.length * chunkSize;
        const nextChunk = textContent.slice(nextIndex, nextIndex + chunkSize);
        setPreviewChunks([...previewChunks, nextChunk]);
        if (nextIndex + chunkSize >= textContent.length) setIsFullyLoaded(true);
    };

    if (!objectKey) return (
        <div className="flex items-center justify-center h-full text-gray-400 bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl ">
            파일을 선택하세요.
        </div>
    );

    return (
        <div className="h-full bg-panel-bg/85 backdrop-blur-md rounded-l-2xl shadow-lg border border-gray-700 flex flex-col w-full overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-panel-bg/85 ">
                <div className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                    <span role="img" aria-label="preview">📄</span> 파일 미리보기
                </div>
                {binaryUrl && (
                    <a href={binaryUrl} download className="p-2 rounded-md hover:bg-gray-700 transition-colors">
                        <img src="/download.svg" alt="다운로드" className="w-5 h-5 invert" />
                    </a>
                )}
            </div>
            {isPreviewLoading ? (
                <div className="flex flex-col gap-2 px-6 py-8" >
                    <div className="animate-pulse bg-gray-700 h-4 rounded w-4/5"></div>
                    <div className="animate-pulse bg-gray-700 h-4 rounded w-3/4"></div>
                    <div className="animate-pulse bg-gray-700 h-4 rounded w-5/6"></div>
                </div>
            ) : isBinary ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-gray-400">
                    <div className="text-center">
                        <p>이 파일은 바이너리 형식으로 미리볼 수 없습니다.</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-auto p-4 ">
                        <pre className="text-sm text-gray-200 whitespace-pre-wrap p-4 rounded-md ">{previewChunks.join('')}</pre>
                    </div>
                    {!isFullyLoaded ? (
                        <div className="flex justify-center p-2 border-t border-gray-700">
                            <button
                                onClick={loadPreviewChunk}
                                className=" w-full px-4 py-2 bg-transparent hover:bg-gray-600 rounded-md text-gray-300 flex justify-center gap-2 transition-colors "
                            >
                                <img src="./more_horiz.svg" alt="더보기" className="w-7 h-6" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500 text-center py-2 border-t border-gray-700">
                            전체 미리보기를 로드했습니다. 더 많은 내용을 보려면 파일을 다운로드하세요.
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default FilePreview;
