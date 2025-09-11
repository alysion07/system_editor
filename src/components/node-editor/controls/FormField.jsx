import React from 'react';
import MeshVisualizer from './MeshVisualizer';
import TableEditor from './TableEditor';

const FormField = React.memo(({ field, value, onChange, error }) => {
    const validationProps = {};
    if (field.validation) {
        if (field.validation.min !== undefined) validationProps.min = field.validation.min;
        if (field.validation.max !== undefined) validationProps.max = field.validation.max;
    }
    if (field.required) {
        validationProps.required = true;
    }

    const commonProps = {
        id: field.id,
        value: value ?? field.default ?? '',
        onChange: (e) => onChange(field.id, e.target.value),
        className: `field-input ${error ? 'has-error' : ''}`,
        placeholder: field.placeholder || '',
        ...validationProps,
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
                        meshData={value || []}
                        leftCoordinate={parseFloat(field.leftCoordinate) || 0}
                        compositions={field.compositions || []}
                        onChange={(newMeshData) => onChange(field.id, newMeshData)}
                    />
                    {field.description && <div className="field-description" title={field.description}>{field.description}</div>}
                    {error && <div className="field-error">{error}</div>}
                </div>
            );
        case 'tableEditor':
            return (
                <div key={field.id} className="field-container">
                    <label className="field-label">{field.label}{field.required && '*'}</label>
                    <TableEditor
                        data={value || []}
                        onChange={(newData) => onChange(field.id, newData)}
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
                    onChange={(e) => onChange(field.id, e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
            );
            break;
        case 'boolean':
            inputElement = (
                <input
                    type="checkbox"
                    checked={!!value}
                    onChange={(e) => onChange(field.id, e.target.checked)}
                    className={`field-checkbox ${error ? 'has-error' : ''}`}
                />
            );
            break;
        case 'select':
            inputElement = (
                <select {...commonProps}>
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
            <div>
                <label htmlFor={field.id} className="field-label">
                    {field.label}
                    {field.required && <span className="required-marker">*</span>}
                </label>
                <div className="field-input-container">
                    {inputElement}
                    {field.unit && <span className="field-unit">{field.unit}</span>}
                </div>
            </div>
            {field.description && <div className="field-description" title={field.description}>{field.description}</div>}
            {error && <div className="field-error">{error}</div>}
            {field.helpText && <div className="field-help">{field.helpText}</div>}
        </div>
    );
});

export default FormField;
