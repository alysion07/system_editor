import { S3Client } from '@aws-sdk/client-s3';

export const minioClient = new S3Client({
// MinIO 클라이언트 생성
    region: 'us-east-1',
    endpoint: 'http://129.254.222.219:9010',
    credentials: {
        accessKeyId: 'minio',
        secretAccessKey: 'minio123',
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    forcePathStyle: true,
});
