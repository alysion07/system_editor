import { S3Client, ListBucketsCommand, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// MinIO 클라이언트 생성
const client = new S3Client({
    region: 'us-east-1',
    endpoint: 'http://121.148.223.175:9010',
    credentials: {
        accessKeyId: 'minio',
        secretAccessKey: 'minio123',
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    forcePathStyle: true,
});

// 버킷 목록 가져오기
export const listBuckets = async () => {
    const command = new ListBucketsCommand({});
    const response = await client.send(command);
    return response.Buckets || [];
};

// 특정 버킷의 파일 리스트 가져오기
export const listFilesInBucket = async (bucketName) => {
    const command = new ListObjectsV2Command({ Bucket: bucketName });
    const response = await client.send(command);
    return response.Contents ? response.Contents.map(item => item.Key) : [];
};

// Presigned 다운로드 URL 생성
export const generatePresignedDownloadUrl = async (bucketName, objectKey) => {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: objectKey });
    const url = await getSignedUrl(client, command, { expiresIn: 3600 }); // 1시간 유효
    return url;
};

// 파일 업로드
export const uploadToMinio = async (bucketName, objectKey, file) => {
    // const command = new PutObjectCommand({
    //     Bucket: bucketName,
    //     Key: objectKey,
    //     Body: file,
    //     ContentType: file.type,
    //     ContentDisposition: `attachment; filename="${file.name}"`
    // });
    //
    // try {
    //     await client.send(command);
    //
    // } catch (error) {
    //     console.error('Error loading project:', error);
    //     return false;
    // }
    return true;
};