// utils/fileGenerator.js
import React, { useState } from 'react';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// MinIO 서버 정보와 버킷 이름을 설정합니다.
const S3_BUCKET = 'copainproject'; // 미리 생성된 버킷 이름
const REGION = 'us-east-1'; // MinIO는 특별한 지역 설정 없이 사용 가능
const ACCESS_KEY = 'minioadmin';
const SECRET_KEY = 'minioadmin';
const ENDPOINT = 'http://localhost:9000'; // MinIO 서버의 endpoint
const FORCE_PATH_STYLE = true; // MinIO는 path-style 접근을 사용해야 합니다.

const s3Client = new S3Client({
    region: REGION,
    endpoint: ENDPOINT,
    forcePathStyle: FORCE_PATH_STYLE,
    credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
    },
});

// 기본 카드 포맷팅 함수
const formatCardDefault = (compNumber, card, data, componentDef) => {
    // 여기서 카드 유형에 따른 기본 포맷팅 로직 구현
    // ...

    return formattedOutput;
};

export const generateInputFile = (componentDef, data) => {
    let output = '';

    // 컴포넌트 헤더 생성
    if (componentDef.formatters?.generateHeader) {
        output += componentDef.formatters.generateHeader({
            number: data.componentNumber?.padStart(3, '0') || '000',
            name: data.componentName || 'unnamed'
        });
    }

    // 각 카드 포맷터 함수 실행
    componentDef.properties.tabs.forEach(tab => {
        tab.cards.forEach(card => {
            const cardId = card.id.replace(/[A-Za-z]+/g, '');
            const formatterName = `formatCard${cardId}`;

            if (componentDef.formatters?.[formatterName]) {
                output += componentDef.formatters[formatterName](data);
            } else {
                // 기본 카드 포맷팅 로직
                output += formatCardDefault(data.componentNumber, card, data, componentDef);
            }
        });
    });

    return output;
};

// Generate input file for MARS code in Copain.txt format
export const generateMarsInputFile = (nodes, connections, projectName) => {
    let output = '';
    
    // Add header section
    output += `=reference problem: ${projectName}, MARS+CUPID\n`;
    output += '*\n';
    output += '100   new  transnt\n';
    output += '101   run\n';
    output += '*\n';
    output += '*\n';
    output += '102   si   si\n';
    output += '*04   none\n';
    output += '110   air    \n';
    output += '*\n';
    
    // Add time step control section
    output += '* time step control\n';
    output += '*\n';
    output += '201   20.0  1.0e-6  0.0001  3  1000    1000  2000\n';
    output += '*\n';
    output += '*\n';
    
    // Add minor edit section
    output += '* minor edit section\n';
    output += generateMinorEditSection(nodes, connections);
    output += '*\n';
    
    // Add hydrodynamic components section
    output += '*** hydrodynamic data ************************************************\n';
    output += '*\n';

    // Sort nodes by component number for better organization
    const sortedNodes = [...nodes].sort((a, b) => {
        const numA = parseInt(a.compNumber || '0');
        const numB = parseInt(b.compNumber || '0');
        return numA - numB;
    });
    
    // Process each node to generate its input section
    sortedNodes.forEach(node => {
        // Get the component definition from its type
        const componentType = node.type;
        
        // Generate the appropriate component section based on type
        switch(componentType) {
            case 'TMDPVOL':
                output += generateTmdpvolSection(node);
                break;
            case 'SNGLJUN':
                output += generateSngljunSection(node);
                break;
            case 'PIPE':
                output += generatePipeSection(node);
                break;
            case 'TMDPJUN':
                output += generateTmdpjunSection(node);
                break;
            case 'HEATSTR':
                output += generateHeatstrSection(node);
                break;
            case 'SNGLVOL':
                output += generateSnglvolSection(node);
                break;
            default:
                // For unhandled component types
                output += `* Unimplemented component type: ${componentType} for component ${node.compNumber}\n`;
        }
        
        output += '*\n';
    });
    
    // Add heat structure section if applicable
    const heatStructureNodes = nodes.filter(node => node.category === 'thermal');
    if (heatStructureNodes.length > 0) {
        output += '***********************************************************************\n';
        output += '*                                                                     *\n';
        output += '*             Heat Structure Thermal Property Data                    *\n';
        output += '*                                                                     *\n';
        output += '***********************************************************************\n';
        output += '*\n';
        // Add material properties
        output += generateHeatStructureMaterialSection();
    }
    
    // Add end of file marker
    output += '.\n';
    
    return output;
};

// Helper function to generate minor edit section based on nodes
const generateMinorEditSection = (nodes, connections) => {
    let output = '';
    let minorEditCounter = 301; // Starting minor edit card number
    
    // Generate standard minor edits for key components
    // Example: Flows at junctions
    const junctions = nodes.filter(node => 
        node.type === 'SNGLJUN' || node.type === 'TMDPJUN'
    );
    
    junctions.forEach(junction => {
        output += `${minorEditCounter}   mflowj  ${junction.compNumber}000000    0.0     15.0   1  ${minorEditCounter - 300}\n`;
        minorEditCounter++;
    });
    
    // Example: Pressures and temperatures at volumes
    const volumes = nodes.filter(node => 
        node.type === 'TMDPVOL' || node.type === 'PIPE' || node.type === 'SNGLVOL'
    );
    
    volumes.forEach(volume => {
        // For PIPE components, track the first and last volume
        if (volume.type === 'PIPE') {
            const numVolumes = parseInt(volume.data?.numberOfVolumes || '1');
            
            // First volume pressure
            output += `${minorEditCounter}   p   ${volume.compNumber}010000    1.d5      1.d7   16   ${minorEditCounter - 300}\n`;
            minorEditCounter++;
            
            // Last volume pressure
            const lastVolume = numVolumes.toString().padStart(2, '0');
            output += `${minorEditCounter}   p   ${volume.compNumber}${lastVolume}0000    1.d5      1.d7   16   ${minorEditCounter - 300}\n`;
            minorEditCounter++;
            
            // Temperature monitoring
            output += `${minorEditCounter}   tempf  ${volume.compNumber}010000    0.    600.    2     ${minorEditCounter - 300}\n`;
            minorEditCounter++;
            
            // Void fraction monitoring for first few volumes
            for (let i = 1; i <= Math.min(numVolumes, 5); i++) {
                const volNum = i.toString().padStart(2, '0');
                output += `${minorEditCounter}   voidg  ${volume.compNumber}${volNum}0000    0.    1.    2     ${minorEditCounter - 300}\n`;
                minorEditCounter++;
            }
        } else {
            // For single volumes
            output += `${minorEditCounter}   p   ${volume.compNumber}010000    1.d5      1.d7   16   ${minorEditCounter - 300}\n`;
            minorEditCounter++;
            
            output += `${minorEditCounter}   tempf  ${volume.compNumber}010000    0.    600.    2     ${minorEditCounter - 300}\n`;
            minorEditCounter++;
            
            output += `${minorEditCounter}   voidg  ${volume.compNumber}010000    0.    1.    2     ${minorEditCounter - 300}\n`;
            minorEditCounter++;
        }
    });
    
    // Add heat structure monitoring if applicable
    const heatStructures = nodes.filter(node => node.category === 'thermal');
    
    heatStructures.forEach(hs => {
        // Monitor temperatures at different points
        const hsNum = hs.compNumber.padStart(5, '0');
        for (let i = 1; i <= 4; i++) {
            const pointNum = (i * 2).toString().padStart(2, '0');
            output += `${minorEditCounter}  httemp  ${hsNum}${pointNum}01  280.    480.    3   ${minorEditCounter - 300}\n`;
            minorEditCounter++;
        }
        
        // Monitor heat transfer coefficients
        for (let i = 1; i <= 5; i++) {
            const surfaceNum = (i * 2).toString().padStart(2, '0');
            output += `${minorEditCounter}  hthtc  ${hsNum}${surfaceNum}00  280. 480. 4  ${minorEditCounter - 300}\n`;
            minorEditCounter++;
        }
    });
    
    return output;
};

// Helper function for generating SNGLVOL component section
const generateSnglvolSection = (node) => {
    const data = node.data || {};
    const compNumber = node.compNumber || '000';
    const compName = node.compName || 'unnamed';
    
    let output = `* component ${compNumber}: ${compName} single volume\n`;
    output += `${compNumber}0000  ${compName}  snglvol\n`;
    
    // Format X-coordinates data
    output += `${compNumber}0101  ${data.area || '0.30'}  ${data.length || '1.00'}  ${data.volume || '0.0'}  `;
    output += `${data.azimuthal || '0.0'}  ${data.inclination || '-90.0'}  ${data.elevation || '-1.0'}\n`;
    output += `${compNumber}0102  ${data.roughness || '0.0001'}  ${data.hydraulic || '0.0'}\n`;
    
    // Generate volume control flags if available
    let volumeFlags = "0000000"; // Default: all options disabled
    if (data.tFlag || data.lFlag || data.pFlag || data.vFlag || data.bFlag || data.fFlag || data.eFlag) {
        volumeFlags = 
            (data.tFlag ? '1' : '0') + 
            (data.lFlag ? '1' : '0') + 
            (data.pFlag ? '1' : '0') + 
            (data.vFlag ? '1' : '0') + 
            (data.bFlag || '0') + 
            (data.fFlag ? '1' : '0') + 
            (data.eFlag ? '1' : '0');
    }
    output += `${compNumber}0108  ${volumeFlags}\n`;
    
    // Format ORNL ANS interface model data if applicable
    if (data.bFlag === '2') {
        output += `${compNumber}0111  ${data.gap || '0.0'}  ${data.span || '0.0'}\n`;
    }
    
    // Format wall friction data if available
    if (data.xShape || data.xVisc || data.yShape || data.yVisc || data.zShape || data.zVisc) {
        output += `${compNumber}0131  ${data.xShape || '1.0'}  ${data.xVisc || '0.0'}  `;
        output += `${data.yShape || '1.0'}  ${data.yVisc || '0.0'}  ${data.zShape || '1.0'}  ${data.zVisc || '0.0'}\n`;
    }
    
    // Format initial conditions
    const thermoState = data.thermoState || '3';
    output += `${compNumber}0200  ${thermoState}\n`;
    
    // Format appropriate thermodynamic state data based on thermoState
    switch(thermoState) {
        case '0': // [P, Uf, Ug, αg]
            output += `${compNumber}0201  ${data.pressure0 || '1.02e+5'}  ${data.liquidEnergy0 || '1.0e+5'}  `;
            output += `${data.vaporEnergy0 || '2.5e+5'}  ${data.voidFraction0 || '0.0'}\n`;
            break;
        case '1': // [T, xs]
            output += `${compNumber}0201  ${data.temperature1 || '350.0'}  ${data.staticQuality1 || '0.0'}\n`;
            break;
        case '2': // [P, xs]
            output += `${compNumber}0201  ${data.pressure2 || '1.02e+5'}  ${data.staticQuality2 || '0.0'}\n`;
            break;
        case '3': // [P, T]
            output += `${compNumber}0201  ${data.pressure3 || '1.02e+5'}  ${data.temperature3 || '350.0'}\n`;
            break;
        case '4': // [P, T, xs]
            output += `${compNumber}0201  ${data.pressure4 || '1.02e+5'}  ${data.temperature4 || '350.0'}  `;
            output += `${data.staticQuality4 || '0.0'}\n`;
            break;
        case '5': // [T, xs, xn]
            output += `${compNumber}0201  ${data.temperature5 || '350.0'}  ${data.staticQuality5 || '0.5'}  `;
            output += `${data.nonCondQuality5 || '0.01'}\n`;
            break;
        case '6': // [P, Uf, Ug, αg, xn]
            output += `${compNumber}0201  ${data.pressure6 || '1.02e+5'}  ${data.liquidEnergy6 || '1.0e+5'}  `;
            output += `${data.vaporEnergy6 || '2.5e+5'}  ${data.voidFraction6 || '0.5'}  `;
            output += `${data.nonCondQuality6 || '0.01'}\n`;
            break;
        default:
            output += `${compNumber}0201  1.02e+5  350.0\n`; // Default values for [P, T]
    }
    
    return output;
};

// Helper function for generating TMDPVOL component section
const generateTmdpvolSection = (node) => {
    const data = node.data || {};
    const compNumber = node.compNumber || '000';
    const compName = node.compName || 'unnamed';
    
    let output = `* component ${compNumber}: ${compName} time-dependent volume\n`;
    output += `${compNumber}0000  ${compName}  tmdpvol\n`;
    
    // Format geometry data
    output += `${compNumber}0101  ${data.area || '0.30'}   ${data.length || '1.00'}  `;
    output += `${data.volume || '0.0'}  ${data.azimuthal || '0.0'}  ${data.inclination || '-90.0'}  `;
    output += `${data.elevation || '-1.0'}\n`;
    output += `${compNumber}0102  ${data.roughness || '0.0001'}  ${data.hydraulic || '0.0'}  ${data.volumeFlags || '00000'}\n`;
    
    // Format control word data
    const controlWord = `${data.fluidType || '0'}${data.boronPresent || '0'}${data.thermoState || '3'}`;
    let controlLine = `${compNumber}0200  ${controlWord}`;
    
    if (data.tableTrip) {
        controlLine += `  ${data.tableTrip}`;
        if (data.varNamePart) {
            controlLine += `  ${data.varNamePart}  ${data.varNumPart || '0'}`;
        }
    }
    output += controlLine + '\n';
    
    // Format time table data
    // Check if we have time table data in an array
    if (data.timeTableData && Array.isArray(data.timeTableData) && data.timeTableData.length > 0) {
        // Process each time entry
        data.timeTableData.forEach((entry, index) => {
            const cardNumber = 201 + index;
            let timeLine = `${compNumber}0${cardNumber}   ${entry.time}  `;
            
            // Format based on thermal state type
            switch(data.thermoState) {
                case '0': // [P, Uf, Ug, αg]
                    timeLine += `${entry.pressure0}  ${entry.liquidEnergy0}  ${entry.vaporEnergy0}  ${entry.voidFraction0}`;
                    break;
                case '1': // [T, xs]
                    timeLine += `${entry.temperature1}  ${entry.staticQuality1}`;
                    break;
                case '2': // [P, xs]
                    timeLine += `${entry.pressure2}  ${entry.staticQuality2}`;
                    break;
                case '3': // [P, T]
                    timeLine += `${entry.pressure3 || data.pressure3 || '1.02e+5'}  ${entry.temperature3 || data.temperature3 || '352.33'}`;
                    break;
                case '4': // [P, T, xs]
                    timeLine += `${entry.pressure4}  ${entry.temperature4}  ${entry.staticQuality4}`;
                    break;
                case '5': // [T, xs, xn]
                    timeLine += `${entry.temperature5}  ${entry.staticQuality5}  ${entry.nonCondQuality5}`;
                    break;
                case '6': // [P, Uf, Ug, αg, xn]
                    timeLine += `${entry.pressure6}  ${entry.liquidEnergy6}  ${entry.vaporEnergy6}  `;
                    timeLine += `${entry.voidFraction6}  ${entry.nonCondQuality6}`;
                    break;
                default: // Default to [P, T]
                    timeLine += `${entry.pressure || '1.02e+5'}  ${entry.temperature || '352.33'}`;
            }
            
            // Add boron concentration if needed
            if (data.boronPresent === '1') {
                const boronKey = `boronConc${data.thermoState}`;
                timeLine += `  ${entry[boronKey] || '0.0'}`;
            }
            
            output += timeLine + '\n';
        });
    } else {
        // Create at least one default time entry if no data available
        let defaultTimeLine = `${compNumber}0201   0.0  `;
        
        // Add default values based on thermal state
        switch(data.thermoState) {
            case '0': // [P, Uf, Ug, αg]
                defaultTimeLine += `${data.pressure0 || '1.02e+5'}  ${data.liquidEnergy0 || '1.0e+5'}  `;
                defaultTimeLine += `${data.vaporEnergy0 || '2.5e+5'}  ${data.voidFraction0 || '0.0'}`;
                break;
            case '1': // [T, xs]
                defaultTimeLine += `${data.temperature1 || '352.33'}  ${data.staticQuality1 || '0.0'}`;
                break;
            case '2': // [P, xs]
                defaultTimeLine += `${data.pressure2 || '1.02e+5'}  ${data.staticQuality2 || '0.0'}`;
                break;
            case '3': // [P, T]
                defaultTimeLine += `${data.pressure3 || '1.02e+5'}  ${data.temperature3 || '352.33'}`;
                break;
            case '4': // [P, T, xs]
                defaultTimeLine += `${data.pressure4 || '1.02e+5'}  ${data.temperature4 || '350.0'}  `;
                defaultTimeLine += `${data.staticQuality4 || '0.0'}`;
                break;
            case '5': // [T, xs, xn]
                defaultTimeLine += `${data.temperature5 || '350.0'}  ${data.staticQuality5 || '0.5'}  `;
                defaultTimeLine += `${data.nonCondQuality5 || '0.01'}`;
                break;
            case '6': // [P, Uf, Ug, αg, xn]
                defaultTimeLine += `${data.pressure6 || '1.02e+5'}  ${data.liquidEnergy6 || '1.0e+5'}  `;
                defaultTimeLine += `${data.vaporEnergy6 || '2.5e+5'}  ${data.voidFraction6 || '0.0'}  `;
                defaultTimeLine += `${data.nonCondQuality6 || '0.0'}`;
                break;
            default: // Default to [P, T]
                defaultTimeLine += `1.02e+5  352.33`;
        }
        
        // Add boron concentration if needed
        if (data.boronPresent === '1') {
            defaultTimeLine += `  ${data[`boronConc${data.thermoState}`] || '0.0'}`;
        }
        
        output += defaultTimeLine + '\n';
        
        // Add a second entry for endtime if not provided
        output += `${compNumber}0202   999.0  ` + defaultTimeLine.split('  ').slice(1).join('  ') + '\n';
    }
    
    return output;
};

// Helper function for generating SNGLJUN component section
const generateSngljunSection = (node) => {
    const data = node.data || {};
    const compNumber = node.compNumber || '000';
    const compName = node.compName || 'unnamed';
    
    let output = `* component ${compNumber}: ${compName} single junction\n`;
    output += `${compNumber}0000  ${compName}  sngljun\n`;
    
    // Format connection data
    output += `${compNumber}0101  ${data.fromConnection || '000000000'}  ${data.toConnection || '000000000'}  `;
    output += `${data.junctionArea || '0.010'}  ${data.forwardLossCoef || '0.05'}  ${data.reverseLossCoef || '0.05'}  `;
    
    // Format junction flags - more detailed implementation from component properties
    let jFlags = '';
    
    if (data.junctionFlags && typeof data.junctionFlags === 'object') {
        jFlags = (data.junctionFlags.jFlag || '0') + 
                  (data.junctionFlags.eFlag || '0') + 
                  (data.junctionFlags.fFlag || '0') + 
                  (data.junctionFlags.vFlag || '0') + 
                  (data.junctionFlags.cFlag || '0') + 
                  (data.junctionFlags.aFlag || '0') + 
                  (data.junctionFlags.hFlag || '0') + 
                  (data.junctionFlags.sFlag || '0');
    } else {
        jFlags = data.junctionFlagsString || '00000000';
    }
    
    output += jFlags + '\n';
    
    // Add hydraulic diameter and CCFL data if applicable
    if (data.hydraulicDiameter || (data.junctionFlags?.fFlag === '1' && 
       (data.floodingForm || data.gasIntercept || data.slope))) {
        
        output += `${compNumber}0110  ${data.hydraulicDiameter || '0.0'}`;
        
        if (data.junctionFlags?.fFlag === '1') {
            if (data.floodingForm) output += `  ${data.floodingForm}`;
            if (data.gasIntercept) output += `  ${data.gasIntercept}`;
            if (data.slope) output += `  ${data.slope}`;
        }
        
        output += '\n';
    }
    
    // Add form loss data if applicable
    if (data.BF || data.CF || data.BR || data.CR) {
        output += `${compNumber}0111  ${data.BF || '0.0'}  ${data.CF || '0.0'}  ${data.BR || '0.0'}  ${data.CR || '0.0'}\n`;
    }
    
    // Format initial conditions
    output += `${compNumber}0201  ${data.initControlWord || '1'}    `;
    
    if (data.initControlWord === '0') {
        output += `${data.initLiquidVel || '0.0'}  ${data.initVaporVel || '0.0'}  `;
    } else {
        output += `${data.initLiquidFlow || '0.0'}  ${data.initVaporFlow || '0.0'}  `;
    }
    
    output += `${data.interfaceVelocity || '0.0'}\n`;
    
    return output;
};

// Helper function for generating TMDPJUN component section
const generateTmdpjunSection = (node) => {
    const data = node.data || {};
    const compNumber = node.compNumber || '000';
    const compName = node.compName || 'unnamed';
    
    let output = `* component ${compNumber}: ${compName} time-dependent junction\n`;
    output += `${compNumber}0000  ${compName}  tmdpjun\n`;
    
    // Connection data
    output += `${compNumber}0101  ${data.fromConnection || '000000000'}  ${data.toConnection || '000000000'}  `;
    output += `${data.junctionArea || '0.3000'}\n`;
    
    // Format e-flag (only applicable flag for TMDPJUN)
    let junctionFlags = "0000000";
    if (data.eFlag === "1") {
        junctionFlags = "0100000";
    }
    output += `${compNumber}0101  ${data.fromConnection || '000000000'}  ${data.toConnection || '000000000'}  `;
    output += `${data.junctionArea || '0.3000'}  ${junctionFlags}\n`;
    
    // Time table data
    output += `${compNumber}0200  ${data.controlWord || '0'}`;
    
    if (data.tableTrip) {
        output += `  ${data.tableTrip}`;
        
        if (data.searchVariable) {
            output += `  ${data.searchVariable}  ${data.searchVarNum || '0'}`;
        }
    }
    output += '\n';
    
    // Format time table entries
    if (data.timeTableData && Array.isArray(data.timeTableData) && data.timeTableData.length > 0) {
        data.timeTableData.forEach((entry, index) => {
            const cardNumber = 201 + index;
            output += `${compNumber}0${cardNumber}  ${entry.time}  ${entry.liquidFlow}  ${entry.vaporFlow}  ${entry.interfaceVel || '0.0'}\n`;
        });
    } else {
        // Default time entries if not provided
        output += `${compNumber}0201    0.0   ${data.liquidFlow || '1.0'}   ${data.vaporFlow || '1.0'}  0.0\n`;
        output += `${compNumber}0202   10.0   ${data.liquidFlow || '1.0'}   ${data.vaporFlow || '1.0'}  0.0\n`;
    }
    
    return output;
};

// Helper function for generating PIPE component section
const generatePipeSection = (node) => {
    const data = node.data || {};
    const compNumber = node.compNumber || '000';
    const compName = node.compName || 'unnamed';
    
    let output = `* component ${compNumber}: ${compName} pipe\n`;
    output += `${compNumber}0000  ${compName}  pipe\n`;
    output += `${compNumber}0001  ${data.numberOfVolumes || '5'}\n`;
    
    const nv = parseInt(data.numberOfVolumes || '5');
    
    // Process area data
    if (data.xAreaTable && Array.isArray(data.xAreaTable) && data.xAreaTable.length > 0) {
        // Process individual volume areas if available
        const areaEntries = [];
        for (let i = 1; i <= nv; i++) {
            const entry = data.xAreaTable.find(e => parseInt(e.volumeNumber) === i);
            if (entry) {
                if (areaEntries.length > 0 && entry.area === areaEntries[areaEntries.length - 1].value) {
                    // Extend the last entry's repeat count
                    areaEntries[areaEntries.length - 1].repeat++;
                } else {
                    // Add new entry
                    areaEntries.push({ value: entry.area, repeat: 1 });
                }
            }
        }
        
        // Format area entries
        areaEntries.forEach((entry, i) => {
            output += `${compNumber}0101  ${entry.value}  ${entry.repeat}\n`;
        });
    } else {
        // Use single area value for all volumes
        output += `${compNumber}0101  ${data.area || '0.30'}  ${nv}\n`;
    }
    
    // Process junction area data if available
    if (data.junctionAreaTable && Array.isArray(data.junctionAreaTable) && data.junctionAreaTable.length > 0) {
        const juncAreaEntries = [];
        for (let i = 1; i < nv; i++) {
            const entry = data.junctionAreaTable.find(e => parseInt(e.junctionNumber) === i);
            if (entry) {
                if (juncAreaEntries.length > 0 && entry.junctionArea === juncAreaEntries[juncAreaEntries.length - 1].value) {
                    juncAreaEntries[juncAreaEntries.length - 1].repeat++;
                } else {
                    juncAreaEntries.push({ value: entry.junctionArea, repeat: 1 });
                }
            }
        }
        
        // Format junction area entries
        juncAreaEntries.forEach((entry, i) => {
            output += `${compNumber}0201  ${entry.value}  ${entry.repeat}\n`;
        });
    }
    
    // Process length data
    if (data.xLengthTable && Array.isArray(data.xLengthTable) && data.xLengthTable.length > 0) {
        const lengthEntries = [];
        for (let i = 1; i <= nv; i++) {
            const entry = data.xLengthTable.find(e => parseInt(e.volumeNumber) === i);
            if (entry) {
                if (lengthEntries.length > 0 && entry.length === lengthEntries[lengthEntries.length - 1].value) {
                    lengthEntries[lengthEntries.length - 1].repeat++;
                } else {
                    lengthEntries.push({ value: entry.length, repeat: 1 });
                }
            }
        }
        
        // Format length entries
        lengthEntries.forEach((entry, i) => {
            output += `${compNumber}0301  ${entry.value}  ${entry.repeat}\n`;
        });
    } else {
        // Use single length value for all volumes
        output += `${compNumber}0301  ${data.length || '0.10'}  ${nv}\n`;
    }
    
    // Volume data (usually calculated but we'll use 0.0 for auto-calculation)
    output += `${compNumber}0401  ${data.volume || '0.0'}  ${nv}\n`;
    
    // Azimuthal angle
    if (data.azimuthal) {
        output += `${compNumber}0501  ${data.azimuthal}  ${nv}\n`;
    }
    
    // Inclination angle
    output += `${compNumber}0601  ${data.inclination || '-90.0'}  ${nv}\n`;
    
    // Elevation change data
    if (data.elevation) {
        output += `${compNumber}0701  ${data.elevation}  ${nv}\n`;
    }
    
    // Wall roughness and hydraulic diameter
    output += `${compNumber}0801  ${data.roughness || '0.0001'}  ${data.hydraulic || '0.0'}  ${nv}\n`;
    
    // Flags for junction and volume control
    output += `${compNumber}0901  ${data.junctionFlags || '0.0  0.0'}  ${nv - 1}\n`;
    output += `${compNumber}1001  ${data.volumeControlFlags || '00000'}  ${nv}\n`;
    output += `${compNumber}1101  ${data.junctionControlFlags || '000000'}  ${nv - 1}\n`;
    
    // Initial conditions
    output += `${compNumber}1201  ${data.thermoState || '003'}  ${data.pressure || '1.02e+5'}  `;
    output += `${data.temperature || '352.33'}  ${data.quality || '0.0'}  ${data.boron || '0.0'}  `;
    output += `${data.nonCond || '0.0'}  ${nv}\n`;
    
    // Add junction initial velocity
    output += `${compNumber}1300  ${data.initControlWord || '1'}\n`;
    output += `${compNumber}1301  ${data.initVel || '0.0'}  ${data.initVapVel || '0.0'}  ${data.interfaceVel || '0.0'}  ${nv - 1}\n`;
    
    return output;
};

// Helper function for generating HEATSTR component section
const generateHeatstrSection = (node) => {
    const data = node.data || {};
    const compNumber = node.compNumber || '1000'; // Heat structures often use 5-digit numbers
    const compName = node.compName || 'unnamed';
    
    let output = `* component ${compNumber}: ${compName} heat structure\n`;
    
    // Format a 5-digit component number with a leading 1 for heat structures
    const formattedCompNumber = parseInt(compNumber).toString().padStart(5, '0');
    
    // Basic heat structure data
    output += `1${formattedCompNumber}000  ${data.numberOfHS || '10'}  ${data.geometryType || '2'}  `;
    output += `${data.steadyState || '1'}  ${data.reflood || '0'}  ${data.refloodBias || '0.0'}\n`;
    
    // Mesh data
    output += `1${formattedCompNumber}100  ${data.meshFormat || '0'}  ${data.meshPts || '2'}\n`;
    output += `1${formattedCompNumber}101  ${data.meshInterval || '0.001'}  ${data.meshIntervalCount || '1'}\n`;
    
    // Material data
    output += `1${formattedCompNumber}201  ${data.material || '3'}  ${data.materialPoint || '1'}\n`;
    
    // Internal source data
    output += `1${formattedCompNumber}301  ${data.heatSource || '1.'}  ${data.sourcePoint || '1'}\n`;
    
    // Initialization data
    output += `1${formattedCompNumber}400  ${data.initType || '0'}\n`;
    output += `1${formattedCompNumber}401  ${data.initTemp || '300.6'}  ${data.pointCount || '2'}\n`;
    
    // Left boundary condition
    output += `1${formattedCompNumber}501  ${data.leftBoundary || '150010000'}  ${data.boundaryType || '10000'}  `;
    output += `${data.incSurfaceCode || '100'}  ${data.boundaryCondValue || '0'}  ${data.boundaryCondHeight || '0.12'}  ${data.hsCount || '10'}\n`;
    
    // Right boundary condition
    output += `1${formattedCompNumber}601  ${data.rightBoundary || '-500'}  ${data.rightSurfaceCode || '0'}  `;
    output += `${data.rightIncSurfaceCode || '1500'}  ${data.rightBoundCondValue || '0'}  `;
    output += `${data.rightBoundCondHeight || '0.12'}  ${data.hsCount || '10'}\n`;
    
    // Additional required data sections
    output += `1${formattedCompNumber}701  ${data.sourceType || '0'}  ${data.sourceMult || '0.1'}  `;
    output += `${data.sourceExp || '0.'}  ${data.dummy || '0.'}  ${data.hsCount || '10'}\n`;
    
    // Additional data for heat transfer correlations
    output += `1${formattedCompNumber}800  ${data.leftHtcCorr || '0'}\n`;
    output += `1${formattedCompNumber}801  ${data.leftCorr || '6.180387d-1'}  ${data.leftLaminar || '0.5'}  ${data.leftTurbulent || '0.5'}  `;
    output += `${data.leftNaturalConv || '0.'}  ${data.hsCount || '10'}\n`;
    
    output += `1${formattedCompNumber}900  ${data.rightHtcCorr || '0'}\n`;
    output += `1${formattedCompNumber}901  ${data.rightCorr || '6.180387d-1'}  ${data.rightLaminar || '0.5'}  ${data.rightTurbulent || '0.5'}  `;
    output += `${data.rightNaturalConv || '0.'}  ${data.hsCount || '10'}\n`;
    
    return output;
};

// Helper function to generate the material property section for heat structures
const generateHeatStructureMaterialSection = () => {
    let output = '';
    
    // Add Cu - Heater plate material properties
    output += '****************************************************************\n';
    output += '*   Cu - Heater plate\n';
    output += '****************************************************************\n';
    output += '*             temp (k)   volumetric heat capacity (j/m3.k)\n';
    output += '*\n';
    output += '20100300   tbl/fctn         1                      1\n';
    output += '20100351    .273e+03     .3445882e+07\n';
    output += '20100352    .300e+03     .3439157e+07\n';
    output += '20100353    .400e+03     .3544605e+07\n';
    output += '20100354    .500e+03     .3613069e+07\n';
    output += '20100355    .600e+03     .3664034e+07\n';
    output += '20100356    .700e+03     .3708121e+07\n';
    output += '20100357    .800e+03     .3753589e+07\n';
    output += '20100358    .900e+03     .3807098e+07\n';
    output += '*\n';
    output += '*             temp (k)   thermal conductivity (w/m.k)\n';
    output += '*\n';
    output += '20100301    .173e+03    .420e+02\n';
    output += '20100302    .273e+03    .403e+02\n';
    output += '20100303    .373e+03    .395e+02\n';
    output += '20100304    .573e+03    .381e+02\n';
    output += '20100305    .973e+03    .354e+02\n';
    output += '*\n';
    
    return output;
};

// Function to save the generated input file
export const saveInputFile = (content, filename = 'mars_input.txt') => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const UploadFile = () => {
    const [message, setMessage] = useState('');

    const handleUpload = async () => {
        // 업로드할 파일의 내용과 메타데이터를 설정합니다.
        const params = {
            Bucket: S3_BUCKET,
            Key: 'User1/Proejct-1/copain.txt', // 서버에 생성될 파일 이름
            Body: 'This is a sample text file created from the client side.', // 파일 내용
            ContentType: 'text/plain',
        };

        try {
            const data = await s3Client.send(new PutObjectCommand(params));
            setMessage('파일 업로드 성공: ' + JSON.stringify(data));
        } catch (err) {
            setMessage('파일 업로드 실패: ' + err.message);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>MinIO 서버에 샘플 txt 파일 업로드</h1>
            <button onClick={handleUpload}>샘플 txt 파일 생성</button>
            {message && <p>{message}</p>}
        </div>
    );
};
