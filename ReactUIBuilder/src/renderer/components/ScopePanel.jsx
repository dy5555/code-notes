import React, { useMemo } from 'react';

export default function ScopePanel({ result, mode, setMode, screenId, setScreenId, tabName, setTabName }) {
  const screen = result?.screens.find((item) => item.id === screenId);
  const tabs = useMemo(() => screen?.tabs || [], [screen]);
  function changeScreen(value) {
    setScreenId(value);
    const next = result?.screens.find((item) => item.id === value);
    setTabName(next?.tabs[0]?.name || '');
  }
  return <section className="scope-panel">
    <div className="section-label">조회 범위</div>
    <div className="segment">
      <button className={mode === 'all' ? 'active' : ''} onClick={() => setMode('all')}>전체</button>
      <button className={mode === 'screen' ? 'active' : ''} disabled={!result} onClick={() => setMode('screen')}>화면</button>
      <button className={mode === 'tab' ? 'active' : ''} disabled={!result} onClick={() => setMode('tab')}>탭</button>
    </div>
    <label>화면<select disabled={!result || mode === 'all'} value={screenId} onChange={(e) => changeScreen(e.target.value)}>
      {(result?.screens || []).map((item) => <option key={item.id} value={item.id}>{item.id}</option>)}</select></label>
    <label>탭<select disabled={!result || mode !== 'tab'} value={tabName} onChange={(e) => setTabName(e.target.value)}>
      {tabs.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>
  </section>;
}
