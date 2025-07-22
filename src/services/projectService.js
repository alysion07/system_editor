import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
    ListBucketsCommand, ListObjectsV2Command,
    GetObjectCommand, PutObjectCommand,
    DeleteObjectCommand, DeleteObjectsCommand
} from '@aws-sdk/client-s3';
import {minioClient} from "./minioClient";

/**
 * 버킷 이름 (공통)
 */
const BUCKET_NAME = 'v-smr';

export const ProjectService = {
    // 버킷 목록 가져오기
    async listBuckets() {
        const command = new ListBucketsCommand({});
        const response = await minioClient.send(command);
        return response.Buckets || [];
    },

    /**
     * 사용자의 모든 프로젝트 목록 조회
     * @param {string} userId ex) 'user1'
     * @returns {Promise<string[]>} ex) ['projectA', 'projectB']
     */
    async listProjects(userId) {
        const prefix = `${userId}/`;
        const cmd = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: prefix
        });

        const res = await minioClient.send(cmd);
        const folders = new Set();

        (res.Contents || []).forEach(item => {
            const key = item.Key;
            const rest = key.replace(prefix, '');
            const project = rest.split('/')[0];
            if (project) folders.add(project);
        });

        return Array.from(folders);
    },
    /**
     * 프로젝트 JSON 파일 로딩
     * @param {string} userId
     * @param {string} projectName
     * @returns {Promise<Object>} flowData (nodes + edges)
     */
    async loadProjectJson(userId, projectName) {
        const objectKey = `${userId}/${projectName}/${projectName}.json`;
        const url = await this.getSignedDownloadUrl(objectKey);

        const res = await fetch(url);
        if (!res.ok) throw new Error('프로젝트 JSON을 불러오는 데 실패했습니다');

        const json = await res.json();
        if (!json.nodes || !json.edges) {
            throw new Error('유효하지 않은 프로젝트 데이터입니다');
        }

        return json;
    },
    // 프로젝트 하위 파일 전체 조회
    async listProjectFiles(userId, projectName) {
        const prefix = `${userId}/${projectName}/`;
        const cmd = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: prefix
        });

        const res = await minioClient.send(cmd);
        return (res.Contents || [])
            .map(item => item.Key)
            .filter(key => key !== prefix); // 디렉토리 자체 제외
    },

    /**
     * Presigned URL 생성
     * @param {string} objectKey ex) 'user1/projectA/projectA.json'
     */
    async getSignedDownloadUrl(objectKey) {
        const cmd = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: objectKey
        });
        return await getSignedUrl(minioClient, cmd, { expiresIn: 3600 });
    },

    /**
     * JSON 파일 업로드
     * @param {string} userId
     * @param {string} projectName
     * @param {Blob | File} file JSON Blob/File
     */
    async uploadProjectJson(userId, projectName, file) {
        const objectKey = `${userId}/${projectName}/${projectName}.json`;
        const cmd = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: objectKey,
            Body: file,
            ContentType: 'application/json',
            ContentDisposition: `attachment; filename="${projectName}.json"`
        });

        await minioClient.send(cmd);
    },

    /**
     * 프로젝트 전체 삭제 (폴더 단위)
     * @param {string} userId
     * @param {string} projectName
     */
    async deleteProject(userId, projectName) {
        const prefix = `${userId}/${projectName}/`;

        // 1. 전체 파일 조회
        const listCmd = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: prefix
        });
        const { Contents } = await minioClient.send(listCmd);

        if (!Contents || Contents.length === 0) return;

        // 2. 삭제 명령 구성
        const objects = Contents.map(item => ({ Key: item.Key }));
        const deleteCmd = new DeleteObjectsCommand({
            Bucket: BUCKET_NAME,
            Delete: { Objects: objects }
        });

        await minioClient.send(deleteCmd);
    },

    /**
     * 단일 파일 삭제
     * @param {string} key 전체 경로 ex) 'user1/projectA/file.txt'
     */
    async deleteFile(key) {
        const delCmd = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key
        });
        await minioClient.send(delCmd);
    }
};

/*
// 버킷 목록 가져오기
export const listBuckets = async () => {
    const command = new ListBucketsCommand({});
    const response = await minioClient.send(command);
    return response.Buckets || [];
};

// 특정 버킷의 파일 리스트 가져오기
export const listFilesInBucket = async (bucketName) => {
    const command = new ListObjectsV2Command({ Bucket: bucketName });
    const response = await minioClient.send(command);
    return response.Contents ? response.Contents.map(item => item.Key) : [];
};

// 폴더(프리픽스) 하위 파일 리스트 가져오기
export const listFilesInFolder = async (bucketName, folderPath) => {
    const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: folderPath, // 예: 'user/project/'
        Delimiter: '',      // 하위 폴더까지 모두 조회하려면 빈 문자열
    });
    const response = await minioClient.send(command);
    return response.Contents
        ? response.Contents
            .filter(item => item.Key !== folderPath) // 폴더 자신 제외
            .map(item => item.Key)
        : [];
};

// Presigned 다운로드 URL 생성
export const generatePresignedDownloadUrl = async (bucketName, objectKey) => {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: objectKey });
    const url = await getSignedUrl(minioClient, command, { expiresIn: 3600 }); // 1시간 유효
    return url;
};

*/
