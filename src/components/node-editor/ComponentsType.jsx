// Component imports
import SNGLVOL from './components/SNGLVOL.js';
import TMDPVOL from './components/TMDPVOL.js';
import SNGLJUN from './components/SNGLJUN.js';
import PIPE from './components/PIPE.js';
import HTSTR from './components/HTSTR.js';
import PUMP from './components/PUMP.js';
import BRANCH from './components/BRANCH.js';
import ANNULUS from './components/ANNULUS.js';
import PRIZER from './components/PRIZER.js';

// Unified VALVE component import (replaces 6 individual valve types)
import VALVE from './components/UnifiedValve.js';

export const componentTypes = {
    SNGLVOL,
    TMDPVOL,
    SNGLJUN,
    PIPE,
    HTSTR,
    PUMP,
    BRANCH,
    ANNULUS,
    PRIZER,
    VALVE
};


// Group components by category
export const componentCategories = {
    flow: 'Flow Components',
    source: 'Sources',
    thermal: 'Thermal Components',
    control: 'Control Components',
    structure: 'Structural Components',
    hydro: 'Hydrodynamic Components',
};