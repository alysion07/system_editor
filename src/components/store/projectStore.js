// src/store/projectStore.js
import { create } from 'zustand';

const useProjectStore = create(set => ({
    userId: null,
    projectName: null,
    loading: false,

    setUserId: (userId) => set({ userId }),
    setProjectName: (projectName) => set({ projectName }),
    setLoading: (loading) => set({ loading }),

    reset: () => set({
        userId: null,
        projectName: null,
        loading: false
    })
}));

export default useProjectStore;
