import { useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import '../styles/ComponentPalette.css';

// Component for an individual palette item
const PaletteItem = ({ component }) => {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: `palette-${component.type}`,
        data: {
            type: 'palette-item',
            component
        }
    });

    return (
        <div
            ref={setNodeRef}
            className="palette-item"
            {...listeners}
            {...attributes}
        >
            <div className="palette-item-icon">{component.icon}</div>
            <div className="palette-item-label">{component.type}</div>
        </div>
    );
};

// Main components palette
const ComponentPalette = ({ components, setPaletteWidth }) => {
    // Group components by category
    const categories = {};

    const paletteRef = useRef(null);

    Object.values(components).forEach(component => {
        if (!categories[component.category]) {
            categories[component.category] = [];
        }
        categories[component.category].push(component);
    });

    useEffect(() => {
        const updatePaletteWidth = () => {
            if (paletteRef.current) {
                const width = paletteRef.current.getBoundingClientRect().width;
                setPaletteWidth(width);
            }
        };
        updatePaletteWidth();
        window.addEventListener('resize', updatePaletteWidth);

        return () => {
            window.removeEventListener('resize', updatePaletteWidth);
        };
    }, [setPaletteWidth]);

    return (
        <div className="component-palette" ref = {paletteRef}>
            <h2>Components</h2>

            {Object.entries(categories).map(([category, items]) => (
                <div key={category} className="palette-category">
                    <h3 className="category-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                    <div className="palette-items">
                        {items.map(component => (
                            <PaletteItem key={component.type} component={component} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ComponentPalette;