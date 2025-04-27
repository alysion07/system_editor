import React, { useEffect, useState } from 'react';
import { S3Client, ListBucketsCommand, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const client = new S3Client({
    region: 'us-east-1',
    endpoint: 'http://121.148.223.175:9010',
    credentials: {
        accessKeyId: 'minio',
        secretAccessKey: 'minio123',
    },
    forcePathStyle: true,
});

const MinioManager = () => {
    const [status, setStatus] = useState('확인 중...');
    const [buckets, setBuckets] = useState([]);
    const [selectedBucket, setSelectedBucket] = useState(null);
    const [files, setFiles] = useState([]);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadPath, setUploadPath] = useState('');

    useEffect(() => {
        const fetchBuckets = async () => {
            try {
                const result = await client.send(new ListBucketsCommand({}));
                setStatus('✅ MinIO 연결 성공!');
                setBuckets(result.Buckets || []);
            } catch (err) {
                console.error(err);
                setStatus(`❌ 연결 실패: ${err.name} - ${err.message}`);
            }
        };

        fetchBuckets();
    }, []);

    const fetchFiles = async (bucketName) => {
        try {
            const command = new ListObjectsV2Command({
                Bucket: bucketName,
            });

            const response = await client.send(command);
            if (response.Contents) {
                setFiles(response.Contents.map((item) => item.Key));
            } else {
                setFiles([]);
            }
            setSelectedBucket(bucketName);
        } catch (error) {
            console.error('파일 가져오기 실패:', error);
        }
    };

    const handleDownload = async (fileName) => {
        try {
            const command = new GetObjectCommand({
                Bucket: selectedBucket,
                Key: fileName,
            });

            const url = await getSignedUrl(client, command, { expiresIn: 3600 });
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
            const command = new PutObjectCommand({
                Bucket: selectedBucket,
                Key: uploadPath,
                Body: uploadFile,
            });

            await client.send(command);
            alert('업로드 성공!');
            fetchFiles(selectedBucket); // 업로드 후 파일 목록 새로고침
        } catch (error) {
            console.error('업로드 실패:', error);
        }
    };

    return (
        <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
            <h2>MinIO 연결 상태</h2>
            <p>{status}</p>

            {buckets.length > 0 ? (
                <>
                    <h3>버킷 목록 ({buckets.length})</h3>
                    <ul>
                        {buckets.map((bucket) => (
                            <li key={bucket.Name}>
                                <button onClick={() => fetchFiles(bucket.Name)} style={{ marginBottom: '4px' }}>
                                    {bucket.Name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            ) : status.includes('성공') ? (
                <p>버킷이 없습니다.</p>
            ) : null}

            {selectedBucket && (
                <div style={{ marginTop: 32 }}>
                    <h3>버킷 "{selectedBucket}"의 파일 리스트</h3>
                    {files.length > 0 ? (
                        <ul>
                            {files.map((file, index) => (
                                <li key={index}>
                                    {file}
                                    <button onClick={() => handleDownload(file)} style={{ marginLeft: '10px' }}>
                                        다운로드
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>파일이 없습니다.</p>
                    )}

                    <div style={{ marginTop: 20 }}>
                        <h4>파일 업로드</h4>
                        <input type="file" onChange={handleFileChange} />
                        <input
                            type="text"
                            placeholder="업로드할 경로/파일명"
                            value={uploadPath}
                            onChange={(e) => setUploadPath(e.target.value)}
                            style={{ marginLeft: '10px' }}
                        />
                        <button onClick={handleUpload} style={{ marginLeft: '10px' }}>
                            업로드
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinioManager;
