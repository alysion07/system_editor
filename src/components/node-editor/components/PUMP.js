const PUMP = {
    type: 'PUMP',
    label: 'PUMP',
    icon: '⚙️',
    category: 'hydro',
    ports: {
        inputs: [
            { 
                id: 'suction', 
                label: 'Suction (Face 1)', 
                position: 'left', 
                marsCode: 1, 
                connectionType: 'fluid',
                description: '펌프 흡입구 (Volume 01)',
                flowDirection: 'forced_inlet'
            }
        ],
        outputs: [
            { 
                id: 'discharge', 
                label: 'Discharge (Face 2)', 
                position: 'right', 
                marsCode: 2, 
                connectionType: 'fluid',
                description: '펌프 토출구 (Volume 02)',
                flowDirection: 'forced_outlet'
            }
        ]
    },
    defaultData: {
        flowRate: 10.0, // in kg/s
        head: 100.0,    // in meters
        efficiency: 0.8 // efficiency ratio
    },
    properties: [
        { id: 'flowRate', label: 'Flow Rate (kg/s)', type: 'number', min: 0.1, max: 1000.0, step: 0.1 },
        { id: 'head', label: 'Head (m)', type: 'number', min: 1.0, max: 1000.0, step: 1.0 },
        { id: 'efficiency', label: 'Efficiency', type: 'number', min: 0.1, max: 1.0, step: 0.01 }
    ]
};

export default PUMP;