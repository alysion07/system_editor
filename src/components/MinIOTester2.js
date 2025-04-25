// MinioTextFileUploader.jsx
import React, { useState } from 'react';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const BUCKET_NAME = 'v-smr';       // 실제 버킷 이름으로 변경
const PREFIX = 'user1/project1';              // 업로드 경로

// MinIO용 S3Client 인스턴스 (한 번만 생성해도 OK)
const s3Client = new S3Client({
    region: 'us-east-1',                        // MinIO는 region 체크 안 하지만 필수값
    endpoint: 'http://129.254.222.219:9010',
    credentials: {
        accessKeyId: 'minio',
        secretAccessKey: 'minio123',
    },
    forcePathStyle: true,                       // path-style 요청 강제
});

export const MinioTextFileUploader = () => {
    const [status, setStatus] = useState('텍스트 파일을 선택하세요.');

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            setStatus('❌ 파일이 선택되지 않았습니다.');
            return;
        }
        if (file.type !== 'text/plain') {
            setStatus('❌ 텍스트 파일(.txt)만 업로드 가능합니다.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const textContent = e.target.result;          // 파일 내 문자열
                const objectKey = `${PREFIX}/${file.name}`;   // user1/project1/파일명.txt
                setStatus(`업로드 중… (${objectKey})`);

                await s3Client.send(new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: objectKey,
                    Body: textContent,                         // 문자열 그대로 전송
                    ContentType: 'text/plain; charset=utf-8',
                }));

                setStatus(`✅ 업로드 성공! (${objectKey})`);
            } catch (err) {
                console.error(err);
                setStatus(`❌ 업로드 실패: ${err.name} - ${err.message}`);
            }
        };

        reader.onerror = () => {
            setStatus('❌ 파일 읽기 오류가 발생했습니다.');
        };
        reader.readAsText(file, 'UTF-8');  // 텍스트 모드로 읽기 시작
    };

    return (
        <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
            <h2>MinIO 텍스트 파일 업로드</h2>
            <input
                type="file"
                accept=".txt"
                onChange={handleFileChange}
            />
            <p>{status}</p>
        </div>
    );
};
