import React, { useState } from 'react';
import './styles/GeneralSettingPane.css'; // CSS 분리 파일 임포트

const GAS_SPECIES = ['Argon', 'Helium', 'Hydrogen', 'Nitrogen', 'Xenon', 'Krypton', 'Air', 'SF6'];
const FLUID_OPTIONS = ['Default Fluid', 'Water', 'Heavy Water'];
const PROBLEM_TYPES = ['NEW', 'CONTINUE'];
const PROBLEM_OPTIONS = ['TRANSNT', 'STEADY'];
const INPUT_CHECKS = ['RUN', 'CHECK'];
const UNITS = ['British', 'SI'];

export default function GeneralSettingPane() {
    const [activeTab, setActiveTab] = useState('general');

    // General settings
    const [miscOptions, setMiscOptions] = useState('');
    const [problemType, setProblemType] = useState(PROBLEM_TYPES[0]);
    const [problemOption, setProblemOption] = useState(PROBLEM_OPTIONS[0]);
    const [inputCheck, setInputCheck] = useState(INPUT_CHECKS[0]);
    const [inputUnits, setInputUnits] = useState(UNITS[0]);
    const [outputUnits, setOutputUnits] = useState(UNITS[1]);

    // Time Step Control
    const [endTime, setEndTime] = useState('');
    const [minStep, setMinStep] = useState('');
    const [maxStep, setMaxStep] = useState('');
    const [controlOption, setControlOption] = useState('');
    const [minorFreq, setMinorFreq] = useState('');
    const [majorFreq, setMajorFreq] = useState('');
    const [restartFreq, setRestartFreq] = useState('');

    // Noncondensable gases
    const [selectedGases, setSelectedGases] = useState([]);
    const [fluid, setFluid] = useState(FLUID_OPTIONS[0]);

    // Has Boron (separate)
    const [hasBoron, setHasBoron] = useState(false);

    // Advanced settings
    const [devModel, setDevModel] = useState(Array(91).fill(0));
    const handleDevChange = (idx, val) => {
        const updated = [...devModel];
        updated[idx] = Number(val);
        setDevModel(updated);
    };

    const [multipliers, setMultipliers] = useState({10: 0, 11: 0, 12: 0, 13: 0, 14: 0});
    const handleMultChange = (card, val) => {
        setMultipliers(prev => ({ ...prev, [card]: Number(val) }));
    };

    const [generatedText, setGeneratedText] = useState('');

    const handleSubmit = e => {
        e.preventDefault();
        let lines = [];
        // Card 1 - Developmental Model Control
        lines.push("! Card 1: Developmental Model Control (W1–91)");
        for (let i = 0; i < 91; i += 10) {
            const chunk = devModel.slice(i, i+10).map(v => v.toString().padStart(4, ' '));
            lines.push(' ' + chunk.join(' '));
        }
        // Cards 10–14: Model Multipliers
        lines.push("! Cards 10–14: Model Multipliers");
        [10,11,12,13,14].forEach(card => {
            lines.push(` ${card.toString().padStart(3,' ')}  ${multipliers[card]}`);
        });
        // Noncondensable Gases: Card 110 & 115
        if (selectedGases.length) {
            lines.push("! Card 110: Noncondensable Gas Species");
            lines.push(' ' + selectedGases.join(' '));
            lines.push("! Card 115: Mass Fractions");
            const fractions = Array(selectedGases.length).fill((1/selectedGases.length).toFixed(3));
            lines.push(' ' + fractions.join(' '));
        }
        // Has Boron: Card 120
        lines.push("! Card 120: Has Boron");
        lines.push(` ${hasBoron ? 1 : 0}`);
        // Time Step Control
        lines.push("! Time Step Control");
        lines.push(` EndTime=${endTime}, MinStep=${minStep}, MaxStep=${maxStep}`);
        lines.push(` ControlOpt=${controlOption}, MinorFreq=${minorFreq}, MajorFreq=${majorFreq}, RestartFreq=${restartFreq}`);

        setGeneratedText(lines.join('\n'));
    };

    return (

        <form onSubmit={handleSubmit} className="mars-input-container">
            <div className="header-container" >
                <h1 className="title">Input Setting </h1>
            </div>
                <div className = "container-body">
                    <div className="tabs">
                        <button type="button" onClick={() => setActiveTab('general')} className={`tab-button ${activeTab==='general'?'tab-active':''}`}>General</button>
                        <button type="button" onClick={() => setActiveTab('advanced')} className={`tab-button ${activeTab==='advanced'?'tab-active':''}`}>Advanced</button>
                    </div>
                    {activeTab === 'general' && (
                        <>
                        {/* General Controls */}
                        <div className="form-group">
                            <label>Option Numbers (W1–91)</label>
                            <input type="text" value={miscOptions} onChange={e => setMiscOptions(e.target.value)} placeholder="e.g. 1, -4, 8" className="input" />
                        </div>
                        <div className="grid-4 gap">
                            {/* Problem Type & Option */}
                            <div>
                                <label>Problem Type</label>
                                <select value={problemType} onChange={e => setProblemType(e.target.value)} className="select">
                                    {PROBLEM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label>Problem Option</label>
                                <select value={problemOption} onChange={e => setProblemOption(e.target.value)} className="select">
                                    {PROBLEM_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div>
                                <label>Input Check</label>
                                <select value={inputCheck} onChange={e => setInputCheck(e.target.value)} className="select">
                                    {INPUT_CHECKS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label>Units</label>
                                <div className="unit-group">
                                    <select value={inputUnits} onChange={e => setInputUnits(e.target.value)} className="select">
                                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                    <select value={outputUnits} onChange={e => setOutputUnits(e.target.value)} className="select ml-2">
                                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        {/* Time Step Control */}
                        <div className="form-group">
                            <h2 className="section-heading">Time Step Control</h2>
                            <div className="grid-2 gap">
                                <input type="number" placeholder="End Time" value={endTime} onChange={e => setEndTime(e.target.value)} className="input" />
                                <input type="number" placeholder="Min Step Time" value={minStep} onChange={e => setMinStep(e.target.value)} className="input" />
                                <input type="number" placeholder="Max Step Time" value={maxStep} onChange={e => setMaxStep(e.target.value)} className="input" />
                                <input type="number" placeholder="Control Option" value={controlOption} onChange={e => setControlOption(e.target.value)} className="input" />
                                <input type="number" placeholder="Minor Edit Freq" value={minorFreq} onChange={e => setMinorFreq(e.target.value)} className="input" />
                                <input type="number" placeholder="Major Edit Freq" value={majorFreq} onChange={e => setMajorFreq(e.target.value)} className="input" />
                                <input type="number" placeholder="Restart Freq" value={restartFreq} onChange={e => setRestartFreq(e.target.value)} className="input" />
                            </div>
                        </div>
                        {/* Noncondensable Gases */}
                        <div className="form-group">
                            <h2 className="section-heading">Noncondensable Gases</h2>
                            <div className="grid-2 gap">
                                <div>
                                    {GAS_SPECIES.map(g => (
                                        <label key={g} className="checkbox-label">
                                            <input type="checkbox" value={g} checked={selectedGases.includes(g)} onChange={e => {
                                                const v = e.target.value;
                                                setSelectedGases(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
                                            }} /> {g}
                                        </label>
                                    ))}
                                </div>
                                <div>
                                    <span className="block mb-1">Fluid</span>
                                    {FLUID_OPTIONS.map(opt => (
                                        <label key={opt} className="radio-label">
                                            <input type="radio" name="fluid" value={opt} checked={fluid === opt} onChange={e => setFluid(e.target.value)} /> {opt}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Has Boron Separate */}
                        <div className="form-group">
                            <label className="checkbox-label">
                                <input type="checkbox" checked={hasBoron} onChange={e => setHasBoron(e.target.checked)} /> Has Boron
                            </label>
                        </div>
                    </>
                )}

                {activeTab === 'advanced' && (
                    <>
                        {/* Developmental Model Control */}
                        <div className="form-group">
                            <h2 className="section-heading">Developmental Model Control (W1–91)</h2>
                            <div className="grid-cols-5 gap overflow-scroll max-h-64">
                                {devModel.map((val, i) => (
                                    <div key={i} className="flex items-center">
                                        <label className="label">W{i+1}</label>
                                        <input type="number" value={val} onChange={e => handleDevChange(i, e.target.value)} className="input" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Model Multipliers */}
                        <div className="form-group">
                            <h2 className="section-heading">Model Multipliers (Cards 10–14)</h2>
                            <div className="grid-cols-5 gap">
                                {[10,11,12,13,14].map(card => (
                                    <div key={card} className="flex flex-col">
                                        <label className="label">Card {card}</label>
                                        <input type="number" value={multipliers[card]} onChange={e => handleMultChange(card, e.target.value)} className="input" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/*<button type="submit" className="button-generate">Generate Input File</button>*/}

                {/*{generatedText && (*/}
                {/*    <div className="form-group">*/}
                {/*        <h2 className="section-heading">Generated File</h2>*/}
                {/*        <pre className="output">{generatedText}</pre>*/}
                {/*    </div>*/}
                {/*)}*/}
            </div>
        </form>
    );
}
