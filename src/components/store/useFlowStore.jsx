import { create } from 'zustand';

const initialNodes = [ /* ... */ ];
const initialEdges = [];

const useFlowStore = create((set, get) => ({
    past: [],
    present: { nodes: initialNodes, edges: initialEdges },
    future: [],
    selectedNodeId: null,
    canUndo: false,
    canRedo: false,
    dragStartNodes: null,

    set: (nodes, edges) => {

        const { past, present} = get();
            set({
                past: [...past, present],
                present: { nodes, edges },
                future: [],
                canUndo: true,
                canRedo: false,
            });
        console.log( 'set', past.length)
    },
    undo: () => {
        const { past, present, future } = get();
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, -1);
        set({
            past: newPast,
            present: previous,
            future: [present, ...future],
            canUndo: newPast.length > 0,
            canRedo: true,

        });
    },
    redo: () => {
        const { past, present, future } = get();
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);
        set({
            past: [...past, present],
            present: next,
            future: newFuture,
            canUndo: true,
            canRedo: newFuture.length > 0,
        });
        console.log(newFuture.length)
    },
    addNode: () => {
        const { present, set } = get();
        const newNode = {
            id: `${+new Date()}`,
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { label: '새 노드' },
            type: 'default',
        };
        set([...present.nodes, newNode], present.edges);
    },
    dropNode: (type, position) => {
        const { present, set } = get();
        const newNode = {
            id: `${+new Date()}`,
            type: 'node',
            position,
            xPos: position.x,
            yPos: position.y,
            data: { label: type, componentType: type },
        };
        set([...present.nodes, newNode], present.edges);
    },
    deleteSelectedNode: () => {
        const state = get();
        const { present, selectedNodeId } = state;
        if (!selectedNodeId) return;
        const nodes = present.nodes.filter((n) => n.id !== selectedNodeId);
        const edges = present.edges.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId);
        state.set(nodes, edges);
        set({ selectedNodeId: null });
    },
    setSelectedNodeId: (id) => set({ selectedNodeId: id }),

    setNodeDragStart: (event, node, nodes) => {
        const dragPositions = {};

        if (node) {
            dragPositions[node.id] = { ...(node.position) };
        }

        set({ dragStartNodes: dragPositions });
    },

    handleNodeDragStop: (draggedNode) => {
        const { dragStartNodes, present } = get();

        if (dragStartNodes && draggedNode && dragStartNodes[draggedNode.id]) {
            const startPosition = dragStartNodes[draggedNode.id];

            if (startPosition.x !== draggedNode.position.x || startPosition.y !== draggedNode.position.y) {
                const updatedNodes = present.nodes.map(node =>
                    node.id === draggedNode.id ? { ...node, position: draggedNode.position } : node
                );

                // 직접 set 함수 호출
                get().set(updatedNodes, present.edges);
            }
        }

        // 항상 드래그 시작 상태 초기화
        set({ dragStartNodes: null });
    },

    updateNodeProp: (nodeId, key, value) => {
        const { present, set } = get();
        const updatedNodes = present.nodes.map(node =>
            node.id === nodeId
                ? {
                    ...node,
                    data: {
                        ...node.data,
                        componentProp: {
                            ...node.data.componentProp,
                            [key]: value,
                        },
                    },
                }
                : node
        );
        set(updatedNodes, present.edges);
    },

    // 다이어그램 Import 함수 추가
    importFlow: (flowData) => {
        const { past, present } = get();

        // 히스토리에 현재 상태 추가
        set({
            past: [...past, present],
            present: {
                nodes: flowData.nodes || [],
                edges: flowData.edges || []
            },
            future: [],
            canUndo: true,
            canRedo: false,
            selectedNodeId: null, // 선택 초기화
            dragStartNodes: null, // 드래그 상태 초기화
        });

        console.log('다이어그램을 성공적으로 불러왔습니다.');
    },

}));

export default useFlowStore;