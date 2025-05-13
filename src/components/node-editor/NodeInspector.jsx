import React, { useState, useEffect } from 'react';
import MeshVisualizer from './controls/MeshVisualizer.jsx'; // 특수 컴포넌트 임포트
import TableEditor from './controls/TableEditor.jsx';
import './styles/NodeInspector.css'

/**
 * Component that renders a property editor for the selected node
 * @param {Object} selectedNode - The currently selected node
 * @param {Object} componentTypes - Available component type definitions
 * @param {Function} onPropertyChange - Callback for property changes
 */
const NodeInspector = ({ selectedNode, componentTypes, onPropertyChange }) => {
    // Local state to manage form values
    const [formValues, setFormValues] = useState({});
    // Track active tab
    const [activeTab, setActiveTab] = useState(null);
    // Track validation errors
    const [errors, setErrors] = useState({});

    // 선택된 노드가 변경될 때 폼 상태 초기화
    useEffect(() => {
        if (selectedNode) {
            // 노드 데이터로 폼 초기화
            setFormValues(selectedNode.data?.value || {});
            
            // 기본 활성 탭 설정
            const componentType = selectedNode.data?.componentType;
            const componentDef = componentTypes[componentType];
            if (componentDef?.properties?.tabs?.length > 0) {
                setActiveTab(componentDef.properties.tabs[0].id);
            }
        } else {
            // 노드가 선택되지 않은 경우 초기화
            setFormValues({});
            setActiveTab(null);
        }

        // 오류 상태 초기화
        setErrors({});
    }, [selectedNode, componentTypes]);

    // If no node is selected, show empty state
    if (!selectedNode) {
        return (
            <div className="node-inspector empty-state">
                <p>Select a node to edit its properties</p>
            </div>
        );
    }

    // Get component definition for the selected node
    const componentType = selectedNode.data?.componentType;
    const componentDef = componentTypes[componentType];

    // If component definition is not found, show error
    if (!componentDef) {
        return (
            <div className="node-inspector error-state">
                <p>Component type '{componentType}' not found in definitions</p>
            </div>
        );
    }

    /**
     * Handle field value change
     * @param {string} fieldId - ID of the field being changed
     * @param {any} value - New value for the field
     */
    const handleFieldChange = (fieldId, value) => {
        // Update local form state
        setFormValues(prev => {
            const newValues = { ...prev, [fieldId]: value };

            // Process automatic calculations based on related fields
            const updatedValues = processRelatedFields(fieldId, newValues, componentDef);

            // Validate the updated field
            validateField(fieldId, updatedValues[fieldId], updatedValues);

            return updatedValues;
        });

        //TODO 발생 오류 확인 필요 'Uncaught TypeError: onPropertyChange is not a function'
        // 상태 업데이트 후 부모 컴포넌트에 알림 (React 이벤트 핸들러 내에서 안전하게 호출)
        // 이 시점에서 formValues는 아직 업데이트되지 않은 상태이므로 직접 값을 전
        onPropertyChange(selectedNode.id, fieldId, value);
    };

    /**
     * Process calculations for related fields
     * @param {string} changedFieldId - ID of the field that changed
     * @param {Object} values - Current form values
     * @param {Object} componentDef - Component definition
     * @returns {Object} Updated form values
     */
    const processRelatedFields = (changedFieldId, values, componentDef) => {
        const updatedValues = { ...values };
        const relatedFieldsToUpdate = [];

        // Look through all tabs and cards to find fields related to the changed field
        componentDef.properties.tabs.forEach(tab => {
            tab.cards.forEach(card => {
                card.fields.forEach(field => {
                    // Check if field has relatedFields and if the changed field is one of them
                    if (field.relatedFields && field.relatedFields.includes(changedFieldId)) {
                        // Handle specific calculated fields
                        if (field.id === 'volume' && values.area && values.length) {
                            updatedValues.volume = (values.area * values.length).toFixed(6);
                            relatedFieldsToUpdate.push({
                                id: field.id,
                                value: updatedValues.volume
                            });
                        }

                        // Other automatic calculations can be added here
                    }
                });
            });
        });

        // 계산된 필드들을 비동기적으로 부모에게 알리기 위해 setTimeout 사용
        if (relatedFieldsToUpdate.length > 0) {
            setTimeout(() => {
                relatedFieldsToUpdate.forEach(field => {
                    onPropertyChange(selectedNode.id, field.id, field.value);
                });
            }, 0);
        }

        return updatedValues;
    };

    /**
     * Validate a field value
     * @param {string} fieldId - ID of the field to validate
     * @param {any} value - Value to validate
     * @param {Object} allValues - All current form values
     * @returns {boolean} True if valid
     */
    const validateField = (fieldId, value, allValues) => {
        // 필드 정의 찾기
        let fieldDef = null;

        // 모든 탭과 카드를 검색하여 필드 찾기
        outer: for (const tab of componentDef.properties.tabs) {
            for (const card of tab.cards) {
                for (const field of card.fields) {
                    if (field.id === fieldId) {
                        fieldDef = field;
                        break outer;
                    }
                }
            }
        }

        if (!fieldDef) return true; // 필드 정의를 찾지 못한 경우 유효한 것으로 간주

        let errorMessage = null;

        // 필수 필드 검증
        if (fieldDef.required && (value === undefined || value === null || value === '')) {
            errorMessage = 'This field is required';
        }

        // 검증 규칙
        if (!errorMessage && fieldDef.validation) {
            const { min, max, custom } = fieldDef.validation;

            // 숫자 검증
            if (fieldDef.type === 'number') {
                const numValue = parseFloat(value);

                if (!isNaN(numValue)) {
                    if (min !== undefined && numValue < min) {
                        errorMessage = `Value must be at least ${min}`;
                    } else if (max !== undefined && numValue > max) {
                        errorMessage = `Value must be at most ${max}`;
                    }
                } else if (value !== '') {
                    errorMessage = 'Value must be a number';
                }
            }

            // 사용자 정의 검증
            if (!errorMessage && custom && componentDef.validators && componentDef.validators[custom]) {
                const isValid = componentDef.validators[custom](value, allValues);
                if (!isValid) {
                    errorMessage = `${fieldDef.label} is invalid`;
                }
            }
        }

        // 비동기적으로 오류 상태 업데이트
        setTimeout(() => {
            setErrors(prev => {
                if (errorMessage) {
                    return { ...prev, [fieldId]: errorMessage };
                } else {
                    const newErrors = { ...prev };
                    delete newErrors[fieldId];
                    return newErrors;
                }
            });
        }, 0);

        return !errorMessage;
    };

    /**
     * Check if a field should be visible based on conditional display rules
     * @param {Object} field - Field definition
     * @param {Object} values - Current form values
     * @returns {boolean} True if field should be visible
     */
    const isFieldVisible = (field, values) => {
        if (!field.conditionalDisplay) return true;

        const { field: condField, value: condValue } = field.conditionalDisplay;
        return values[condField] === condValue;
    };

    /**
     * Render a field based on its type
     * @param {Object} field - Field definition
     * @returns {JSX.Element} Rendered field
     */
    const renderField = (field) => {
        // Skip rendering if field should not be visible
        if (!isFieldVisible(field, formValues)) return null;

        const fieldValue = formValues[field.id] ?? field.default ?? '';
        const error = errors[field.id];

        // // 특수 컴포넌트 처리
        // if (field.type === 'meshVisualizer') {
        //
        // }

        const commonProps = {
            id: field.id,
            value: fieldValue,
            onChange: (e) => handleFieldChange(field.id, e.target.value),
            className: `field-input ${error ? 'has-error' : ''}`,
            placeholder: field.placeholder || '',
        };

        let inputElement;

        switch (field.type) {
            case 'meshVisualizer':
                return (
                    <div key={field.id} className="field-container special-field">
                        <label htmlFor={field.id} className="field-label">
                            {field.label}
                            {field.required && <span className="required-marker">*</span>}
                        </label>

                        <MeshVisualizer
                            meshData={formValues.meshData || []}
                            leftCoordinate={parseFloat(formValues.leftCoordinate) || 0}
                            compositions={field.compositions || []}
                            onChange={(newMeshData) => {
                                // 메시 데이터 업데이트
                                handleFieldChange('meshData', newMeshData);
                            }}
                        />

                        {field.description && (
                            <div className="field-description" title={field.description}>
                                {field.description}
                            </div>
                        )}

                        {error && <div className="field-error">{error}</div>}
                    </div>
                );
            case 'tableEditor':
                return (
                    <div key={field.id} className="field-container">
                        <label className="field-label">{field.label}{field.required && '*'}</label>
                        <TableEditor
                            data={fieldValue || []}
                            onChange={(newData) => handleFieldChange(field.id, newData)}
                            config={field.config || {}}
                        />
                        {field.description && <div className="field-description">{field.description}</div>}
                        {error && <div className="field-error">{error}</div>}
                    </div>
                );
            case 'number':
                inputElement = (
                    <input
                        type="number"
                        step="any"
                        {...commonProps}
                        onChange={(e) => handleFieldChange(field.id, e.target.value === '' ? '' : parseFloat(e.target.value))}
                    />
                );
                break;

            case 'boolean':
                inputElement = (
                    <input
                        type="checkbox"
                        checked={!!fieldValue}
                        onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                        className={`field-checkbox ${error ? 'has-error' : ''}`}
                    />
                );
                break;

            case 'select':
                inputElement = (
                    <select
                        {...commonProps}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    >
                        {field.options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
                break;

            default: // text
                inputElement = <input type="text" {...commonProps} />;
        }

        return (
            <div key={field.id} className="field-container">
                <label htmlFor={field.id} className="field-label">
                    {field.label}
                    {field.required && <span className="required-marker">*</span>}
                </label>

                <div className="field-input-container">
                    {inputElement}
                    {field.unit && <span className="field-unit">{field.unit}</span>}
                </div>

                {field.description && (
                    <div className="field-description" title={field.description}>
                        {field.description}
                    </div>
                )}

                {error && <div className="field-error">{error}</div>}

                {field.helpText && <div className="field-help">{field.helpText}</div>}
            </div>
        );
    };

    /**
     * Render a card with its fields
     * @param {Object} card - Card definition
     * @returns {JSX.Element} Rendered card
     */
    const renderCard = (card) => {
        // Skip rendering if card has a conditional display and should not be shown
        if (card.conditionalDisplay) {
            const { field, value } = card.conditionalDisplay;
            if (formValues[field] !== value) return null;
        }

        return (
            <div key={card.id} className="inspector-card">
                <div className="card-header">
                    <h3 className="card-title">{card.label}</h3>
                    {card.description && <p className="card-description">{card.description}</p>}
                </div>

                <div className="card-body">
                    {card.fields.map(field => renderField(field))}
                </div>
            </div>
        );
    };

    /**
     * Render tab content (cards)
     * @param {Object} tab - Tab definition
     * @returns {JSX.Element} Rendered tab content
     */
    const renderTabContent = (tab) => {
        return (
            <div
                key={`content-${tab.id}`}
                className={`tab-content ${activeTab === tab.id ? 'active' : ''}`}
            >
                {tab.cards.map(card => renderCard(card))}
            </div>
        );
    };

    return (
        <div className="node-inspector">
            <div className="inspector-header">
                <h2 className="component-title">{componentDef.label}</h2>
                <div className="component-type">{componentType}</div>
                <p className="component-description">{componentDef.description}</p>

                {/* Component ID and Name fields */}
                <div className="component-identification">
                    <div className="field-container">
                        <label htmlFor="componentNumber">Component Number</label>
                        <input
                            id="componentNumber"
                            type="text"
                            value={selectedNode.compNumber || ''}
                            onChange={(e) => handleFieldChange('componentNumber', e.target.value)}
                            placeholder="e.g., 120"
                        />
                    </div>

                    <div className="field-container">
                        <label htmlFor="componentName">Component Name</label>
                        <input
                            id="componentName"
                            type="text"
                            value={formValues.name || selectedNode.compName || ''}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            placeholder="e.g., inlet_volume"
                        />
                    </div>
                </div>
            </div>

            {/* Tab navigation */}
            {componentDef.properties.tabs?.length > 0 && (
                <div className="inspector-tabs">
                    <div className="tab-nav">
                        {componentDef.properties.tabs.map(tab => (
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
                        {componentDef.properties.tabs.map(tab => renderTabContent(tab))}
                    </div>
                </div>
            )}

            {/* Validation summary */}
            {Object.keys(errors).length > 0 && (
                <div className="validation-summary">
                    <h4>Please fix the following errors:</h4>
                    <ul>
                        {Object.entries(errors).map(([fieldId, message]) => (
                            <li key={fieldId}>
                                {findFieldLabel(fieldId, componentDef)}: {message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

/**
 * Helper function to find a field's label by ID
 * @param {string} fieldId - ID of the field
 * @param {Object} componentDef - Component definition
 * @returns {string} Field label or field ID if not found
 */
function findFieldLabel(fieldId, componentDef) {
    for (const tab of componentDef.properties.tabs) {
        for (const card of tab.cards) {
            for (const field of card.fields) {
                if (field.id === fieldId) {
                    return field.label;
                }
            }
        }
    }
    return fieldId;
}

export default NodeInspector;