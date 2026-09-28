import React from 'react';

function DetailGroup({ title, children }) { return <section className="detail-group"><h3>{title}</h3>{children}</section>; }
export default function ComponentDetail({ component, usage, boundary, onToggleBoundary, mockProps, onMockPropChange, onAdd }) {
  if (!component) return <div className="detail-empty">컴포넌트를 선택하면 상세정보가 표시됩니다.</div>;
  return <div className="detail-content">
    <div className="detail-heading"><span className="component-icon large">◇</span><div><h2>{component.name}</h2><small>{component.kind}</small></div></div>
    <DetailGroup title="정의 위치"><code>{component.relativePath}</code><p>Line {component.line} · {component.exportNames.join(', ') || 'local'}</p></DetailGroup>
    <DetailGroup title="주요 Props"><div className="chip-list">{component.majorProps.length ? component.majorProps.slice(0, 12).map((prop) => <span key={prop.name}>{prop.name}<b>{prop.count}</b></span>) : <em>수집된 props 없음</em>}</div></DetailGroup>
    <DetailGroup title="Mock Props">
      <div className="mock-fields">{['label', 'placeholder'].map((name) => <label key={name}>{name}<input value={mockProps?.[name] || ''} onChange={(e) => onMockPropChange?.(name, e.target.value)} placeholder={`${name} 값`} /></label>)}</div>
    </DetailGroup>
    <DetailGroup title="부모 자동 포함">
      <div className="boundary-list">{boundary?.candidates.length ? boundary.candidates.map((item) => <label key={item.name}><input type="checkbox" checked={item.included} onChange={() => onToggleBoundary?.(item.name)} /><span>{item.name}</span><small>{item.reason}</small></label>) : <em>포함할 UI 부모가 없습니다.</em>}</div>
    </DetailGroup>
    <DetailGroup title="사용 화면"><div className="chip-list plain">{component.screenUsage.length ? component.screenUsage.map((screen) => <span key={screen}>{screen}</span>) : <em>화면 연결 없음</em>}</div></DetailGroup>
    <DetailGroup title="부모 컴포넌트"><ul>{component.parents.length ? component.parents.map((id) => <li key={id}>{id.split('#').pop()}</li>) : <li className="muted">없음</li>}</ul></DetailGroup>
    <DetailGroup title="자식 컴포넌트"><ul>{component.children.length ? component.children.map((id) => <li key={id}>{id.split('#').pop()}</li>) : <li className="muted">없음</li>}</ul></DetailGroup>
    <button className="add-builder-button" disabled={!usage} onClick={onAdd}>＋ 새 화면에 추가</button>
  </div>;
}
