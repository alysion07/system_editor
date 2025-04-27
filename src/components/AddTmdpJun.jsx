// This is a patch update to add TMDPJUN component to ComponentsType.jsx
// Import the TMDPJUN component definition
import { TMDPJUN } from './control/TmdpJunComponent';

// Update the componentTypes object with the TMDPJUN component
export function updateComponentTypes(componentTypes) {
  return {
    ...componentTypes,
    TMDPJUN
  };
}
