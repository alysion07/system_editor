// System design types for MARS/RELAP5 thermal-hydraulic analysis
export const SYSTEM_TYPES = {
  NUCLEAR: {
    id: 'nuclear',
    name: '원자로 계통',
    nameEn: 'Nuclear Reactor System',
    description: '가압경수로(PWR), 비등경수로(BWR), 소형모듈원자로(SMR) 등 원자로 시스템 설계',
    iconClass: 'fa-atom',
    color: '#FF6B6B',
    components: ['REACTOR', 'CORE', 'VESSEL', 'CONTROL_ROD']
  },
  THERMAL: {
    id: 'thermal',
    name: '열수력 계통',
    nameEn: 'Thermal-Hydraulic System',
    description: '열전달 및 유체역학 시스템, 증기발생기, 열교환기 설계',
    iconClass: 'fa-temperature-high',
    color: '#4ECDC4',
    components: ['HEAT_STRUCTURE', 'STEAM_GENERATOR', 'HEAT_EXCHANGER']
  },
  CONTROL: {
    id: 'control',
    name: '제어 계통',
    nameEn: 'Control System',
    description: '제어 논리, 계측 장비, 보호 시스템 설계',
    iconClass: 'fa-sliders-h',
    color: '#45B7D1',
    components: ['TRIP', 'CONTROL_VAR', 'LOGIC', 'SENSOR']
  },
  PIPING: {
    id: 'piping',
    name: '배관 계통',
    nameEn: 'Piping System',
    description: '배관 네트워크, 유량 분배, 압력 손실 계산',
    iconClass: 'fa-project-diagram',
    color: '#96CEB4',
    components: ['PIPE', 'VALVE', 'PUMP', 'JUNCTION', 'BRANCH']
  },
  SAFETY: {
    id: 'safety',
    name: '안전 계통',
    nameEn: 'Safety System',
    description: '비상노심냉각계통(ECCS), 격납용기, 안전주입계통',
    iconClass: 'fa-shield-alt',
    color: '#FFEAA7',
    components: ['ACCUMULATOR', 'ECCS', 'CONTAINMENT', 'SAFETY_INJECTION']
  }
};

// Get system type by ID
export const getSystemType = (id) => {
  return Object.values(SYSTEM_TYPES).find(type => type.id === id);
};

// Get all system types as array
export const getSystemTypesList = () => {
  return Object.values(SYSTEM_TYPES);
};

// Analysis status types
export const ANALYSIS_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  ERROR: 'error'
};

// Status display configuration
export const STATUS_CONFIG = {
  [ANALYSIS_STATUS.PENDING]: {
    label: '대기 중',
    labelEn: 'Pending',
    iconClass: 'fa-hourglass-half',
    color: '#95A5A6',
    bgColor: 'bg-gray-600/20'
  },
  [ANALYSIS_STATUS.RUNNING]: {
    label: '해석 중',
    labelEn: 'Running',
    iconClass: 'fa-spinner',
    color: '#F39C12',
    bgColor: 'bg-yellow-600/20',
    animation: 'animate-spin'
  },
  [ANALYSIS_STATUS.COMPLETED]: {
    label: '완료',
    labelEn: 'Completed',
    iconClass: 'fa-check-circle',
    color: '#27AE60',
    bgColor: 'bg-green-600/20'
  },
  [ANALYSIS_STATUS.ERROR]: {
    label: '오류',
    labelEn: 'Error',
    iconClass: 'fa-exclamation-circle',
    color: '#E74C3C',
    bgColor: 'bg-red-600/20'
  }
};