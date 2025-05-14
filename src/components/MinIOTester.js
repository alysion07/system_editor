import React, { useEffect, useState } from 'react';
import {
    listBuckets,
    listFilesInBucket,
    listFilesInFolder,
    generatePresignedDownloadUrl,
    uploadToMinio } from '../services/minioService';

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
        gap: 16
    }}>
        <span style={{
            fontSize: 22,
            marginRight: 10
        }}>📄</span>
        <span style={{
            flex: 1,
            fontWeight: 500,
            fontSize: 15,
            color: '#333',
        }}></span>
        <span>{fileName}</span>
        <button onClick={onDownload}>다운로드</button>
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

    useEffect(() => {
        const fetchBuckets = async () => {
            try {
                const bucketList = await listBuckets();
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
        // '/'를 기준으로 projectFolderPath를 나누고 각각 버킷이름, 유저이름, 프로젝트 이름을 추출
        const pathParts = projectFolderPath.split(',');
         BucketName = pathParts[0];
         userName = pathParts[1].split('/')[0];
         projectName = pathParts[1].split('/')[1];
         inputFileName = pathParts[2];

        console.log("bucketName: ", BucketName,
            "userName: ", userName, "projectName: ", projectName, 'inputFileName: ', inputFileName);
        // const fileName = pathParts[3];

    }, [projectFolderPath]);

    const fetchFiles = async (bucketName) => {
        try {
            // const fileList = await listFilesInBucket(bucketName, 'yjcho/project2/run/');
            console.log('projectFolderPath: ', projectFolderPath)
            const fileList = await listFilesInFolder(bucketName, `${userName}/${projectName}/run`);
            setFiles(fileList);
            setSelectedBucket(bucketName);
        } catch (error) {
            console.error('파일 가져오기 실패:', error);
        }
    };

    const handleDownload = async (fileName) => {
        try {
            const url = await generatePresignedDownloadUrl(selectedBucket, fileName);
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
            await uploadToMinio(selectedBucket, uploadPath, uploadFile);
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
                    <h4> {status} "{projectName? projectName:'결과'}" 파일 리스트</h4>
                    <div style={{ margin: '20px, 10px', borderRadius: 8, padding: '16px', backgroundColor: "#f9f9f9" }}>
                        {files.length > 0 ? (
                            <div className={"card-list"} style={{display: 'flex',flexDirection: 'row',   justifyContent: 'flex-start', gap: 4}}>
                            <ul>
                                {files.map((file, index) => (
                                    <FileCard
                                        key={index}
                                        fileName={file}
                                        onDownload={() => handleDownload(file)}
                                    />
                                ))}
                            </ul>
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
