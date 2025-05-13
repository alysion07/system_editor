// import { useState } from "react";
//
// export function useUndoRedo(initialState) {
//     const [document, setDocument] = useState(initialState);
//     const [undoStack, setUndoStack] = useState([initialState]);
//     const [redoStack, setRedoStack] = useState([]);
//
//     const store = () => {
//         setUndoStack(prev => [...prev, document]);
//         setRedoStack([]);
//     };
//
//     const undo = () => {
//         setUndoStack(prevUndo => {
//             if (prevUndo.length <= 1) return prevUndo;
//
//             const newUndo = prevUndo.slice(0, prevUndo.length - 1);
//             const last = prevUndo[prevUndo.length - 1];
//             setRedoStack(prevRedo => [...prevRedo, last]);
//             setDocument(newUndo[newUndo.length - 1]);
//             return newUndo;
//         });
//     };
//
//     const redo = () => {
//         setRedoStack(prevRedo => {
//             if (prevRedo.length === 0) return prevRedo;
//
//             const last = prevRedo[prevRedo.length - 1];
//             const newRedo = prevRedo.slice(0, prevRedo.length - 1);
//             setUndoStack(prevUndo => [...prevUndo, last]);
//             setDocument(last);
//             return newRedo;
//         });
//     };
//
//     return { document, setDocument, undo, redo, store };
// }
