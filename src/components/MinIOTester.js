import React, { useEffect, useState } from 'react';
import { ProjectService } from '../services/projectService';

const getFileName = (filePath) => {
    const parts = filePath.split('/');
    return parts[parts.length - 1];
}
const FileCard = ({ fileName, onDownload }) => (
    <div style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: '12px 20px',
        minWidth: 180,
        display: 'flex',
        alignItems: 'center',
        background: '#f9f9f9',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        gap: 2
    }}>
        <span style={{
            fontSize: 22,
            marginRight: 10
        }}>📄</span>
        <span style={{
            flex: 1,
            fontWeight: 500,
            fontSize: 12, // 가독성 개선
            color: '#333',
            textAlign: 'left'
        }}>{getFileName(fileName)}</span>
        <button onClick={onDownload}>
            <i className="fas fa-download"></i>
        </button>
    </div>
);

let BucketName = ''
let userName = ''
let projectName = ''
let inputFileName = ''


const MinioManager = ({isTaskComplete, projectFolderPath} ) => {
    const [status, setStatus] = useState('확인 중...');
    const [buckets, setBuckets] = useState([]);
    const [selectedBucket, setSelectedBucket] = useState(null);
    const [files, setFiles] = useState([]);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadPath, setUploadPath] = useState('');
    const [fileContent, setFileContent] = useState('');
    const [content, setContent] = useState('');

    const maxPreviewLength = 200000; // 미리보기 최대 글자 수

    const [showFull, setShowFull] = useState(false);

    const previewContent = showFull ? content : content.slice(0, maxPreviewLength);

    useEffect(() => {
        const fetchBuckets = async () => {
            try {
                const bucketList = await ProjectService.listBuckets();
                setStatus('✅');
                setBuckets(bucketList);
            } catch (err) {
                console.error(err);
                setStatus(`❌: ${err.name} - ${err.message}`);
            }
        };

        fetchBuckets();
    }, []);

    useEffect(() => {
        console.log('task complite and reload file list')
        fetchFiles('v-smr')

    }, [isTaskComplete]);

    useEffect(() => {
        const pathParts = projectFolderPath.split(',');
         BucketName = pathParts[0];
         userName = pathParts[1].split('/')[0];
         projectName = pathParts[1].split('/')[1];
         inputFileName = pathParts[2];

        console.log("bucketName: ", BucketName,
            "userName: ", userName, "projectName: ", projectName, 'inputFileName: ', inputFileName);
        // const fileName = pathParts[3];

    }, [projectFolderPath]);

    useEffect(() => {
        const fetchFileContent = async () => {
            try {
                const url = await ProjectService.getSignedDownloadUrl(`${userName}/${projectName}/run/outdta`);
                const res = await fetch(url);
                const text = await res.text();
                setContent(text);
            } catch (err) {
                console.log('파일 내용을 불러오지 못했습니다.');
            }
        };
        if (buckets && projectFolderPath) fetchFileContent();
    }, [buckets, projectFolderPath]);

    const fetchFiles = async (bucketName) => {
        try {
            // const fileList = await listFilesInBucket(bucketName, 'yjcho/project2/run/');
            console.log('projectFolderPath: ', projectFolderPath)
            const fileList = await ProjectService.listProjects(`${userName}/${projectName}/run`);
            setFiles(fileList);
            setSelectedBucket(bucketName);
        } catch (error) {
            console.error('파일 가져오기 실패:', error);
        }
    };

    const handleDownload = async (fileName) => {
        try {
            const url = await ProjectService.getSignedDownloadUrl(fileName);
            window.open(url, '_blank');
        } catch (error) {
            console.error('다운로드 URL 생성 실패:', error);
        }
    };

    const handleFileChange = (e) => {
        setUploadFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!uploadFile || !selectedBucket || !uploadPath) {
            alert('버킷 선택, 파일 선택, 업로드 경로 입력이 필요합니다.');
            return;
        }

        try {
            await ProjectService.uploadProjectJson(userName, uploadPath, uploadFile);
            alert('업로드 성공!');
            fetchFiles(selectedBucket);
        } catch (error) {
            console.error('업로드 실패:', error);
        }
    };

    return (
        <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
            {/*<p>{status}</p>*/}
            {/*{buckets.length > 0 ? (*/}
            {/*    <>*/}
            {/*        <h3>버킷 목록 ({buckets.length})</h3>*/}
            {/*        <ul>*/}
            {/*            {buckets.map((bucket) => (*/}
            {/*                <li key={bucket.Name}>*/}
            {/*                    <button onClick={() => fetchFiles(bucket.Name)} style={{ marginBottom: '4px' }}>*/}
            {/*                        {bucket.Name}*/}
            {/*                    </button>*/}
            {/*                </li>*/}
            {/*            ))}*/}
            {/*        </ul>*/}
            {/*    </>*/}
            {/*) : status.includes('성공') ? (*/}
            {/*    <p>버킷이 없습니다.</p>*/}
            {/*) : null}*/}
            {selectedBucket && (
                <div >
                    <h4> {status} "{projectName? projectName:'Result'}" File List</h4>
                    {content.length > maxPreviewLength && !showFull && (
                        <button onClick={() => setShowFull(true)}>전체 보기</button>
                    )}
                    {content.length > maxPreviewLength && showFull && (
                        <button onClick={() => setShowFull(false)}>미리보기로 접기</button>
                    )}
                    <div style={{
                        whiteSpace: 'pre-wrap',
                        background: '#f9f9f9',
                        padding: 16,
                        maxHeight: 300,
                        overflow: 'auto',
                        border: '1px solid #ddd',
                        borderRadius: 6
                    }}>
                        <h4>내용</h4>

                        <pre style={{margin: 0}}>{previewContent}</pre>
                    </div>
                    <div style={{ margin: '20px, 10px', borderRadius: 8, padding: '16px', backgroundColor: "#f9f9f9" }}>
                        {files.length > 0 ? (
                            <div className={"card-list"} style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', gap: 4}}>
                                {files.map((file, index) => (
                                    <FileCard
                                        key={index}
                                        fileName={file}
                                        onDownload={() => handleDownload(file)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p>파일이 없습니다.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinioManager;
