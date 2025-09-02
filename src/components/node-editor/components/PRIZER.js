const PRIZER = {
    type: 'PRIZER',
    label: 'PRIZER',
    icon: '⚙️',
    category: 'hydro',
    ports: {
        inputs: [{ id: 'from', label: 'In' }],
        outputs: [{ id: 'to', label: 'Out' }]
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

export default PRIZER;