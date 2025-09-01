# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm start` - Runs webpack dev server on port 6400 with HMR
- **Build**: `npm run build` - Production build using webpack
- **Test**: `npm test` - Jest test runner with interactive watch mode

## Architecture Overview

This is a React-based system editor application with a node-based visual interface. Key architectural components:

### Core Structure
- **React 19** with React Router for navigation
- **Webpack** custom configuration (not Create React App defaults)
- **Tailwind CSS** for styling with PostCSS processing
- **Zustand** for state management
- **ReactFlow** for node-based visual editor

### Main Application Flow
The app has 5 main routes:
- `/` - Homepage (entry point)
- `/dashboard` - Project management with AWS S3/MinIO integration
- `/task` - Task management interface
- `/nodeeditor` - Visual node editor (primary feature)
- `/projectviewer` - File preview and project viewing

### State Management
- **useFlowStore** (Zustand): Manages node editor state with undo/redo functionality, node/edge management, and drag operations
- **projectStore**: Handles project-related state and user authentication
- State follows a present/past/future pattern for undo/redo operations

### Key Components Architecture
- **NodeEditor**: Main visual editor using ReactFlow with custom node types
- **Dashboard**: Project management with file upload to S3/MinIO buckets
- **NodePalette**: Component library for dragging nodes into editor
- **NodeInspector**: Property editing panel for selected nodes
- **ProjectService**: AWS S3/MinIO integration for file storage

### File Organization
```
src/
├── components/
│   ├── dashboard/          # Project management UI
│   ├── node-editor/        # Visual editor components
│   │   ├── controls/       # Node-specific controls
│   │   └── styles/         # Component-specific CSS
│   ├── homepage/           # Landing page
│   ├── project-viewer/     # File preview components
│   └── store/              # Zustand state stores
├── services/               # External API integrations
└── utils/                  # Helper functions
```

### Custom Webpack Configuration
- Port 6400 for dev server
- Separate PostCSS processing for index.css (Tailwind) vs regular CSS files
- Buffer/stream polyfills for Node.js modules in browser
- React Fast Refresh for HMR

### AWS/MinIO Integration
- Uses AWS SDK v3 for S3 operations
- Bucket name: 'v-smr'
- User-based folder structure: `{userId}/{projectName}/`
- Presigned URLs for file uploads/downloads

## Development Notes

- The project uses a custom webpack config instead of react-scripts defaults
- HMR is configured with React Fast Refresh
- Node editor supports undo/redo with history management
- Components follow a data prop structure for node customization
- File uploads are handled through presigned S3 URLs
- The app expects MinIO/S3 credentials to be configured for file operations
- Mars Input Manual PDF 문서를 통한 @src\components\node-editor\ 리팩터링에 초점