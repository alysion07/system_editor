import React, { useState, useEffect, useCallback } from 'react';
import FormField from './controls/FormField';
import './styles/NodeInspector.css';

const NewNodeInspector = ({ node, componentDefinition, onPropertyChange }) => {
    const [activeTab, setActiveTab] = useState(null);
    const [formValues, setFormValues] = useState({});
    const [errors, setErrors] = useState({});

    const validateField = useCallback((fieldId, value, allValues) => {
        let fieldDef;
        componentDefinition.properties.tabs.forEach(tab => {
            tab.cards.forEach(card => {
                const foundField = card.fields.find(f => f.id === fieldId);
                if (foundField) {
                    fieldDef = foundField;
                }
            });
        });

        if (!fieldDef) return null;

        if (fieldDef.required && (value === '' || value === null || value === undefined)) {
            return `${fieldDef.label} is a required field.`
        }

        const numValue = parseFloat(value);
        if (fieldDef.validation) {
            if (fieldDef.validation.min !== undefined && numValue < fieldDef.validation.min) {
                return `${fieldDef.label} must be at least ${fieldDef.validation.min}.`;
            }
            if (fieldDef.validation.max !== undefined && numValue > fieldDef.validation.max) {
                return `${fieldDef.label} cannot be more than ${fieldDef.validation.max}.`;
            }
            if (fieldDef.validation.custom) {
                const validatorFn = componentDefinition.validators?.[fieldDef.validation.custom];
                if (validatorFn && !validatorFn(value, allValues)) {
                    return `Invalid value for ${fieldDef.label}. Please check the constraints.`;
                }
            }
        }

        return null;
    }, [componentDefinition]);

    useEffect(() => {
        if (node && componentDefinition) {
            const initialValues = node.data.componentProp || {};
            setFormValues(initialValues);
            setActiveTab(componentDefinition.properties.tabs?.[0]?.id || null);

            const newErrors = {};
            Object.keys(initialValues).forEach(key => {
                const error = validateField(key, initialValues[key], initialValues);
                if (error) {
                    newErrors[key] = error;
                }
            });
            setErrors(newErrors);
        } else {
            setFormValues({});
            setErrors({});
            setActiveTab(null);
        }
    }, [node, componentDefinition, validateField]);

    if (!node || !componentDefinition) {
        return (
            <div className="node-inspector empty-state">
                <p>Select a node to edit its properties</p>
            </div>
        );
    }

    const handleFieldChange = (key, value) => {
        const newValues = { ...formValues, [key]: value };
        setFormValues(newValues);

        const errorMessage = validateField(key, value, newValues);
        setErrors(prevErrors => ({ ...prevErrors, [key]: errorMessage }));

        onPropertyChange(node.id, key, value);
    };

    const renderCard = (card) => {
        if (card.conditionalDisplay) {
            const { field, value } = card.conditionalDisplay;
            if (formValues[field] !== value) {
                return null;
            }
        }

        return (
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
                            error={errors[field.id]}
                        />
                    ))}
                </div>
            </div>
        );
    };

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
