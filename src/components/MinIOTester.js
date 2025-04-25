// MinioBucketList.jsx
import React, { useEffect, useState } from 'react';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

const MinioBucketList = () => {
    const [status, setStatus] = useState('확인 중...');
    const [buckets, setBuckets] = useState([]);  // 버킷 목록 상태

    useEffect(() => {
        const client = new S3Client({
            region: 'us-east-1',
            endpoint: 'http://129.254.222.219:9010',
            credentials: {
                accessKeyId: 'minio',
                secretAccessKey: 'minio123',
            },
            forcePathStyle: true,
        });

        const fetchBuckets = async () => {
            try {
                const result = await client.send(new ListBucketsCommand({}));
                setStatus('✅ MinIO 연결 성공! 아래에 버킷 목록을 출력합니다.');
                setBuckets(result.Buckets || []);
            } catch (err) {
                console.error(err);
                setStatus(`❌ 연결 실패: ${err.name} - ${err.message}`);
            }
        };

        fetchBuckets();
    }, []);

    return (
        <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
            <h2>MinIO 연결 상태</h2>
            <p>{status}</p>

            {buckets.length > 0 ? (
                <>
                    <h3>버킷 목록 ({buckets.length})</h3>
                    <ul>
                        {buckets.map(bucket => (
                            <li key={bucket.Name}>
                                {bucket.Name} {/* 생성일이 필요하면 bucket.CreationDate.toLocaleString() 등 */}
                            </li>
                        ))}
                    </ul>
                </>
            ) : status.includes('성공') ? (
                <p>버킷이 하나도 없습니다.</p>
            ) : null}
        </div>
    );
};

export default MinioBucketList;
