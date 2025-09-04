// Import existing valve configurations
import CHKVLV from '../CHKVLV.js';
import TRPVLV from '../TRPVLV.js';
import INRVLV from '../INRVLV.js';
import MTRVLV from '../MTRVLV.js';
import SRVVLV from '../SRVVLV.js';
import RLFVLV from '../RLFVLV.js';

/**
 * Centralized registry for all valve type configurations
 * Provides unified access to valve-specific properties, validation, and formatting
 */
export const ValveTypeRegistry = {
    CHKVLV: {
        ...CHKVLV,
        displayName: 'Check Valve',
        shortDescription: 'One-way flow valve',
        icon: '',
        marsCardBase: '030', // CCC0301, CCC0302, etc.
        category: 'control',
        complexity: 'simple'
    },
    TRPVLV: {
        ...TRPVLV,
        displayName: 'Trip Valve',
        shortDescription: 'Trip-actuated valve',
        icon: '',
        marsCardBase: '031',
        category: 'control',
        complexity: 'moderate'
    },
    INRVLV: {
        ...INRVLV,
        displayName: 'Inertial Valve',
        shortDescription: 'Inertia-driven valve',
        icon: '️',
        marsCardBase: '032',
        category: 'dynamic',
        complexity: 'complex'
    },
    MTRVLV: {
        ...MTRVLV,
        displayName: 'Motor Valve',
        shortDescription: 'Motor-operated valve',
        icon: '',
        marsCardBase: '033',
        category: 'control',
        complexity: 'moderate'
    },
    SRVVLV: {
        ...SRVVLV,
        displayName: 'Servo Valve',
        shortDescription: 'Control system valve',
        icon: '',
        marsCardBase: '034',
        category: 'control',
        complexity: 'complex'
    },
    RLFVLV: {
        ...RLFVLV,
        displayName: 'Relief Valve',
        shortDescription: 'Pressure relief valve',
        icon: '',
        marsCardBase: '035',
        category: 'safety',
        complexity: 'complex'
    }
};

/**
 * Get valve type configuration by type key
 * @param {string} valveType - Valve type identifier
 * @returns {Object} Valve configuration object
 * @throws {Error} If valve type is not found
 */
export const getValveConfiguration = (valveType) => {
    const config = ValveTypeRegistry[valveType];
    if (!config) {
        throw new Error(`Unknown valve type: ${valveType}. Available types: ${Object.keys(ValveTypeRegistry).join(', ')}`);
    }
    return config;
};

/**
 * Get all available valve types with their basic info
 * @returns {Array} Array of valve type options for UI selection
 */
export const getValveTypeOptions = () => {
    return Object.entries(ValveTypeRegistry).map(([key, config]) => ({
        value: key,
        label: config.displayName,
        description: config.shortDescription,
        icon: config.icon,
        category: config.category,
        complexity: config.complexity
    }));
};

/**
 * Check if a valve type is valid
 * @param {string} valveType - Valve type to validate
 * @returns {boolean} True if valid valve type
 */
export const isValidValveType = (valveType) => {
    return valveType && ValveTypeRegistry.hasOwnProperty(valveType);
};

/**
 * Get default properties for a valve type
 * @param {string} valveType - Valve type
 * @returns {Object} Default properties object
 */
export const getDefaultPropertiesForType = (valveType) => {
    const config = getValveConfiguration(valveType);
    const defaults = {};
    
    // Extract default values from all tabs and cards
    if (config.properties && config.properties.tabs) {
        config.properties.tabs.forEach(tab => {
            tab.cards.forEach(card => {
                card.fields.forEach(field => {
                    if (field.default !== undefined) {
                        defaults[field.id] = field.default;
                    }
                });
            });
        });
    }
    
    return defaults;
};

/**
 * Get common properties shared across all valve types
 * @returns {Object} Common properties structure
 */
export const getCommonValveProperties = () => {
    return {
        fromConnection: '',
        toConnection: '',
        area: 0.0,
        forwardLossCoeff: 0.0,
        reverseLossCoeff: 0.0,
        junctionFlags: {
            vFlag: '0',
            cFlag: '0', 
            aFlag: '0',
            hFlag: '0',
            sFlag: '0'
        },
        initialVelocityLiquid: 0.0,
        initialVelocityVapor: 0.0
    };
};

/**
 * Generate MARS input cards for a specific valve type and data
 * @param {string} valveType - Valve type
 * @param {Object} componentData - Component data with properties
 * @returns {string} MARS input format string
 */
export const generateMarsOutput = (valveType, componentData) => {
    const config = getValveConfiguration(valveType);
    if (!config.formatters) {
        throw new Error(`No formatters available for valve type: ${valveType}`);
    }
    
    let output = '';
    
    // Generate header
    if (config.formatters.generateHeader) {
        output += config.formatters.generateHeader(componentData);
    }
    
    // Generate all format cards
    Object.keys(config.formatters).forEach(formatterName => {
        if (formatterName.startsWith('formatCard')) {
            try {
                const cardOutput = config.formatters[formatterName](componentData);
                if (cardOutput) {
                    output += cardOutput;
                }
            } catch (error) {
                console.warn(`Failed to format card ${formatterName} for valve ${valveType}:`, error);
            }
        }
    });
    
    return output;
};

/**
 * Validate valve component data against type-specific rules
 * @param {string} valveType - Valve type
 * @param {Object} componentData - Component data to validate
 * @returns {Object} Validation result with errors array
 */
export const validateValveData = (valveType, componentData) => {
    const config = getValveConfiguration(valveType);
    const errors = [];
    
    if (!config.validators) {
        return { isValid: true, errors: [] };
    }
    
    // Run all validators for this valve type
    Object.entries(config.validators).forEach(([validatorName, validator]) => {
        try {
            const isValid = validator(componentData);
            if (!isValid) {
                errors.push(`Validation failed: ${validatorName}`);
            }
        } catch (error) {
            errors.push(`Validator error: ${validatorName} - ${error.message}`);
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
};

// Export valve type constants for easy reference
export const VALVE_TYPES = Object.keys(ValveTypeRegistry);

// Export default registry as default export
export default ValveTypeRegistry;