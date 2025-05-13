import React, { useState, useEffect } from 'react';
import TmdpJun from './TmdpJun';
import { componentTypes } from '../node-editor/ComponentsType.jsx';
import { updateComponentTypes } from './AddTmdpJun';

/**
 * This component demonstrates how to integrate the TMDPJUN component
 * into the main application.
 */
const TmdpJunIntegration = () => {
  // Update component types with TMDPJUN
  const [updatedComponentTypes, setUpdatedComponentTypes] = useState(componentTypes);
  const [selectedNode, setSelectedNode] = useState({
    id: 'tmdpjun1',
    type: 'TMDPJUN',
    compNumber: '190',
    compName: 'inlet_flow',
    data: {
      fromConnection: '180010000',
      toConnection: '200000000',
      junctionArea: '0.01',
      eFlag: '0',
      controlWord: '0',
      tableTrip: '0',
      searchVariable: 'TIME',
      searchVarNum: '0',
      timeTableData: [
        { time: '0.0', liquidFlow: '0.0', vaporFlow: '0.0', interfaceVel: '0.0' },
        { time: '1.0', liquidFlow: '1.0', vaporFlow: '1.0', interfaceVel: '0.0' },
        { time: '2.0', liquidFlow: '2.0', vaporFlow: '2.0', interfaceVel: '0.0' },
        { time: '10.0', liquidFlow: '2.0', vaporFlow: '2.0', interfaceVel: '0.0' }
      ]
    }
  });

  // // Update component types on component mount
  // useEffect(() => {
  //   setUpdatedComponentTypes(updateComponentTypes(componentTypes));
  // }, []);

  /**
   * Handle property changes from the TmdpJun component
   * @param {string} nodeId - ID of the node being updated
   * @param {string} propName - Name of the property being updated
   * @param {any} value - New value of the property
   */
  const handlePropertyChange = (nodeId, propName, value) => {
    console.log(`Property changed - Node: ${nodeId}, Property: ${propName}, Value:`, value);
    
    setSelectedNode(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [propName]: value
      }
    }));
  };

  return (
    <div className="tmdpjun-integration">
      <h1>Time-Dependent Junction Component</h1>
      <p>This example demonstrates the TMDPJUN component integration.</p>
      
      <div className="component-container" style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '20px', margin: '20px 0' }}>
        <TmdpJun 
          selectedNode={selectedNode} 
          onPropertyChange={handlePropertyChange}
        />
      </div>
      
      <div className="debug-info">
        <h2>Component Data</h2>
        <pre>{JSON.stringify(selectedNode, null, 2)}</pre>
      </div>
    </div>
  );
};

export default TmdpJunIntegration;