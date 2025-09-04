# PIPE Component Functional Specification

## Component Overview

### Basic Information
- **Component Type**: PIPE
- **Label**: PIPE
- **Category**: hydro
- **Description**: 파이프 컴포넌트는 여러 체적으로 구성된 1차원 유체 흐름 경로를 나타냅니다.
- **Purpose**: Represents one-dimensional fluid flow paths composed of multiple volumes for thermal-hydraulic system modeling

### Port Configuration
- **Input Ports**: 1 (from)
- **Output Ports**: 1 (to)
- **Connection Type**: Single-input, single-output flow component

## Technical Requirements

### Scalability
- **Volume Range**: 1 to 99 volumes
- **Junction Count**: nv - 1 internal junctions (where nv = number of volumes)
- **Dynamic Table Support**: All tables automatically adjust rows based on numberOfVolumes

### Component Architecture
The PIPE component consists of 5 main configuration tabs:
1. **기본 데이터** (Basic Data): Core component parameters
2. **기하학적 데이터** (Geometric Data): Physical geometry definition
3. **마찰 데이터** (Friction Data): Friction and loss characteristics
4. **제어 플래그** (Control Flags): Physical model control parameters
5. **초기 조건** (Initial Conditions): Thermodynamic and flow initial states

## Data Structure Specifications

### Tab 1: Basic Data (기본 데이터)

#### Card CCC0001: Pipe Information
| Field | Type | Range | Required | Description |
|-------|------|-------|----------|-------------|
| numberOfVolumes | number | 1-99 | Yes | Number of volumes composing the pipe |

**Validation Rules:**
- Must be integer between 1 and 99
- Determines the size of all dynamic tables
- Internal junctions = numberOfVolumes - 1

### Tab 2: Geometric Data (기하학적 데이터)

#### Card CCC0101-0199: X-Coordinate Area Data
| Field | Type | Unit | Required | Description |
|-------|------|------|----------|-------------|
| volumeNumber | number | - | Yes | Volume index (1 to nv) |
| area | number | m², ft² | Yes | X-coordinate cross-sectional area |

#### Card CCC0201-0299: Junction Area Data (Optional)
| Field | Type | Unit | Required | Description |
|-------|------|------|----------|-------------|
| junctionNumber | number | - | No | Junction index (1 to nv-1) |
| junctionArea | number | m², ft² | No | Junction flow area (0 = use minimum adjacent volume area) |

#### Card CCC0301-0399: X-Coordinate Length Data
| Field | Type | Unit | Required | Description |
|-------|------|------|----------|-------------|
| volumeNumber | number | - | Yes | Volume index (1 to nv) |
| length | number | m, ft | Yes | X-coordinate direction length |

#### Card CCC0401-0499: Volume Data (Optional)
| Field | Type | Unit | Required | Description |
|-------|------|------|----------|-------------|
| volumeNumber | number | - | No | Volume index (1 to nv) |
| volume | number | m³, ft³ | No | Volume (must equal area × length) |

**Validation Rules:**
- Volume consistency: volume = area × length (tolerance: 1e-6)

#### Card CCC0501-0599: Azimuthal Angle Data (Optional)
| Field | Type | Unit | Required | Description |
|-------|------|------|----------|-------------|
| volumeNumber | number | - | No | Volume index (1 to nv) |
| azimuthalAngle | number | degrees | No | Azimuthal angle (-360° to 360°) |

#### Card CCC0601-0699: Vertical Angle Data
| Field | Type | Unit | Required | Description |
|-------|------|------|----------|-------------|
| volumeNumber | number | - | Yes | Volume index (1 to nv) |
| verticalAngle | number | degrees | Yes | Vertical angle (-90° to 90°) |

**Validation Rules:**
- Absolute value must be ≤ 90°
- Used for interfacial drag calculations

#### Card CCC0701-0799: Elevation Change Data (Optional)
**Mode Selection:**
- Mode 1: Single coordinate change (elevation only)
- Mode 3: Three coordinate changes (x, y, z)

**Mode 1 Fields:**
| Field | Type | Unit | Required | Description |
|-------|------|------|----------|-------------|
| volumeNumber | number | - | No | Volume index (1 to nv) |
| elevationChange | number | m, ft | No | Elevation change (|Δzx| ≤ length) |

**Mode 3 Fields:**
| Field | Type | Unit | Required | Description |
|-------|------|------|----------|-------------|
| volumeNumber | number | - | No | Volume index (1 to nv) |
| deltaX | number | m, ft | No | X-direction change (Δxx) |
| deltaY | number | m, ft | No | Y-direction change (Δyx) |
| deltaZ | number | m, ft | No | Z-direction change (Δzx) |

**Validation Rules:**
- |elevationChange| ≤ corresponding volume length

### Tab 3: Friction Data (마찰 데이터)

#### Card CCC0801-0899: Volume Friction Data
| Field | Type | Unit | Required | Description |
|-------|------|------|----------|-------------|
| volumeNumber | number | - | Yes | Volume index (1 to nv) |
| roughness | number | m, ft | Yes | Wall roughness (≥ 0) |
| hydraulicDiameter | number | m, ft | Yes | Hydraulic diameter (0 = auto-calculate) |

**Validation Rules:**
- roughness < hydraulicDiameter / 2
- If hydraulicDiameter = 0, calculated as 2*√(area/π)

#### Card CCC0901-0999: Junction Loss Coefficients (Optional)
| Field | Type | Unit | Required | Description |
|-------|------|------|----------|-------------|
| junctionNumber | number | - | No | Junction index (1 to nv-1) |
| forwardLossCoef | number | - | No | Reynolds-independent forward loss coefficient |
| reverseLossCoef | number | - | No | Reynolds-independent reverse loss coefficient |

#### Card CCC2501-2599: Additional Wall Friction Data (Optional)
| Field | Type | Unit | Required | Description |
|-------|------|------|----------|-------------|
| volumeNumber | number | - | No | Volume index (1 to nv) |
| xShapeFactor | number | - | No | X-coordinate laminar shape factor (default: 1.0) |
| xViscRatioExp | number | - | No | X-coordinate viscosity ratio exponent (default: 0.0) |
| yShapeFactor | number | - | No | Y-coordinate laminar shape factor (default: 1.0) |
| yViscRatioExp | number | - | No | Y-coordinate viscosity ratio exponent (default: 0.0) |
| zShapeFactor | number | - | No | Z-coordinate laminar shape factor (default: 1.0) |
| zViscRatioExp | number | - | No | Z-coordinate viscosity ratio exponent (default: 0.0) |

#### Card CCC3001-3099: Junction Form Loss Data (Optional)
| Field | Type | Unit | Required | Description |
|-------|------|------|----------|-------------|
| junctionNumber | number | - | No | Junction index (1 to nv-1) |
| BF | number | - | No | Forward Reynolds-dependent coefficient |
| CF | number | - | No | Forward Reynolds exponent |
| BR | number | - | No | Reverse Reynolds-dependent coefficient |
| CR | number | - | No | Reverse Reynolds exponent |

**Loss Coefficient Formula:**
- Forward: KF = AF + BF × Re^(-CF)
- Reverse: KR = AR + BR × Re^(-CR)

### Tab 4: Control Flags (제어 플래그)

#### Card CCC1001-1099: Volume Control Flags
| Field | Format | Description | Options |
|-------|--------|-------------|---------|
| tFlag | tlpvbfe[0] | Thermal shear tracking model | 0: Not used, 1: Used |
| lFlag | tlpvbfe[1] | Level tracking model | 0: Not used, 1: Used |
| pFlag | tlpvbfe[2] | Water packing scheme | 0: Used, 1: Not used |
| vFlag | tlpvbfe[3] | Vertical stratification model | 0: Used, 1: Not used |
| bFlag | tlpvbfe[4] | Interfacial friction model | 0: Pipe, 1: Bundle, 2: ORNL ANS |
| fFlag | tlpvbfe[5] | Wall friction calculation | 0: Calculate, 1: Don't calculate |
| eFlag | tlpvbfe[6] | Thermal equilibrium | 0: Non-equilibrium, 1: Equilibrium |

**Special Considerations:**
- Thermal shear and level tracking: Vertical components only
- Equilibrium and non-equilibrium volumes should not be connected

#### Card CCC1101-1199: Junction Control Flags
| Field | Format | Description | Options |
|-------|--------|-------------|---------|
| eFlag | 0ef0cahs[1] | Modified PV term | 0: Not applied, 1: Applied |
| fFlag | 0ef0cahs[2] | CCFL option | 0: Not used, 1: Used |
| cFlag | 0ef0cahs[4] | Choking option | 0: Applied, 1: Not applied |
| aFlag | 0ef0cahs[5] | Area change option | 0: Smooth, 1: Abrupt, 2: Partial abrupt |
| hFlag | 0ef0cahs[6] | Homogeneous option | 0: Non-homogeneous, 1: Homogeneous, 2: Homogeneous |
| sFlag | 0ef0cahs[7] | Momentum flux option | 0: Both volumes, 1: From volume, 2: To volume, 3: Neither |

#### Card CCC3101-3199: ORNL ANS Interface Model Values (Conditional)
**Display Condition:** Any volume has bFlag = 2

| Field | Type | Unit | Required | Description |
|-------|------|------|----------|-------------|
| volumeNumber | number | - | Yes | Volume index with bFlag = 2 |
| gap | number | m, ft | Yes | Distance between side walls, short length, pitch, channel width |
| span | number | m, ft | Yes | End-to-end distance, long length |

### Tab 5: Initial Conditions (초기 조건)

#### Card CCC1201-1299: Volume Initial Conditions
| Field | Type | Options | Description |
|-------|------|---------|-------------|
| volumeNumber | number | - | Volume index (1 to nv) |
| fluidType | select | 0: Default, 1: H₂O, 2: D₂O, 3: Other | Working fluid type |
| boronPresent | select | 0: No boron, 1: Boron input required | Boron concentration input flag |
| thermoState | select | 0-6 | Thermodynamic state definition method |

**Thermodynamic State Options:**
- 0: [P, Uf, Ug, αg] - Non-equilibrium/equilibrium
- 1: [T, xs] - Equilibrium
- 2: [P, xs] - Equilibrium
- 3: [P, T] - Equilibrium
- 4: [P, T, xs] - Non-condensible gas
- 5: [T, xs, xn] - Non-condensible gas
- 6: [P, Uf, Ug, αg, xn] - Non-condensible gas

**Initial Values (1-5):**
Dynamic fields based on thermoState selection with appropriate units and descriptions.

#### Card CCC1300: Junction Condition Control Word (Optional)
| Field | Type | Options | Description |
|-------|------|---------|-------------|
| junctionCondWord | select | 0: Velocity input, 1: Mass flow input | Junction initial condition input method |

#### Card CCC1301-1399: Junction Initial Conditions
| Field | Type | Unit | Description |
|-------|------|------|-------------|
| junctionNumber | number | - | Junction index (1 to nv-1) |
| liquidValue | number | m/s, ft/s or kg/s, lb/s | Liquid velocity or mass flow |
| vaporValue | number | m/s, ft/s or kg/s, lb/s | Vapor velocity or mass flow |
| interfaceVelocity | number | m/s, ft/s | Interface velocity (set to 0) |

#### Card CCC1401-1499: Junction Diameter and CCFL Data (Optional)
| Field | Type | Unit | Description |
|-------|------|------|-------------|
| junctionNumber | number | - | Junction index (1 to nv-1) |
| junctionDiameter | number | m, ft | Hydraulic diameter (0 = auto-calculate) |
| floodingForm | number | - | CCFL correlation form (0-1) |
| gasIntercept | number | - | Gas intercept for CCFL (c) |
| slope | number | - | Slope for CCFL (m) |

**Conditional Display:** CCFL fields shown only when junction fFlag = 1

#### Card CCC2001-2099: Initial Boron Concentration (Conditional)
**Display Condition:** Any volume has boronPresent = 1

| Field | Type | Unit | Description |
|-------|------|------|-------------|
| volumeNumber | number | - | Volume index with boron |
| boronConcentration | number | - | Boron mass ratio to liquid mass |

## Validation Rules

### Cross-Field Validations
1. **Volume Consistency**: volume = area × length (tolerance: 1e-6)
2. **Elevation Constraints**: |elevationChange| ≤ corresponding volume length
3. **Hydraulic Diameter**: roughness < hydraulicDiameter / 2
4. **Dynamic Row Generation**: All tables adjust based on numberOfVolumes
5. **Conditional Field Display**: Complex conditional logic based on flag values

### Complex Validation Functions
- `validateVolume()`: Ensures volume equals area × length
- `validateElevationChange()`: Checks elevation change magnitude
- `validateHydraulicDiameter()`: Validates roughness vs diameter relationship
- `hasAnyBFlag2()`: Checks if ORNL ANS model data is needed
- `hasAnyBoronPresent1()`: Determines if boron concentration table is required
- `hasFFlag1()`: Checks if CCFL data fields should be displayed

## Input/Output Specifications

### Input Requirements
- **Minimum Required Fields**: numberOfVolumes, volume areas, lengths, vertical angles, friction data, control flags, initial conditions
- **Optional Fields**: Junction areas, volumes, azimuthal angles, elevation changes, loss coefficients, additional friction data, CCFL parameters, boron concentrations

### Output Format
The component generates formatted input cards following the pattern:
```
CCC0001  numberOfVolumes
CCC01XX  area  volumeNumber
CCC02XX  junctionArea  junctionNumber  (optional)
CCC03XX  length  volumeNumber
...and so on for all data cards
```

### Data Formatters
- `generateHeader()`: Creates component header
- `formatCard0001()`: Basic data formatting
- `formatCardRange0101to0199()`: Area data formatting
- `generateVolumeFlags()`: Flag string generation (tlpvbfe format)
- `generateJunctionFlags()`: Junction flag string generation (0ef0cahs format)

## Implementation Considerations

### React Component Integration
- **Dynamic Table Management**: Tables automatically add/remove rows based on numberOfVolumes
- **Conditional Field Display**: Complex conditional rendering based on flag states
- **Real-time Validation**: Field-level and cross-field validation with user feedback
- **State Management**: Zustand integration for undo/redo functionality

### Performance Considerations
- **Large Volume Counts**: Efficient handling of up to 99 volumes with associated junction data
- **Complex Flag Logic**: Optimized conditional display calculations
- **Memory Management**: Proper cleanup of dynamic table data

### User Experience
- **Progressive Disclosure**: Show/hide sections based on selections
- **Validation Feedback**: Clear error messages with specific validation failures
- **Data Consistency**: Automatic calculations where possible (hydraulic diameter, junction areas)
- **Help Text**: Context-sensitive guidance for complex fields

## Integration Points

### Component Connections
- **Upstream Connection**: Single input port (from)
- **Downstream Connection**: Single output port (to)
- **Flow Path**: Represents internal flow path with multiple volumes and junctions

### System Integration
- **ReactFlow Node**: Integrates as custom node type in visual editor
- **State Synchronization**: Maintains consistency with global application state
- **Validation Pipeline**: Participates in system-wide validation framework
- **Data Persistence**: Supports save/load operations with complete data integrity

## Constraints and Limitations

### Physical Constraints
- Maximum 99 volumes per pipe component
- Elevation changes cannot exceed volume lengths
- Wall roughness must be less than half the hydraulic diameter
- Equilibrium and non-equilibrium volumes should not be directly connected

### Implementation Constraints
- Interface velocity currently not implemented (must be set to 0)
- ORNL ANS model requires specific gap and span parameters
- CCFL model requires specific correlation parameters when enabled
- Boron concentration tracking requires explicit flag activation

### Performance Limitations
- Large volume counts may impact UI responsiveness
- Complex flag combinations require careful validation
- Memory usage scales with numberOfVolumes squared for some operations

This specification serves as the definitive reference for PIPE component implementation, maintenance, and integration within the thermal-hydraulic system modeling application.