// src/store/projectStore.js
import { create } from 'zustand';

const useProjectStore = create(set => ({
    userId: null,
    projectName: null,
    projectMetadata: null, // Stores system type, description, etc.
    analysisStatus: 'pending', // pending | running | completed | error
    loading: false,

    setUserId: (userId) => {
        set({ userId })
        console.log("userid: ", userId)
    },
    setProjectName: (projectName) => set({ projectName }),
    setProjectMetadata: (metadata) => set({ projectMetadata: metadata }),
    setAnalysisStatus: (status) => set({ analysisStatus: status }),
    setLoading: (loading) => set({ loading }),

    // Set complete project info at once
    setProjectInfo: ({ userId, projectName, metadata, analysisStatus }) => set({
        userId,
        projectName,
        projectMetadata: metadata,
        analysisStatus: analysisStatus || 'pending'
    }),

    reset: () => set({
        userId: null,
        projectName: null,
        projectMetadata: null,
        analysisStatus: 'pending',
        loading: false
    })
}));

export default useProjectStore;
