import { ValveTypeRegistry, getValveConfiguration, getValveTypeOptions, getCommonValveProperties } from './valve/ValveTypeRegistry.js';

/**
 * Unified VALVE component that consolidates all valve types into a single component
 * with dynamic type selection and property rendering
 */
const UnifiedValve = {
    type: 'VALVE',
    label: 'VALVE',
    icon: 'VALVE',
    description: '다양한 타입의 밸브 컴포넌트 - 배치 후 타입을 선택하세요',
    category: 'hydro',
    
    // Unified ports configuration (same for all valve types)
    ports: {
        inputs: [
            { 
                id: 'inlet', 
                label: 'Inlet (Face 1)', 
                position: 'left', 
                marsCode: 1, 
                connectionType: 'fluid',
                description: '밸브 입구 (강제 입구)'
            }
        ],
        outputs: [
            { 
                id: 'outlet', 
                label: 'Outlet (Face 2)', 
                position: 'right', 
                marsCode: 2, 
                connectionType: 'fluid',
                description: '밸브 출구 (강제 출구)'
            }
        ]
    },
    
    // Default data structure for new valve nodes
    defaultData: {
        // Valve type selection (required)
        valveType: '', // Initially unselected
        
        // Common properties across all valve types
        ...getCommonValveProperties(),
        
        // Metadata for unified valve management
        meta: {
            typeSelected: false,
            createdAt: null,
            lastTypeChange: null,
            version: '2.0' // Version 2.0 indicates unified valve
        }
    },
    
    // Main properties configuration with dynamic type selection
    properties: {
        tabs: [
            {
                id: "valve_type_selection",
                label: "밸브 타입",
                priority: 1, // Always first tab
                description: "밸브의 동작 특성을 결정하는 타입을 선택하세요",
                cards: [
                    {
                        id: "type_selector",
                        label: "밸브 타입 선택",
                        description: "원하는 밸브의 동작 방식에 맞는 타입을 선택하세요.",
                        urgent: true, // Indicates this should be completed first
                        fields: [
                            {
                                id: "valveType",
                                label: "밸브 타입",
                                type: "select",
                                required: true,
                                placeholder: "밸브 타입을 선택하세요",
                                description: "밸브의 동작 특성을 결정합니다",
                                helpText: "타입 선택 후 해당 밸브의 상세 설정이 표시됩니다",
                                options: [
                                    { value: "", label: "-- 타입을 선택하세요 --" },
                                    ...getValveTypeOptions().map(option => ({
                                        value: option.value,
                                        label: `${option.icon} ${option.label}`,
                                        description: option.description,
                                        category: option.category
                                    }))
                                ],
                                onChange: "handleValveTypeChange" // Special handler identifier
                            }
                        ]
                    },
                    {
                        id: "type_info",
                        label: "선택된 타입 정보",
                        description: "현재 선택된 밸브 타입의 상세 정보",
                        conditionalDisplay: {
                            field: "valveType",
                            condition: "notEmpty"
                        },
                        fields: [
                            {
                                id: "selectedTypeInfo",
                                label: "타입 정보",
                                type: "info",
                                readonly: true,
                                computed: true,
                                computeValue: (formData) => {
                                    if (!formData.valveType) return "타입이 선택되지 않았습니다";
                                    
                                    try {
                                        const config = getValveConfiguration(formData.valveType);
                                        return {
                                            name: config.displayName,
                                            description: config.description,
                                            complexity: config.complexity,
                                            category: config.category,
                                            icon: config.icon
                                        };
                                    } catch (error) {
                                        return "타입 정보를 불러올 수 없습니다";
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },
    
    // Dynamic property resolution based on selected valve type
    getDynamicProperties: function(valveType) {
        if (!valveType) {
            return this.properties; // Return base properties with type selection only
        }
        
        try {
            const typeConfig = getValveConfiguration(valveType);
            
            // Merge base type selection tab with valve-specific tabs
            return {
                tabs: [
                    // Keep the type selection tab as first tab
                    this.properties.tabs[0],
                    // Add valve-specific tabs
                    ...typeConfig.properties.tabs
                ]
            };
        } catch (error) {
            console.error(`Failed to get dynamic properties for valve type ${valveType}:`, error);
            return this.properties; // Fallback to base properties
        }
    },
    
    // Get complete node data structure for a specific valve type
    getNodeDataForType: function(valveType, additionalProps = {}) {
        const baseData = { ...this.defaultData };
        
        if (valveType) {
            try {
                const typeConfig = getValveConfiguration(valveType);
                
                // Set the valve type
                baseData.valveType = valveType;
                baseData.meta.typeSelected = true;
                baseData.meta.lastTypeChange = new Date().toISOString();
                
                // Apply type-specific default values
                const typeDefaults = this.getDefaultPropertiesForType(valveType);
                Object.assign(baseData, typeDefaults);
                
                // Update label to reflect valve type
                baseData.label = typeConfig.displayName;
                
            } catch (error) {
                console.error(`Failed to configure valve type ${valveType}:`, error);
            }
        }
        
        // Apply any additional properties
        Object.assign(baseData, additionalProps);
        
        return baseData;
    },
    
    // Get default properties for a specific valve type
    getDefaultPropertiesForType: function(valveType) {
        if (!valveType) return {};
        
        try {
            const typeConfig = getValveConfiguration(valveType);
            const defaults = {};
            
            // Extract defaults from valve type configuration
            if (typeConfig.properties && typeConfig.properties.tabs) {
                typeConfig.properties.tabs.forEach(tab => {
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
        } catch (error) {
            console.error(`Failed to get defaults for valve type ${valveType}:`, error);
            return {};
        }
    },
    
    // Validation function for unified valve
    validators: {
        validateValveType: function(data) {
            return data.valveType && ValveTypeRegistry.hasOwnProperty(data.valveType);
        },
        
        validateCommonProperties: function(data) {
            // Validate required common properties
            if (!data.fromConnection || !data.toConnection) {
                return false;
            }
            
            if (data.fromConnection === data.toConnection) {
                return false;
            }
            
            if (data.area <= 0) {
                return false;
            }
            
            return true;
        },
        
        validateTypeSpecific: function(data) {
            if (!data.valveType) return false;
            
            try {
                const typeConfig = getValveConfiguration(data.valveType);
                
                if (typeConfig.validators) {
                    // Run type-specific validations
                    return Object.values(typeConfig.validators).every(validator => {
                        try {
                            return validator(data);
                        } catch (error) {
                            console.error('Validation error:', error);
                            return false;
                        }
                    });
                }
                
                return true;
            } catch (error) {
                console.error(`Validation failed for valve type ${data.valveType}:`, error);
                return false;
            }
        }
    },
    
    // MARS output generation for unified valve
    formatters: {
        generateHeader: function(component) {
            const valveType = component.data?.componentProp?.valveType;
            if (!valveType) {
                return `* VALVE 컴포넌트 입력 (타입 미선택)\n*\n${component.number}0000  ${component.name}  VALVE\n`;
            }
            
            try {
                const typeConfig = getValveConfiguration(valveType);
                return typeConfig.formatters.generateHeader(component);
            } catch (error) {
                console.error(`Failed to generate header for valve type ${valveType}:`, error);
                return `* VALVE 컴포넌트 입력\n*\n${component.number}0000  ${component.name}  VALVE\n`;
            }
        },
        
        generateMarsOutput: function(componentData) {
            const valveType = componentData.valveType;
            if (!valveType) {
                throw new Error("Cannot generate MARS output: valve type not selected");
            }
            
            try {
                const typeConfig = getValveConfiguration(valveType);
                
                // Generate type-specific MARS output
                let output = '';
                Object.entries(typeConfig.formatters).forEach(([formatterName, formatter]) => {
                    if (formatterName.startsWith('formatCard')) {
                        const cardOutput = formatter(componentData);
                        if (cardOutput) {
                            output += cardOutput;
                        }
                    }
                });
                
                return output;
            } catch (error) {
                console.error(`Failed to generate MARS output for valve type ${valveType}:`, error);
                throw error;
            }
        }
    },
    
    // Migration utilities for backward compatibility
    migration: {
        // Check if a node is a legacy valve component
        isLegacyValveNode: function(node) {
            const legacyTypes = ['CHKVLV', 'TRPVLV', 'INRVLV', 'MTRVLV', 'SRVVLV', 'RLFVLV'];
            return legacyTypes.includes(node.data?.componentType);
        },
        
        // Migrate legacy valve node to unified format
        migrateLegacyNode: function(node) {
            if (!this.isLegacyValveNode(node)) {
                return node;
            }
            
            const originalType = node.data.componentType;
            
            return {
                ...node,
                data: {
                    ...node.data,
                    componentType: 'VALVE',
                    componentProp: {
                        valveType: originalType,
                        ...node.data.componentProp
                    },
                    meta: {
                        typeSelected: true,
                        migratedFrom: originalType,
                        migrationDate: new Date().toISOString(),
                        version: '2.0'
                    }
                }
            };
        },
        
        // Migrate entire project data
        migrateProjectData: function(projectData) {
            return {
                ...projectData,
                nodes: projectData.nodes.map(node => 
                    this.isLegacyValveNode(node) 
                        ? this.migrateLegacyNode(node) 
                        : node
                )
            };
        }
    }
};

export default UnifiedValve;