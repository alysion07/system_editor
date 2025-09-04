# VALVE Component Functional Specifications

## Overview

This document defines the comprehensive functional specifications for VALVE components in the MARS-based React/ReactFlow node editor system. These specifications are based on the MARS Input Manual Section 8.15 and integrate with the existing React architecture using Zustand state management and ReactFlow visualization.

## Component Architecture Overview

### Core Design Principles
- **MARS Compliance**: Full adherence to MARS Input Manual valve specifications
- **Type Safety**: TypeScript interfaces for all valve types and properties  
- **State Management**: Integration with Zustand useFlowStore for undo/redo capability
- **Visual Consistency**: ReactFlow node styling consistent with existing component patterns
- **Validation**: Comprehensive input validation and connection rules

### System Integration Points
- **NodeItem.jsx**: Visual node rendering with MARS-compliant port positioning
- **ComponentsType.jsx**: Component type definitions and configurations
- **useFlowStore**: State management with history tracking
- **NodeInspector.jsx**: Property panel integration for valve-specific controls

---

## 1. VALVE Component Type Hierarchy

### 1.1 Base VALVE Interface

```typescript
interface BaseValveComponent {
  type: 'VALVE';
  label: string;
  icon: string;
  category: 'hydro';
  valveType: ValveType;
  
  ports: {
    inputs: ValvePort[];
    outputs: ValvePort[];
  };
  
  defaultData: ValveDefaultData;
  properties: ValveProperty[];
  validation: ValveValidation;
  marsConfig: ValveMarsConfig;
}

interface ValvePort {
  id: string;
  label: string;
  position: 'left' | 'right' | 'top' | 'bottom';
  marsCode: number; // Face number (1-6)
  connectionType: 'fluid';
  description: string;
  flowDirection: 'forced_inlet' | 'forced_outlet' | 'bidirectional';
  required: boolean;
}

type ValveType = 'CHKVLV' | 'TRPVLV' | 'INRVLV' | 'MTRVLV' | 'SRVVLV' | 'RLFVLV';
```

### 1.2 MARS Connection Codes

```typescript
interface ValveMarsConfig {
  componentCode: string; // CCC format
  junctionCode: string;  // CCC000000 format
  
  connectionPattern: {
    from: {
      marsCode: string; // CCCVV000N format
      expectedFace: number; // Expected source face (typically 2)
    };
    to: {
      marsCode: string; // CCCVV000N format  
      expectedFace: number; // Expected target face (typically 1)
    };
  };
  
  controlFlags: {
    e: number; // Modified PV term (0|1)
    f: number; // CCFL options (0|1)
    v: number; // Horizontal stratification (0-3)
    c: number; // Choking options (0|1)
    a: number; // Area change options (0-2)
    h: number; // Homogeneous options (0-2)
    s: number; // Momentum flux options (0-3)
  };
}
```

---

## 2. Individual Valve Type Specifications

### 2.1 CHKVLV (Check Valve)

```typescript
const CHKVLV: BaseValveComponent = {
  type: 'VALVE',
  label: 'Check Valve',
  icon: '🚪',
  category: 'hydro',
  valveType: 'CHKVLV',
  
  ports: {
    inputs: [{
      id: 'inlet',
      label: 'Inlet (From)',
      position: 'left',
      marsCode: 1,
      connectionType: 'fluid',
      description: 'Check valve inlet - allows forward flow only',
      flowDirection: 'forced_inlet',
      required: true
    }],
    outputs: [{
      id: 'outlet', 
      label: 'Outlet (To)',
      position: 'right',
      marsCode: 2,
      connectionType: 'fluid',
      description: 'Check valve outlet - prevents reverse flow',
      flowDirection: 'forced_outlet',
      required: true
    }]
  },
  
  defaultData: {
    checkValveType: 0, // Static pressure/flow-controlled (recommended)
    initialPosition: 0, // 0=open, 1=closed
    closingBackPressure: 0.0, // Pa
    leakRatio: 0.0, // Fraction for leakage when closed
    
    // Junction geometry
    area: 0.0, // m² - defaults to minimum adjoining area
    forwardLossCoeff: 0.5, // AF - forward flow loss coefficient
    reverseLossCoeff: 10000.0, // AR - reverse flow loss coefficient (very high)
    
    // Initial conditions
    controlWord: 1, // 0=velocities, 1=mass flows
    initialLiquidFlow: 0.0, // kg/s
    initialVaporFlow: 0.0, // kg/s
    interfaceVelocity: 0.0 // m/s
  },
  
  properties: [
    {
      id: 'checkValveType',
      label: 'Check Valve Type',
      type: 'select',
      options: [
        { value: -1, label: 'Static/Dynamic Pressure-Controlled' },
        { value: 0, label: 'Static Pressure/Flow-Controlled (Recommended)' },
        { value: 1, label: 'Static Pressure-Controlled' }
      ],
      required: true,
      marsCard: 'CCC0301',
      marsWord: 'W1'
    },
    {
      id: 'initialPosition',
      label: 'Initial Position',
      type: 'select',
      options: [
        { value: 0, label: 'Open' },
        { value: 1, label: 'Closed' }
      ],
      required: true,
      marsCard: 'CCC0301',
      marsWord: 'W2'
    },
    {
      id: 'closingBackPressure',
      label: 'Closing Back Pressure (Pa)',
      type: 'number',
      min: 0,
      step: 1000,
      description: 'Additive closing pressure for spring-loaded valves',
      marsCard: 'CCC0301',
      marsWord: 'W3'
    },
    {
      id: 'leakRatio',
      label: 'Leak Ratio',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.001,
      description: 'Flow area fraction for leakage when closed',
      marsCard: 'CCC0301',
      marsWord: 'W4',
      validation: {
        conditional: {
          condition: 'leakRatio > 0',
          requires: 'abruptAreaChange',
          message: 'Non-zero leak ratio requires abrupt area change model (a=1 or 2)'
        }
      }
    },
    {
      id: 'area',
      label: 'Junction Area (m²)',
      type: 'number',
      min: 0,
      step: 0.001,
      description: 'Full open area (0 = minimum adjoining area)',
      marsCard: 'CCC0101',
      marsWord: 'W3'
    },
    {
      id: 'forwardLossCoeff',
      label: 'Forward Loss Coefficient',
      type: 'number',
      min: 0,
      step: 0.1,
      description: 'Energy loss coefficient for forward flow',
      marsCard: 'CCC0101',
      marsWord: 'W4'
    },
    {
      id: 'reverseLossCoeff',
      label: 'Reverse Loss Coefficient', 
      type: 'number',
      min: 0,
      step: 1,
      description: 'Energy loss coefficient for reverse flow (high value prevents backflow)',
      marsCard: 'CCC0101',
      marsWord: 'W5'
    }
  ],
  
  validation: {
    connectionRules: [
      {
        rule: 'inlet_must_connect_to_outlet_face',
        message: 'Check valve inlet must connect to source component Face 2 (outlet)'
      },
      {
        rule: 'outlet_must_connect_to_inlet_face',
        message: 'Check valve outlet must connect to target component Face 1 (inlet)'
      },
      {
        rule: 'no_reverse_connection',
        message: 'Check valve prevents reverse flow - check connection direction'
      }
    ],
    
    propertyRules: [
      {
        property: 'leakRatio',
        condition: 'value > 0',
        requires: ['abruptAreaChange'],
        message: 'Non-zero leak ratio requires abrupt area change model'
      },
      {
        property: 'area',
        condition: 'abruptAreaChange && value > 0',
        validation: 'value <= min(adjoiningAreas)',
        message: 'Area must be ≤ minimum of adjoining areas for abrupt area change'
      }
    ]
  },
  
  marsConfig: {
    componentCode: 'CCC',
    junctionCode: 'CCC000000',
    connectionPattern: {
      from: {
        marsCode: 'CCCVV000N', 
        expectedFace: 2
      },
      to: {
        marsCode: 'CCCVV000M',
        expectedFace: 1
      }
    },
    controlFlags: {
      e: 0, // No modified PV term by default
      f: 0, // No CCFL by default
      v: 0, // No horizontal stratification
      c: 0, // Apply choking model
      a: 0, // Smooth area change by default (can be 1 or 2 if leak ratio > 0)
      h: 0, // Non-homogeneous
      s: 0  // Use momentum flux in both volumes
    }
  }
};
```

### 2.2 TRPVLV (Trip Valve)

```typescript
const TRPVLV: BaseValveComponent = {
  type: 'VALVE',
  label: 'Trip Valve',
  icon: '🎯',
  category: 'hydro',
  valveType: 'TRPVLV',
  
  ports: {
    inputs: [{
      id: 'inlet',
      label: 'Inlet (From)',
      position: 'left',
      marsCode: 1,
      connectionType: 'fluid',
      description: 'Trip valve inlet - controlled by trip condition',
      flowDirection: 'forced_inlet',
      required: true
    }],
    outputs: [{
      id: 'outlet',
      label: 'Outlet (To)', 
      position: 'right',
      marsCode: 2,
      connectionType: 'fluid',
      description: 'Trip valve outlet - opens/closes based on trip',
      flowDirection: 'forced_outlet',
      required: true
    }]
  },
  
  defaultData: {
    tripNumber: 1, // Trip number reference
    
    // Junction geometry
    area: 0.0,
    forwardLossCoeff: 0.5,
    reverseLossCoeff: 0.5,
    
    // Initial conditions
    controlWord: 1,
    initialLiquidFlow: 0.0,
    initialVaporFlow: 0.0,
    interfaceVelocity: 0.0
  },
  
  properties: [
    {
      id: 'tripNumber',
      label: 'Trip Number',
      type: 'number',
      min: 1,
      step: 1,
      required: true,
      description: 'Valid trip number (false=closed, true=open)',
      marsCard: 'CCC0301',
      marsWord: 'W1',
      validation: {
        custom: 'validateTripNumber',
        message: 'Must be a valid trip number defined in system'
      }
    },
    {
      id: 'area',
      label: 'Junction Area (m²)',
      type: 'number', 
      min: 0,
      step: 0.001,
      marsCard: 'CCC0101',
      marsWord: 'W3'
    },
    {
      id: 'forwardLossCoeff',
      label: 'Forward Loss Coefficient',
      type: 'number',
      min: 0,
      step: 0.1,
      marsCard: 'CCC0101', 
      marsWord: 'W4'
    },
    {
      id: 'reverseLossCoeff',
      label: 'Reverse Loss Coefficient',
      type: 'number',
      min: 0,
      step: 0.1,
      marsCard: 'CCC0101',
      marsWord: 'W5'
    }
  ],
  
  validation: {
    connectionRules: [
      {
        rule: 'standard_inlet_outlet_connection',
        message: 'Trip valve requires standard inlet→outlet connection'
      }
    ],
    propertyRules: [
      {
        property: 'tripNumber',
        validation: 'validateTripExists',
        message: 'Trip number must exist in trip table'
      }
    ]
  },
  
  marsConfig: {
    componentCode: 'CCC',
    junctionCode: 'CCC000000',
    connectionPattern: {
      from: { marsCode: 'CCCVV000N', expectedFace: 2 },
      to: { marsCode: 'CCCVV000M', expectedFace: 1 }
    },
    controlFlags: {
      e: 0, f: 0, v: 0, c: 0, a: 0, h: 0, s: 0
    }
  }
};
```

### 2.3 INRVLV (Inertial Swing Check Valve)

```typescript
const INRVLV: BaseValveComponent = {
  type: 'VALVE',
  label: 'Inertial Valve',
  icon: '⚖️',
  category: 'hydro',
  valveType: 'INRVLV',
  
  ports: {
    inputs: [{
      id: 'inlet',
      label: 'Inlet (From)',
      position: 'left', 
      marsCode: 1,
      connectionType: 'fluid',
      description: 'Inertial valve inlet - hydrodynamic forces affect opening',
      flowDirection: 'forced_inlet',
      required: true
    }],
    outputs: [{
      id: 'outlet',
      label: 'Outlet (To)',
      position: 'right',
      marsCode: 2, 
      connectionType: 'fluid',
      description: 'Inertial valve outlet - area varies with flapper dynamics',
      flowDirection: 'forced_outlet',
      required: true
    }]
  },
  
  defaultData: {
    latchOption: 0, // 0=can open/close repeatedly
    initialCondition: 0, // 0=open, 1=closed
    crackingPressure: 0.0, // Pa
    leakageFraction: 0.0,
    
    // Flapper dynamics
    initialFlapperAngle: 45.0, // degrees
    minFlapperAngle: 0.0, // degrees
    maxFlapperAngle: 90.0, // degrees
    momentOfInertia: 1.0, // kg⋅m²
    initialAngularVelocity: 0.0, // rad/s
    momentLength: 0.1, // m
    flapperRadius: 0.05, // m
    flapperMass: 1.0, // kg
    
    // Junction geometry - must use abrupt area change
    area: 0.0,
    forwardLossCoeff: 0.5,
    reverseLossCoeff: 0.5,
    
    // Initial conditions
    controlWord: 1,
    initialLiquidFlow: 0.0,
    initialVaporFlow: 0.0,
    interfaceVelocity: 0.0
  },
  
  properties: [
    {
      id: 'latchOption',
      label: 'Latch Option',
      type: 'select',
      options: [
        { value: 0, label: 'Can open/close repeatedly' },
        { value: 1, label: 'Opens or closes only once' },
        { value: 2, label: 'Latches only at maximum position' }
      ],
      required: true,
      marsCard: 'CCC0301',
      marsWord: 'W1'
    },
    {
      id: 'initialCondition',
      label: 'Initial Condition',
      type: 'select',
      options: [
        { value: 0, label: 'Open' },
        { value: 1, label: 'Closed' }
      ],
      required: true,
      marsCard: 'CCC0301',
      marsWord: 'W2'
    },
    {
      id: 'crackingPressure',
      label: 'Cracking Pressure (Pa)',
      type: 'number',
      min: 0,
      step: 1000,
      required: true,
      marsCard: 'CCC0301',
      marsWord: 'W3'
    },
    {
      id: 'leakageFraction',
      label: 'Leakage Fraction',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.001,
      description: 'Fraction of junction area for leakage when closed',
      marsCard: 'CCC0301',
      marsWord: 'W4'
    },
    {
      id: 'initialFlapperAngle',
      label: 'Initial Flapper Angle (°)',
      type: 'number',
      min: 0,
      max: 180,
      step: 1,
      required: true,
      marsCard: 'CCC0301',
      marsWord: 'W5',
      validation: {
        custom: 'angleWithinMinMax',
        message: 'Must be within minimum and maximum flapper angles'
      }
    },
    {
      id: 'minFlapperAngle',
      label: 'Minimum Flapper Angle (°)',
      type: 'number',
      min: 0,
      step: 1,
      required: true,
      marsCard: 'CCC0301',
      marsWord: 'W6'
    },
    {
      id: 'maxFlapperAngle',
      label: 'Maximum Flapper Angle (°)',
      type: 'number',
      min: 0,
      max: 180,
      step: 1,
      required: true,
      marsCard: 'CCC0301',
      marsWord: 'W7'
    },
    {
      id: 'momentOfInertia',
      label: 'Moment of Inertia (kg⋅m²)',
      type: 'number',
      min: 0.001,
      step: 0.01,
      required: true,
      marsCard: 'CCC0301',
      marsWord: 'W8'
    },
    {
      id: 'initialAngularVelocity',
      label: 'Initial Angular Velocity (rad/s)',
      type: 'number',
      step: 0.1,
      marsCard: 'CCC0301',
      marsWord: 'W9'
    },
    {
      id: 'momentLength',
      label: 'Moment Length (m)',
      type: 'number',
      min: 0.001,
      step: 0.001,
      required: true,
      marsCard: 'CCC0301',
      marsWord: 'W10'
    },
    {
      id: 'flapperRadius',
      label: 'Flapper Radius (m)',
      type: 'number',
      min: 0.001,
      step: 0.001,
      required: true,
      marsCard: 'CCC0301',
      marsWord: 'W11'
    },
    {
      id: 'flapperMass',
      label: 'Flapper Mass (kg)',
      type: 'number',
      min: 0.001,
      step: 0.01,
      required: true,
      marsCard: 'CCC0301',
      marsWord: 'W12'
    }
  ],
  
  validation: {
    connectionRules: [
      {
        rule: 'requires_abrupt_area_change',
        message: 'Inertial valve must use abrupt area change model (a=1 or 2)'
      }
    ],
    propertyRules: [
      {
        property: 'initialFlapperAngle',
        validation: 'minFlapperAngle <= value <= maxFlapperAngle',
        message: 'Initial angle must be within min/max range'
      },
      {
        property: 'maxFlapperAngle',
        validation: 'value > minFlapperAngle',
        message: 'Maximum angle must be greater than minimum'
      }
    ]
  },
  
  marsConfig: {
    componentCode: 'CCC',
    junctionCode: 'CCC000000',
    connectionPattern: {
      from: { marsCode: 'CCCVV000N', expectedFace: 2 },
      to: { marsCode: 'CCCVV000M', expectedFace: 1 }
    },
    controlFlags: {
      e: 0, f: 0, v: 0, c: 0, 
      a: 1, // Must use abrupt area change
      h: 0, s: 0
    }
  }
};
```

### 2.4 MTRVLV (Motor Valve)

```typescript
const MTRVLV: BaseValveComponent = {
  type: 'VALVE',
  label: 'Motor Valve',
  icon: '⚡',
  category: 'hydro',
  valveType: 'MTRVLV',
  
  ports: {
    inputs: [{
      id: 'inlet',
      label: 'Inlet (From)',
      position: 'left',
      marsCode: 1,
      connectionType: 'fluid', 
      description: 'Motor valve inlet - area controlled by trips',
      flowDirection: 'forced_inlet',
      required: true
    }],
    outputs: [{
      id: 'outlet',
      label: 'Outlet (To)',
      position: 'right',
      marsCode: 2,
      connectionType: 'fluid',
      description: 'Motor valve outlet - variable area opening',
      flowDirection: 'forced_outlet', 
      required: true
    }]
  },
  
  defaultData: {
    openTripNumber: 1,
    closeTripNumber: 2,
    valveChangeRate: 0.1, // s⁻¹ - opening rate
    initialPosition: 0.0, // Normalized (0-1)
    valveTableNumber: 0, // 0 = no table, >0 = use general table
    valveClosingRate: 0.1, // s⁻¹ - closing rate (optional)
    
    // Junction geometry
    area: 0.0,
    forwardLossCoeff: 0.5,
    reverseLossCoeff: 0.5,
    
    // Area change model selection
    useAbruptAreaChange: false, // true requires a=1 or 2, false allows CSUBV table
    
    // Initial conditions
    controlWord: 1,
    initialLiquidFlow: 0.0,
    initialVaporFlow: 0.0,
    interfaceVelocity: 0.0,
    
    // CSUBV table data (if smooth area change)
    csubvTable: [] // Array of {position, forwardCoeff, reverseCoeff}
  },
  
  properties: [
    {
      id: 'openTripNumber',
      label: 'Open Trip Number',
      type: 'number',
      min: 1,
      step: 1,
      required: true,
      marsCard: 'CCC0301',
      marsWord: 'W1',
      validation: {
        custom: 'validateTripNumber',
        message: 'Must be a valid trip number'
      }
    },
    {
      id: 'closeTripNumber', 
      label: 'Close Trip Number',
      type: 'number',
      min: 1,
      step: 1,
      required: true,
      marsCard: 'CCC0301',
      marsWord: 'W2',
      validation: {
        custom: 'validateTripNumber',
        conditional: {
          condition: 'value === openTripNumber',
          message: 'Close trip must be different from open trip'
        }
      }
    },
    {
      id: 'valveChangeRate',
      label: 'Valve Opening Rate (s⁻¹)',
      type: 'number',
      min: 0.001,
      step: 0.01,
      required: true,
      description: 'Rate of change of normalized valve area or stem position',
      marsCard: 'CCC0301',
      marsWord: 'W3'
    },
    {
      id: 'initialPosition',
      label: 'Initial Position (0-1)',
      type: 'number',
      min: 0,
      max: 1,
      step: 0.01,
      required: true,
      description: 'Initial normalized valve area or stem position',
      marsCard: 'CCC0301',
      marsWord: 'W4'
    },
    {
      id: 'valveTableNumber',
      label: 'Valve Table Number',
      type: 'number',
      min: 0,
      step: 1,
      description: '0=area from rate, >0=stem position from table',
      marsCard: 'CCC0301',
      marsWord: 'W5'
    },
    {
      id: 'valveClosingRate',
      label: 'Valve Closing Rate (s⁻¹)',
      type: 'number',
      min: 0.001,
      step: 0.01,
      description: 'Optional separate closing rate',
      marsCard: 'CCC0301',
      marsWord: 'W6'
    },
    {
      id: 'useAbruptAreaChange',
      label: 'Use Abrupt Area Change',
      type: 'boolean',
      description: 'true=abrupt model (a=1,2), false=smooth model with CSUBV table',
      conditional: {
        false: 'requiresCsubvTable',
        true: 'prohibitsCsubvTable'
      }
    }
  ],
  
  validation: {
    connectionRules: [
      {
        rule: 'standard_inlet_outlet_connection',
        message: 'Motor valve requires standard inlet→outlet connection'
      }
    ],
    propertyRules: [
      {
        property: 'openTripNumber',
        validation: 'validateTripExists && value !== closeTripNumber',
        message: 'Must be valid and different from close trip'
      },
      {
        property: 'useAbruptAreaChange',
        condition: 'value === false',
        requires: ['csubvTable'],
        message: 'Smooth area change requires CSUBV table'
      },
      {
        property: 'csubvTable',
        condition: 'useAbruptAreaChange === false',
        validation: 'array.length > 0',
        message: 'CSUBV table required for smooth area change'
      }
    ]
  },
  
  marsConfig: {
    componentCode: 'CCC',
    junctionCode: 'CCC000000',
    connectionPattern: {
      from: { marsCode: 'CCCVV000N', expectedFace: 2 },
      to: { marsCode: 'CCCVV000M', expectedFace: 1 }
    },
    controlFlags: {
      e: 0, f: 0, v: 0, c: 0,
      a: 0, // 0=smooth (with CSUBV), 1-2=abrupt
      h: 0, s: 0
    }
  }
};
```

### 2.5 SRVVLV (Servo Valve)

```typescript
const SRVVLV: BaseValveComponent = {
  type: 'VALVE',
  label: 'Servo Valve',
  icon: '🎛️',
  category: 'hydro', 
  valveType: 'SRVVLV',
  
  ports: {
    inputs: [{
      id: 'inlet',
      label: 'Inlet (From)',
      position: 'left',
      marsCode: 1,
      connectionType: 'fluid',
      description: 'Servo valve inlet - controlled by control system',
      flowDirection: 'forced_inlet',
      required: true
    }],
    outputs: [{
      id: 'outlet',
      label: 'Outlet (To)',
      position: 'right',
      marsCode: 2,
      connectionType: 'fluid',
      description: 'Servo valve outlet - area from control variable',
      flowDirection: 'forced_outlet',
      required: true
    }]
  },
  
  defaultData: {
    controlVariableNumber: 1, // Control system variable reference
    valveTableNumber: 0, // Optional stem position table
    
    // Junction geometry
    area: 0.0,
    forwardLossCoeff: 0.5,
    reverseLossCoeff: 0.5,
    
    // Area change model
    useAbruptAreaChange: false,
    
    // Initial conditions
    controlWord: 1,
    initialLiquidFlow: 0.0,
    initialVaporFlow: 0.0,
    interfaceVelocity: 0.0,
    
    // CSUBV table (if smooth area change)
    csubvTable: []
  },
  
  properties: [
    {
      id: 'controlVariableNumber',
      label: 'Control Variable Number',
      type: 'number',
      min: 1,
      step: 1,
      required: true,
      description: 'Control system variable for valve area/position',
      marsCard: 'CCC0301',
      marsWord: 'W1',
      validation: {
        custom: 'validateControlVariable',
        message: 'Must reference valid control variable'
      }
    },
    {
      id: 'valveTableNumber',
      label: 'Valve Table Number',
      type: 'number',
      min: 0,
      step: 1,
      description: '0=control var is area, >0=control var is stem position',
      marsCard: 'CCC0301',
      marsWord: 'W2'
    },
    {
      id: 'useAbruptAreaChange',
      label: 'Use Abrupt Area Change',
      type: 'boolean',
      description: 'Area change model selection'
    }
  ],
  
  validation: {
    connectionRules: [
      {
        rule: 'standard_inlet_outlet_connection',
        message: 'Servo valve requires standard inlet→outlet connection'
      }
    ],
    propertyRules: [
      {
        property: 'controlVariableNumber',
        validation: 'validateControlSystemReference',
        message: 'Control variable must be defined in control system'
      },
      {
        property: 'useAbruptAreaChange',
        condition: 'value === false',
        requires: ['csubvTable'],
        message: 'Smooth area change requires CSUBV table'
      }
    ]
  },
  
  marsConfig: {
    componentCode: 'CCC',
    junctionCode: 'CCC000000', 
    connectionPattern: {
      from: { marsCode: 'CCCVV000N', expectedFace: 2 },
      to: { marsCode: 'CCCVV000M', expectedFace: 1 }
    },
    controlFlags: {
      e: 0, f: 0, v: 0, c: 0, a: 0, h: 0, s: 0
    }
  }
};
```

### 2.6 RLFVLV (Relief Valve)

```typescript
const RLFVLV: BaseValveComponent = {
  type: 'VALVE',
  label: 'Relief Valve',
  icon: '🚨',
  category: 'hydro',
  valveType: 'RLFVLV',
  
  ports: {
    inputs: [{
      id: 'inlet',
      label: 'Inlet (From)',
      position: 'left',
      marsCode: 1,
      connectionType: 'fluid',
      description: 'Relief valve inlet - opens at setpoint pressure',
      flowDirection: 'forced_inlet',
      required: true
    }],
    outputs: [{
      id: 'outlet',
      label: 'Outlet (To)',
      position: 'right',
      marsCode: 2,
      connectionType: 'fluid',
      description: 'Relief valve outlet - variable area based on pressure',
      flowDirection: 'forced_outlet',
      required: true
    }]
  },
  
  defaultData: {
    initialCondition: 0, // 0=closed, 1=open
    
    // Valve geometry
    inletDiameter: 0.0, // m - calculated from area if 0
    seatDiameter: 0.1, // m - required
    pistonDiameter: 0.0, // m - defaults to seat diameter
    valveLift: 0.01, // m - required
    
    // Adjustment rings
    maxOuterDiameterInner: 0.0, // m - outer adjustment ring
    heightOuterShoulderInner: 0.0, // m - relative to seat
    minInsideDiameterOuter: 0.0, // m - inner adjustment ring  
    heightInsideBottomOuter: 0.0, // m - relative to seat
    
    // Bellows and spring
    bellowsAverageDiameter: 0.0, // m - defaults to piston diameter
    springConstant: 10000.0, // N/m - required
    setpointPressure: 1000000.0, // Pa - required
    valveMass: 1.0, // kg - piston+rod+spring+bellows
    dampingCoefficient: 0.0, // N⋅s/m
    bellowsInsidePressure: 101325.0, // Pa - atmospheric default
    
    // Initial conditions (if initially open)
    initialStemPosition: 0.0, // Fraction of total lift
    initialPistonVelocity: 0.0, // m/s
    
    // Junction geometry - inlet area
    area: 0.0, // Valve inlet throat area
    forwardLossCoeff: 0.5,
    reverseLossCoeff: 0.5,
    
    // Must use abrupt area change
    controlWord: 1,
    initialLiquidFlow: 0.0,
    initialVaporFlow: 0.0,
    interfaceVelocity: 0.0
  },
  
  properties: [
    {
      id: 'initialCondition',
      label: 'Initial Condition',
      type: 'select',
      options: [
        { value: 0, label: 'Closed' },
        { value: 1, label: 'Open' }
      ],
      required: true,
      marsCard: 'CCC0301',
      marsWord: 'W1'
    },
    {
      id: 'inletDiameter',
      label: 'Inlet Diameter (m)',
      type: 'number',
      min: 0,
      step: 0.001,
      description: 'Inside diameter (0 = calculate from area)',
      marsCard: 'CCC0301',
      marsWord: 'W2'
    },
    {
      id: 'seatDiameter',
      label: 'Seat Diameter (m)',
      type: 'number',
      min: 0.001,
      step: 0.001,
      required: true,
      description: 'Outside diameter including inner adjustment ring',
      marsCard: 'CCC0301',
      marsWord: 'W3',
      validation: {
        custom: 'value >= inletDiameter',
        message: 'Seat diameter must be ≥ inlet diameter'
      }
    },
    {
      id: 'pistonDiameter',
      label: 'Piston Diameter (m)',
      type: 'number',
      min: 0,
      step: 0.001,
      description: '0 = default to seat diameter',
      marsCard: 'CCC0301',
      marsWord: 'W4'
    },
    {
      id: 'valveLift',
      label: 'Valve Lift (m)',
      type: 'number',
      min: 0.001,
      step: 0.001,
      required: true,
      description: 'Distance piston rises at fully open',
      marsCard: 'CCC0301',
      marsWord: 'W5'
    },
    {
      id: 'springConstant',
      label: 'Spring Constant (N/m)',
      type: 'number',
      min: 1,
      step: 100,
      required: true,
      marsCard: 'CCC0301',
      marsWord: 'W11'
    },
    {
      id: 'setpointPressure',
      label: 'Setpoint Pressure (Pa)',
      type: 'number',
      min: 1000,
      step: 1000,
      required: true,
      description: 'Valve opening setpoint pressure',
      marsCard: 'CCC0301',
      marsWord: 'W12'
    },
    {
      id: 'valveMass',
      label: 'Valve Mass (kg)',
      type: 'number',
      min: 0.001,
      step: 0.01,
      required: true,
      description: 'Total mass: piston + rod + spring + bellows',
      marsCard: 'CCC0301',
      marsWord: 'W13'
    },
    {
      id: 'dampingCoefficient',
      label: 'Damping Coefficient (N⋅s/m)',
      type: 'number',
      min: 0,
      step: 0.1,
      marsCard: 'CCC0301',
      marsWord: 'W14'
    },
    {
      id: 'bellowsInsidePressure',
      label: 'Bellows Inside Pressure (Pa)',
      type: 'number',
      min: 0,
      step: 1000,
      description: 'Defaults to atmospheric if 0',
      marsCard: 'CCC0301',
      marsWord: 'W15'
    }
  ],
  
  validation: {
    connectionRules: [
      {
        rule: 'requires_abrupt_area_change',
        message: 'Relief valve must use abrupt area change model (a=1 or 2)'
      },
      {
        rule: 'inlet_area_is_throat_area',
        message: 'Junction area is valve inlet throat area'
      }
    ],
    propertyRules: [
      {
        property: 'seatDiameter', 
        validation: 'value >= inletDiameter',
        message: 'Seat diameter must be ≥ inlet diameter'
      },
      {
        property: 'area',
        condition: 'value > 0 && inletDiameter > 0',
        validation: 'abs(value - π*(inletDiameter/2)²) <= 1e-5',
        message: 'Area must agree with inlet diameter within 10⁻⁵ m²'
      },
      {
        property: 'initialStemPosition',
        condition: 'initialCondition === 1',
        validation: '0 <= value <= 1',
        message: 'Stem position must be fraction of total lift'
      }
    ]
  },
  
  marsConfig: {
    componentCode: 'CCC',
    junctionCode: 'CCC000000',
    connectionPattern: {
      from: { marsCode: 'CCCVV000N', expectedFace: 2 },
      to: { marsCode: 'CCCVV000M', expectedFace: 1 }
    },
    controlFlags: {
      e: 0, f: 0, v: 0, c: 0,
      a: 1, // Must use abrupt area change
      h: 0, s: 0
    }
  }
};
```

---

## 3. Integration with Existing Architecture

### 3.1 ComponentsType.jsx Updates

```typescript
// Add to ComponentsType.jsx
import CHKVLV from './components/CHKVLV.js';
import TRPVLV from './components/TRPVLV.js'; 
import INRVLV from './components/INRVLV.js';
import MTRVLV from './components/MTRVLV.js';
import SRVVLV from './components/SRVVLV.js';
import RLFVLV from './components/RLFVLV.js';

export const componentTypes = {
  // ... existing components
  CHKVLV,
  TRPVLV, 
  INRVLV,
  MTRVLV,
  SRVVLV,
  RLFVLV
};

// Update categories
export const componentCategories = {
  // ... existing categories
  valve: 'Valve Components'
};
```

### 3.2 NodeInspector Integration

```typescript
// Property panel sections for valve components
const ValvePropertyPanel = ({ node, updateNodeData }) => {
  const valveType = node.data.valveType;
  const componentDef = componentTypes[valveType];
  
  return (
    <div className="valve-properties">
      <div className="property-section">
        <h3>Valve Configuration</h3>
        
        {/* Valve Type Display */}
        <div className="property-group">
          <label>Type: {componentDef.label}</label>
          <span className="valve-icon">{componentDef.icon}</span>
        </div>
        
        {/* Dynamic Properties based on valve type */}
        {componentDef.properties.map(property => (
          <PropertyInput
            key={property.id}
            property={property}
            value={node.data.componentProp[property.id]}
            onChange={(value) => updateNodeData(property.id, value)}
            validation={property.validation}
          />
        ))}
      </div>
      
      {/* MARS Configuration Section */}
      <div className="property-section">
        <h3>MARS Configuration</h3>
        <div className="mars-info">
          <div>Component: {node.data.marsConfig.componentCode}</div>
          <div>Junction: {node.data.marsConfig.junctionCode}</div>
          <div>Control Flags: {formatControlFlags(node.data.marsConfig.controlFlags)}</div>
        </div>
      </div>
      
      {/* Connection Validation */}
      <div className="property-section">
        <h3>Connections</h3>
        <ConnectionValidator node={node} />
      </div>
      
      {/* Special Property Sections */}
      {valveType === 'MTRVLV' && <MotorValveCSUBVTable node={node} />}
      {valveType === 'SRVVLV' && <ServoValveControlSystem node={node} />}
      {valveType === 'RLFVLV' && <ReliefValveGeometry node={node} />}
    </div>
  );
};
```

### 3.3 Zustand Store Integration

```typescript
// Add to useFlowStore.jsx
const useFlowStore = create(
  devtools(
    (set, get) => ({
      // ... existing state
      
      // Valve-specific actions
      addValveNode: (valveType, position) => {
        const componentDef = componentTypes[valveType];
        const newNode = {
          id: generateId(),
          type: 'custom',
          position,
          data: {
            componentType: valveType,
            valveType: valveType,
            label: componentDef.label,
            componentProp: { ...componentDef.defaultData },
            marsConfig: { ...componentDef.marsConfig },
            validation: componentDef.validation,
            onDelete: () => get().deleteNode(newNode.id)
          }
        };
        
        set((state) => ({
          present: {
            ...state.present,
            nodes: [...state.present.nodes, newNode]
          },
          past: [...state.past, state.present],
          future: []
        }));
      },
      
      // Valve connection validation
      validateValveConnection: (sourceId, targetId, sourceHandle, targetHandle) => {
        const nodes = get().present.nodes;
        const sourceNode = nodes.find(n => n.id === sourceId);
        const targetNode = nodes.find(n => n.id === targetId);
        
        if (!sourceNode || !targetNode) return { valid: false, error: 'Node not found' };
        
        // Check if source is a valve
        if (sourceNode.data.componentType.endsWith('VLV')) {
          return validateValveToComponent(sourceNode, targetNode, sourceHandle, targetHandle);
        }
        
        // Check if target is a valve  
        if (targetNode.data.componentType.endsWith('VLV')) {
          return validateComponentToValve(sourceNode, targetNode, sourceHandle, targetHandle);
        }
        
        return { valid: true };
      },
      
      // Valve property update with validation
      updateValveProperty: (nodeId, propertyId, value) => {
        const node = get().present.nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        const componentDef = componentTypes[node.data.valveType];
        const property = componentDef.properties.find(p => p.id === propertyId);
        
        // Validate property value
        const validation = validateProperty(property, value, node.data.componentProp);
        if (!validation.valid) {
          console.error(`Validation failed for ${propertyId}:`, validation.error);
          return;
        }
        
        // Update with history tracking
        set((state) => ({
          present: {
            ...state.present,
            nodes: state.present.nodes.map(n =>
              n.id === nodeId
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      componentProp: {
                        ...n.data.componentProp,
                        [propertyId]: value
                      }
                    }
                  }
                : n
            )
          },
          past: [...state.past, state.present],
          future: []
        }));
      }
    })
  )
);
```

### 3.4 Validation System

```typescript
// Validation utilities
export const validateProperty = (property, value, allProps) => {
  // Type validation
  if (property.type === 'number') {
    if (typeof value !== 'number' || isNaN(value)) {
      return { valid: false, error: 'Must be a number' };
    }
    if (property.min !== undefined && value < property.min) {
      return { valid: false, error: `Must be ≥ ${property.min}` };
    }
    if (property.max !== undefined && value > property.max) {
      return { valid: false, error: `Must be ≤ ${property.max}` };
    }
  }
  
  // Custom validation
  if (property.validation?.custom) {
    const customResult = runCustomValidation(property.validation.custom, value, allProps);
    if (!customResult.valid) return customResult;
  }
  
  // Conditional validation
  if (property.validation?.conditional) {
    const conditionResult = evaluateCondition(property.validation.conditional, value, allProps);
    if (!conditionResult.valid) return conditionResult;
  }
  
  return { valid: true };
};

export const validateValveConnection = (sourceNode, targetNode, sourceHandle, targetHandle) => {
  const sourceType = sourceNode.data.componentType;
  const targetType = targetNode.data.componentType;
  
  // Get MARS face expectations
  const sourcePort = getPortByHandle(sourceNode, sourceHandle);
  const targetPort = getPortByHandle(targetNode, targetHandle);
  
  if (!sourcePort || !targetPort) {
    return { valid: false, error: 'Invalid port connection' };
  }
  
  // Check flow direction compatibility
  if (sourcePort.flowDirection === 'forced_outlet' && targetPort.flowDirection === 'forced_inlet') {
    return { valid: true };
  }
  
  // Check MARS face compatibility
  const expectedSourceFace = 2; // Outlets typically Face 2
  const expectedTargetFace = 1;  // Inlets typically Face 1
  
  if (sourcePort.marsCode !== expectedSourceFace) {
    return { 
      valid: false, 
      error: `Source should connect from Face ${expectedSourceFace}, got Face ${sourcePort.marsCode}` 
    };
  }
  
  if (targetPort.marsCode !== expectedTargetFace) {
    return { 
      valid: false, 
      error: `Target should connect to Face ${expectedTargetFace}, got Face ${targetPort.marsCode}` 
    };
  }
  
  return { valid: true };
};
```

---

## 4. Implementation Notes

### 4.1 File Structure
```
src/components/node-editor/components/
├── CHKVLV.js          # Check valve component definition
├── TRPVLV.js          # Trip valve component definition  
├── INRVLV.js          # Inertial valve component definition
├── MTRVLV.js          # Motor valve component definition
├── SRVVLV.js          # Servo valve component definition
└── RLFVLV.js          # Relief valve component definition

src/components/node-editor/controls/
├── ValvePropertyPanel.jsx    # Unified valve property editor
├── CSUBVTableEditor.jsx      # CSUBV table editor for motor/servo valves
├── ValveConnectionValidator.jsx  # Connection validation UI
└── ValveGeometryVisualizer.jsx   # Relief valve geometry helper
```

### 4.2 MARS File Generation Integration

The valve components must integrate with the existing file generation system to produce proper MARS input files:

```typescript
// Add to fileGenerator.jsx
const generateValveCards = (node) => {
  const { valveType, componentProp, marsConfig } = node.data;
  const componentCode = node.id.padStart(3, '0');
  
  let cards = [];
  
  // Geometry card CCC0101-0109
  cards.push(`${componentCode}0101 ${componentProp.from} ${componentProp.to} ${componentProp.area || 0} ${componentProp.forwardLossCoeff} ${componentProp.reverseLossCoeff} ${formatControlFlags(marsConfig.controlFlags)}`);
  
  // Initial conditions CCC0201
  cards.push(`${componentCode}0201 ${componentProp.controlWord} ${componentProp.initialLiquidFlow} ${componentProp.initialVaporFlow} ${componentProp.interfaceVelocity}`);
  
  // Valve type CCC0300
  cards.push(`${componentCode}0300 ${valveType}`);
  
  // Type-specific cards CCC0301-0399
  cards.push(...generateValveTypeSpecificCards(valveType, componentCode, componentProp));
  
  // CSUBV table if applicable
  if ((valveType === 'MTRVLV' || valveType === 'SRVVLV') && !componentProp.useAbruptAreaChange) {
    cards.push(...generateCSUBVTable(componentCode, componentProp.csubvTable));
  }
  
  return cards;
};
```

### 4.3 Testing and Validation

Comprehensive testing should include:
- Property validation edge cases
- MARS file output correctness
- Connection rule enforcement  
- Undo/redo functionality with valve operations
- Integration with existing ReactFlow features

---

## 5. Future Enhancements

### 5.1 Advanced Features
- **Real-time simulation**: Integration with MARS solver for live parameter updates
- **3D visualization**: Enhanced valve geometry representation
- **Performance analytics**: Valve operation efficiency metrics
- **Predictive maintenance**: AI-based valve health monitoring

### 5.2 UI/UX Improvements
- **Valve wizard**: Guided valve configuration workflow
- **Template library**: Common valve configurations
- **Batch operations**: Multi-valve parameter updates
- **Advanced validation**: Cross-component dependency checking

---

**Document Version**: 1.0  
**Created**: 2025-09-04  
**Based On**: MARS Input Manual Section 8.15, existing React/ReactFlow architecture  
**Target System**: sys_edit_cl Node Editor

This specification document provides a comprehensive foundation for implementing VALVE components that are fully compliant with MARS requirements while seamlessly integrating with the existing React-based node editor architecture.