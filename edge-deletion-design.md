# Edge Deletion Feature Design

## System Analysis

### Current State
- **ReactFlow Integration**: Uses ReactFlow library with edge management via `handleEdgesChange` callback
- **State Management**: Zustand store (`useFlowStore`) manages nodes and edges with undo/redo functionality
- **Edge Operations**: Basic edge creation via `handleConnect`, but no dedicated deletion mechanisms
- **Node Deletion**: Existing pattern deletes associated edges when nodes are removed (lines 82-84 in useFlowStore)

### Current Edge Handling
```javascript
// NodeEditor.jsx - Line 172-175
const handleEdgesChange = useCallback((changes) => {
    const updatedEdges = applyEdgeChanges(changes, edges);
    setEdges(updatedEdges);
}, [nodes, edges, flowStore]);

// useFlowStore.jsx - Line 82-84 (Node deletion pattern)
const edges = present.edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
```

## Design Specification

### 1. Edge Deletion Methods

#### 1.1 Context Menu Deletion
**Trigger**: Right-click on edge
**Behavior**: 
- Display context menu with "Delete Edge" option
- Confirm deletion with modal dialog
- Remove edge with undo/redo support

#### 1.2 Selection-Based Deletion  
**Trigger**: Click edge to select + Delete/Backspace key
**Behavior**:
- Visual selection indicator on edge
- Keyboard shortcut deletion (Delete/Backspace)
- Shift+Delete for immediate deletion without confirmation

#### 1.3 Double-Click Deletion
**Trigger**: Double-click on edge
**Behavior**:
- Immediate deletion with confirmation dialog
- Alternative quick deletion method

### 2. State Management Enhancement

#### 2.1 Edge Selection State
```javascript
// Add to useFlowStore
selectedEdgeId: null,
setSelectedEdgeId: (id) => set({ selectedEdgeId: id }),
```

#### 2.2 Edge Deletion Function
```javascript
// Add to useFlowStore
deleteEdge: (edgeId) => {
    const { present, set } = get();
    const edges = present.edges.filter((e) => e.id !== edgeId);
    set(present.nodes, edges);
    get().setSelectedEdgeId(null);
},
```

### 3. Visual Design

#### 3.1 Edge Selection Styling
```css
.react-flow__edge.selected {
    stroke: #ff6b6b !important;
    stroke-width: 3px !important;
    stroke-dasharray: 5,5;
    animation: edgeSelection 1s infinite;
}

@keyframes edgeSelection {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}
```

#### 3.2 Hover Effects
```css
.react-flow__edge:hover {
    stroke-width: 2px !important;
    cursor: pointer;
}

.react-flow__edge-path:hover {
    stroke: #4dabf7 !important;
}
```

#### 3.3 Context Menu Component
```jsx
const EdgeContextMenu = ({ x, y, edge, onDelete, onClose }) => (
    <div 
        className="edge-context-menu"
        style={{ left: x, top: y }}
        onMouseLeave={onClose}
    >
        <button onClick={() => onDelete(edge.id)}>
            🗑️ Delete Edge
        </button>
    </div>
);
```

### 4. User Interaction Flow

#### 4.1 Context Menu Flow
```
Right-click on edge → Context menu appears → Click "Delete" → 
Confirmation dialog → Edge removed → Undo/redo updated
```

#### 4.2 Keyboard Deletion Flow  
```
Click edge to select → Visual selection feedback → 
Press Delete/Backspace → Confirmation dialog → Edge removed
```

#### 4.3 Double-Click Flow
```
Double-click edge → Confirmation dialog → Edge removed → 
Toast notification "Edge deleted"
```

### 5. Implementation Components

#### 5.1 Edge Deletion Handler
```javascript
const handleEdgeDelete = useCallback((edgeId) => {
    if (window.confirm('Are you sure you want to delete this connection?')) {
        flowStore.deleteEdge(edgeId);
        setSelectedEdge(null);
        // Optional: Show toast notification
        showToast('Edge deleted successfully');
    }
}, [flowStore]);
```

#### 5.2 Edge Selection Handler
```javascript
const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation();
    setSelectedEdge(edge);
    flowStore.setSelectedEdgeId(edge.id);
}, [flowStore]);
```

#### 5.3 Keyboard Event Handler Enhancement
```javascript
// Add to existing handleKeyDown in NodeEditor.jsx
if ((event.key === 'Delete' || event.key === 'Backspace') && flowStore.selectedEdgeId) {
    if (!isInputFocused) {
        event.preventDefault();
        handleEdgeDelete(flowStore.selectedEdgeId);
    }
}
```

### 6. Integration Points

#### 6.1 ReactFlow Props Enhancement
```jsx
<ReactFlow
    // ... existing props
    onEdgeClick={onEdgeClick}
    onEdgeDoubleClick={handleEdgeDoubleClick}
    onEdgeContextMenu={handleEdgeContextMenu}
    onSelectionChange={handleSelectionChange}
    edgeTypes={edgeTypes}
    defaultEdgeOptions={{
        type: 'smoothstep',
        deletable: true, // Enable built-in deletion
        focusable: true  // Enable selection
    }}
/>
```

#### 6.2 Context Menu Integration
```javascript
const [contextMenu, setContextMenu] = useState(null);

const handleEdgeContextMenu = useCallback((event, edge) => {
    event.preventDefault();
    setContextMenu({
        x: event.clientX,
        y: event.clientY,
        edge
    });
}, []);
```

### 7. Error Handling & Edge Cases

#### 7.1 Invalid Edge References
- Validate edge exists before deletion
- Handle concurrent deletion scenarios
- Graceful degradation if edge not found

#### 7.2 Undo/Redo Integration
- Ensure edge deletion is properly recorded in history
- Maintain referential integrity during undo/redo operations

#### 7.3 Performance Considerations
- Batch edge updates when possible
- Debounce rapid deletion operations
- Optimize re-rendering during edge selection

### 8. Accessibility Features

#### 8.1 Keyboard Navigation
- Tab navigation through edges
- Space bar for selection
- Enter for context menu activation

#### 8.2 Screen Reader Support
```jsx
<div
    role="button"
    aria-label={`Delete edge from ${edge.source} to ${edge.target}`}
    tabIndex={0}
    onKeyDown={handleKeyboardActivation}
>
```

### 9. Testing Strategy

#### 9.1 Unit Tests
- Edge deletion function behavior
- State management integrity
- Undo/redo operations

#### 9.2 Integration Tests
- Full deletion workflow
- Multi-edge selection scenarios
- Error handling edge cases

#### 9.3 E2E Tests
- Complete user interaction flows
- Cross-browser compatibility
- Performance under load

### 10. Success Metrics

#### 10.1 User Experience
- Deletion operation completion time < 200ms
- Zero-click confirmation bypass with Shift key
- Consistent visual feedback across all methods

#### 10.2 Technical Performance
- No memory leaks during rapid operations
- Smooth animations and transitions
- Reliable undo/redo functionality

## Implementation Priority

**Phase 1**: Core deletion functionality with keyboard shortcuts
**Phase 2**: Context menu and visual enhancements  
**Phase 3**: Accessibility and advanced features
**Phase 4**: Performance optimization and testing

This design provides a comprehensive, user-friendly edge deletion system that integrates seamlessly with the existing ReactFlow-based node editor architecture.