import React, { useEffect, useMemo, useState } from 'react';
import ScopePanel from './components/ScopePanel.jsx';
import ComponentList from './components/ComponentList.jsx';
import ComponentDetail from './components/ComponentDetail.jsx';
import EmptyState from './components/EmptyState.jsx';
import PreviewPanel from './components/PreviewPanel.jsx';
import BuilderPanel from './components/BuilderPanel.jsx';
import { inferBoundary, toggleBoundary } from '../core/boundaryEngine.js';
import { generateJsx } from '../core/jsxGenerator.js';

function filterComponents(result, query, mode, screenId, tabName) {
  if (!result) return [];
  const lowered = query.trim().toLowerCase();
  return result.components.filter((component) => {
    const matchesText = !lowered || [component.name, component.relativePath, ...component.majorProps.map((p) => p.name)]
      .join(' ').toLowerCase().includes(lowered);
    if (!matchesText) return false;
    if (mode === 'all') return true;
    if (mode === 'screen') return component.screenUsage.includes(screenId);
    return component.tabUsage.includes(`${screenId}/${tabName}`);
  });
}

function chooseUsage(component, mode, screenId, tabName) {
  if (!component) return null;
  if (mode === 'tab') return component.usages.find((item) => item.screenId === screenId && item.tabName === tabName) || component.usages[0] || null;
  if (mode === 'screen') return component.usages.find((item) => item.screenId === screenId) || component.usages[0] || null;
  return component.usages[0] || null;
}

function initialMockProps(usage) {
  const props = Object.fromEntries((usage?.props || [])
    .filter((item) => ['label', 'placeholder'].includes(item.name) && typeof item.value === 'string' && !item.value.startsWith('{'))
    .map((item) => [item.name, item.value]));
  return { label: props.label || '', placeholder: props.placeholder || '' };
}

export default function App() {
  const [projectPath, setProjectPath] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('프로젝트 폴더를 선택하세요.');
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('all');
  const [screenId, setScreenId] = useState('');
  const [tabName, setTabName] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [bottomTab, setBottomTab] = useState('log');
  const [workMode, setWorkMode] = useState('explorer');
  const [previewMode, setPreviewMode] = useState('context');
  const [preview, setPreview] = useState({ status: 'idle' });
  const [boundary, setBoundary] = useState({ candidates: [], includedParents: [] });
  const [mockProps, setMockProps] = useState({ label: '', placeholder: '' });
  const [builderNodes, setBuilderNodes] = useState([]);
  const [screenName, setScreenName] = useState('NewScreen');
  const [componentViewMode, setComponentViewMode] = useState('cards');

  const filtered = useMemo(() => filterComponents(result, query, mode, screenId, tabName), [result, query, mode, screenId, tabName]);
  const selected = result?.components.find((item) => item.id === selectedId) || filtered[0] || null;
  const usage = useMemo(() => chooseUsage(selected, mode, screenId, tabName), [selected, mode, screenId, tabName]);
  const generatedCode = useMemo(() => builderNodes.length ? generateJsx({ screenName, nodes: builderNodes }) : '', [screenName, builderNodes]);

  useEffect(() => {
    setBoundary(inferBoundary(selected, usage, usage?.screenId || screenId));
    setMockProps(initialMockProps(usage));
    setPreview({ status: 'idle' });
  }, [selected?.id, usage?.filePath, usage?.line]);

  async function chooseProject() {
    const chosen = await window.uiBuilder.selectProject();
    if (chosen) { setProjectPath(chosen); setMessage('프로젝트를 선택했습니다. [프로젝트 스캔]을 누르세요.'); }
  }

  async function runScan(fullRescan = false) {
    if (!projectPath) return;
    setBusy(true); setMessage(fullRescan ? '전체 재스캔 중…' : '프로젝트 분석 중…');
    try {
      const data = await window.uiBuilder.scanProject(projectPath, fullRescan);
      setResult(data);
      const firstScreen = data.screens[0]?.id || '';
      setScreenId((current) => current || firstScreen);
      setTabName(data.screens[0]?.tabs[0]?.name || '');
      setSelectedId(data.components[0]?.id || '');
      setMessage(`스캔 완료: 정상 ${data.stats.parsedFiles}, 경고 ${data.stats.warningFiles}, 실패 ${data.stats.failedFiles}`);
    } catch (error) { setMessage(`스캔 실패: ${error.message}`); }
    finally { setBusy(false); }
  }

  async function runPreview() {
    if (!selected || !usage) return;
    setPreview({ status: 'loading' });
    const screen = result.screens.find((item) => item.id === usage.screenId);
    try {
      const response = await window.uiBuilder.buildPreview({ projectPath, component: selected, usage, mode: previewMode, screenEntry: screen?.entryFiles[0], mockProps });
      setPreview(response.ok ? { status: 'ready', ...response } : { status: 'error', ...response });
    } catch (error) { setPreview({ status: 'error', error: error.message, details: [] }); }
  }

  function addToBuilder() {
    if (!selected || !usage) return;
    addBuilderNode(selected, usage, boundary, mockProps);
  }

  function addBuilderNode(component, componentUsage, componentBoundary, props) {
    setBuilderNodes((nodes) => [...nodes, {
      id: crypto.randomUUID(), component, usage: componentUsage,
      includedParents: componentBoundary.candidates.filter((item) => item.included).map((item) => item.name),
      customProps: { ...props },
    }]);
    setWorkMode('builder');
    setMessage(`${component.name}을(를) 새 화면에 추가했습니다.`);
  }

  function quickAddToBuilder(component) {
    const componentUsage = chooseUsage(component, mode, screenId, tabName);
    if (!componentUsage) return;
    const componentBoundary = inferBoundary(component, componentUsage, componentUsage.screenId || screenId);
    addBuilderNode(component, componentUsage, componentBoundary, initialMockProps(componentUsage));
  }

  function moveNode(index, direction) {
    setBuilderNodes((nodes) => {
      const next = [...nodes];
      const [item] = next.splice(index, 1);
      next.splice(index + direction, 0, item);
      return next;
    });
  }

  function changeNodeProp(id, name, value) {
    setBuilderNodes((nodes) => nodes.map((node) => node.id === id ? { ...node, customProps: { ...node.customProps, [name]: value } } : node));
  }

  async function saveGenerated() {
    try {
      const output = await window.uiBuilder.writeGenerated(projectPath, screenName, generatedCode);
      setMessage(`JSX 생성 완료: ${output}`);
    } catch (error) { setMessage(`JSX 생성 실패: ${error.message}`); }
  }

  async function exportReport() {
    if (result) setMessage(`분석 보고서 생성: ${await window.uiBuilder.exportReport(projectPath, result)}`);
  }

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">UI</span><div><strong>React UI Builder</strong><small>OFFLINE PROJECT ANALYZER</small></div></div>
      <div className="project-picker"><input value={projectPath} readOnly placeholder="React 프로젝트 루트 폴더" /><button className="secondary" onClick={chooseProject}>프로젝트 선택</button><button className="primary" disabled={!projectPath || busy} onClick={() => runScan(false)}>{busy ? '분석 중…' : '프로젝트 스캔'}</button><button className="ghost" disabled={!result || busy} onClick={() => runScan(true)}>전체 재스캔</button></div>
    </header>
    <main className="workspace">
      <aside className="left-panel panel">
        <ScopePanel result={result} mode={mode} setMode={setMode} screenId={screenId} setScreenId={setScreenId} tabName={tabName} setTabName={setTabName} />
        <div className="search-box"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="컴포넌트 검색" /></div>
        <ComponentList items={filtered} selectedId={selected?.id} onSelect={(id) => { setSelectedId(id); setWorkMode('explorer'); }} projectPath={projectPath} viewMode={componentViewMode} onViewModeChange={setComponentViewMode} onQuickAdd={quickAddToBuilder} />
      </aside>
      <section className="center-panel panel">
        <div className="panel-title"><div><span className="eyebrow">{workMode === 'explorer' ? 'COMPONENT EXPLORER' : 'NEW SCREEN BUILDER'}</span><h2>{workMode === 'explorer' ? selected?.name || '컴포넌트를 선택하세요' : screenName}</h2></div><div className="work-tabs"><button className={workMode === 'explorer' ? 'active' : ''} onClick={() => setWorkMode('explorer')}>탐색·Preview</button><button className={workMode === 'builder' ? 'active' : ''} onClick={() => setWorkMode('builder')}>Builder <b>{builderNodes.length}</b></button></div></div>
        {workMode === 'explorer'
          ? selected
            ? <div className="explorer-content"><PreviewPanel preview={preview} mode={previewMode} setMode={setPreviewMode} onBuild={runPreview} disabled={!usage} /><div className="usage-grid"><h3>사용 위치 <span>{selected.usages.length}</span></h3><div className="table-wrap"><table><thead><tr><th>화면/탭</th><th>사용 파일</th><th>위치</th><th>부모 JSX</th></tr></thead><tbody>{selected.usages.length ? selected.usages.map((item, index) => <tr key={`${item.filePath}-${item.line}-${index}`}><td>{item.screenId || '공통'}{item.tabName ? ` / ${item.tabName}` : ''}</td><td title={item.relativePath}>{item.relativePath}</td><td>L{item.line}:{item.column}</td><td>{item.parentJsx || item.ownerComponent || '-'}</td></tr>) : <tr><td colSpan="4" className="empty-cell">직접 사용 위치가 없습니다.</td></tr>}</tbody></table></div></div></div>
            : <EmptyState hasResult={Boolean(result)} />
          : <BuilderPanel nodes={builderNodes} screenName={screenName} setScreenName={setScreenName} onMove={moveNode} onRemove={(id) => setBuilderNodes((nodes) => nodes.filter((node) => node.id !== id))} onPropChange={changeNodeProp} generatedCode={generatedCode} onSave={saveGenerated} />}
      </section>
      <aside className="right-panel panel"><ComponentDetail component={selected} usage={usage} boundary={boundary} onToggleBoundary={(name) => setBoundary((current) => toggleBoundary(current, name))} mockProps={mockProps} onMockPropChange={(name, value) => setMockProps((current) => ({ ...current, [name]: value }))} onAdd={addToBuilder} /></aside>
    </main>
    <footer className="bottom-panel panel"><div className="bottom-tabs"><button className={bottomTab === 'log' ? 'active' : ''} onClick={() => setBottomTab('log')}>로그</button><button className={bottomTab === 'errors' ? 'active' : ''} onClick={() => setBottomTab('errors')}>분석 오류 {result?.errors.length || 0}</button></div><div className="status-line"><span className={busy ? 'status-dot busy' : 'status-dot'} />{bottomTab === 'log' ? message : result?.errors.map((e) => `${e.relativePath}:${e.line} ${e.message}`).join(' | ') || '분석 오류가 없습니다.'}<button className="export-button" onClick={exportReport} disabled={!result}>분석 결과 저장</button></div></footer>
  </div>;
}
