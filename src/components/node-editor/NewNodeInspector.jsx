import React, { useState, useEffect } from 'react';
import FormField from './controls/FormField';
import './styles/NodeInspector.css'; // 기존 CSS 재사용

const NewNodeInspector = ({ node, componentDefinition, onPropertyChange }) => {
    const [activeTab, setActiveTab] = useState(null);
    const [formValues, setFormValues] = useState({});

    // 선택된 노드가 변경되면 로컬 상태를 props에서 받은 값으로 동기화합니다.
    useEffect(() => {
        if (node) {
            setFormValues(node.data.componentProp || {});
            // 탭 상태도 초기화
            setActiveTab(componentDefinition?.properties?.tabs?.[0]?.id || null);
        } else {
            setFormValues({});
            setActiveTab(null);
        }
    }, [node, componentDefinition]);

    if (!node || !componentDefinition) {
        return (
            <div className="node-inspector empty-state">
                <p>Select a node to edit its properties</p>
            </div>
        );
    }

    const handleFieldChange = (key, value) => {
        // 1. UI에 즉시 반영하기 위해 로컬 상태를 업데이트합니다.
        setFormValues(prev => ({ ...prev, [key]: value }));
        // 2. Debounce가 적용된 전역 상태 업데이트를 호출합니다.
        onPropertyChange(node.id, key, value);
    };

    const renderCard = (card) => (
        <div key={card.id} className="inspector-card">
            <div className="card-header">
                <h3 className="card-title">{card.label}</h3>
                {card.description && <p className="card-description">{card.description}</p>}
            </div>
            <div className="card-body">
                {card.fields.map(field => (
                    <FormField
                        key={field.id}
                        field={field}
                        value={formValues[field.id]}
                        onChange={handleFieldChange}
                        // error={errors[field.id]} // 에러 처리 로직은 필요시 추가
                    />
                ))}
            </div>
        </div>
    );

    const renderTabContent = (tab) => (
        <div
            key={`content-${tab.id}`}
            className={`tab-content ${activeTab === tab.id ? 'active' : ''}`}
        >
            {tab.cards.map(renderCard)}
        </div>
    );

    return (
        <div className="node-inspector">
            <div className="inspector-header">
                <h2 className="component-title">{componentDefinition.label}</h2>
                <div className="component-type">{node.data.componentType}</div>
                <p className="component-description">{componentDefinition.description}</p>

                <div className="component-identification">
                     <div className="field-container">
                        <label htmlFor="componentNumber">Component Number</label>
                        <input
                            id="componentNumber"
                            type="text"
                            value={formValues.componentNumber || node.compNumber || ''}
                            onChange={(e) => handleFieldChange('componentNumber', e.target.value)}
                            placeholder="e.g., 120"
                        />
                    </div>
                    <div className="field-container">
                        <label htmlFor="componentName">Component Name</label>
                        <input
                            id="componentName"
                            type="text"
                            value={formValues.name || node.compName || ''}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            placeholder="e.g., inlet_volume"
                        />
                    </div>
                </div>
            </div>

            {componentDefinition.properties.tabs?.length > 0 && (
                <div className="inspector-tabs">
                    <div className="tab-nav">
                        {componentDefinition.properties.tabs.map(tab => (
                            <button
                                key={`tab-${tab.id}`}
                                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="tab-container">
                        {componentDefinition.properties.tabs.map(renderTabContent)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewNodeInspector;
