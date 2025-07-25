import { ProjectService } from './projectService';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { minioClient } from './minioClient';

describe('uploadProjectFile', () => {
    const userId = 'testUser';
    const projectName = 'testProject';
    const testFile = new File(['test content'], 'testFile.i', { type: 'text/plain' });

    it('should upload a file to the correct S3 path', async () => {
        // 파일 업로드
        await ProjectService.uploadProjectFile(userId, projectName, testFile);

        // 업로드된 파일 확인
        const prefix = `${userId}/${projectName}/`;
        const cmd = new ListObjectsV2Command({
            Bucket: 'v-smr',
            Prefix: prefix
        });
        const res = await minioClient.send(cmd);

        const uploadedFile = res.Contents.find(item => item.Key === `${prefix}${testFile.name}`);
        expect(uploadedFile).toBeDefined();
    });
});