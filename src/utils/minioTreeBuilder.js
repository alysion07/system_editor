export function buildTreeFromS3Keys(fileList, basePrefix = '') {
    const tree = {};

    fileList.forEach(item => {
        const fullPath = typeof item === 'string' ? item : (item.Key || item.Prefix || '');
        if (!fullPath.startsWith(basePrefix)) return;

        // prefix 제거
        const relativePath = fullPath.slice(basePrefix.length).replace(/^\/+/, '');
        if (!relativePath) return;

        const parts = relativePath.split('/');
        let current = tree;

        parts.forEach((part, idx) => {
            const isLast = idx === parts.length - 1;
            if (isLast) {
                current[part] = '__file__';
            } else {
                if (!current[part]) current[part] = {};
                current = current[part];
            }
        });
    });

    // console.log("tree list : ", tree);
    return tree;
}
