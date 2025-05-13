import React from "react";

const FieldRenderer = ({ field, value, onChange, error }) => {
    // 필드 타입에 따른 렌더링
    const renderField = () => {
        switch (field.type) {
            case 'number':
                return (
                    <div className="form-field">
                        <label htmlFor={field.id}>
                            {field.label}
                            {field.required && <span className="required-mark">*</span>}
                        </label>
                        <div className="input-container">
                            <input
                                type="number"
                                id={field.id}
                                value={value || ''}
                                onChange={(e) => onChange(e.target.value)}
                                placeholder={field.placeholder || ''}
                                className={error ? 'error' : ''}
                            />
                            {field.unit && <span className="unit">{field.unit}</span>}
                        </div>
                        {field.helpText && <div className="help-text">{field.helpText}</div>}
                        {error && <div className="error-message">{error}</div>}
                    </div>
                );

            case 'boolean':
                return (
                    <div className="switch-container">
                        <div className="switch-label">
                            <label htmlFor={field.id}>
                                {field.label}
                                {field.required && <span className="required-mark">*</span>}
                            </label>
                            {field.helpText && <div className="help-text">{field.helpText}</div>}
                        </div>
                        <input
                            type="checkbox"
                            id={field.id}
                            checked={value || false}
                            onChange={(e) => onChange(e.target.checked)}
                        />
                        {error && <div className="error-message">{error}</div>}
                    </div>
                );

            case 'select':
                return (
                    <div className="form-field">
                        <label htmlFor={field.id}>
                            {field.label}
                            {field.required && <span className="required-mark">*</span>}
                        </label>
                        <select
                            id={field.id}
                            value={value || field.default || ''}
                            onChange={(e) => onChange(e.target.value)}
                            className={error ? 'error' : ''}
                        >
                            {field.options.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {field.helpText && <div className="help-text">{field.helpText}</div>}
                        {error && <div className="error-message">{error}</div>}
                    </div>
                );

            default:
                return (
                    <div className="form-field">
                        <label htmlFor={field.id}>
                            {field.label}
                            {field.required && <span className="required-mark">*</span>}
                        </label>
                        <input
                            type="text"
                            id={field.id}
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder={field.placeholder || ''}
                            className={error ? 'error' : ''}
                        />
                        {field.helpText && <div className="help-text">{field.helpText}</div>}
                        {error && <div className="error-message">{error}</div>}
                    </div>
                );
        }
    };

    return renderField();
};


const ComponentTab = ({ tab, formData, onChange, validateField, isFieldVisible }) => {
    return (
        <div className="component-tab">
            {tab.cards.map(card => (
                <div key={card.id} className="component-card">
                    <h3 className="card-title">{card.label}</h3>
                    {card.description && <p className="card-description">{card.description}</p>}

                    <div className="card-content">
                        {card.fields.map(field => {
                            // 조건부 표시 필드 처리
                            if (!isFieldVisible(field, formData)) {
                                return null;
                            }

                            return (
                                <FieldRenderer
                                    key={field.id}
                                    field={field}
                                    value={formData[field.id]}
                                    onChange={value => onChange(field.id, value)}
                                    error={validateField(field, formData[field.id], formData)}
                                />
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
export default ComponentTab;
