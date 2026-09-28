import React from 'react';

function NodeTree({ node }) {
  let content = <div className="canvas-component"><strong>{node.component.name}</strong><small>{Object.entries(node.customProps || {}).map(([key, value]) => `${key}=${value}`).join(' · ') || '기존 사용 props'}</small></div>;
  for (const parent of node.includedParents || []) content = <div className="canvas-parent"><span>{parent}</span>{content}</div>;
  return content;
}

export default function BuilderPanel({ nodes, screenName, setScreenName, onMove, onRemove, onPropChange, generatedCode, onSave }) {
  return <div className="builder-layout">
    <div className="builder-canvas-card">
      <div className="builder-toolbar"><label>화면명<input value={screenName} onChange={(e) => setScreenName(e.target.value)} /></label><span>{nodes.length}개 UI 단위</span></div>
      <div className="builder-canvas">
        {!nodes.length && <div className="builder-empty"><b>새 화면이 비어 있습니다.</b><p>왼쪽에서 컴포넌트를 선택하고 ‘새 화면에 추가’를 누르세요.</p></div>}
        {nodes.map((node, index) => <div className="builder-node" key={node.id}>
          <div className="node-actions"><b>{index + 1}</b><button disabled={index === 0} onClick={() => onMove(index, -1)}>↑</button><button disabled={index === nodes.length - 1} onClick={() => onMove(index, 1)}>↓</button><button className="danger" onClick={() => onRemove(node.id)}>삭제</button></div>
          <NodeTree node={node} />
          <div className="node-props"><label>label<input value={node.customProps?.label || ''} onChange={(e) => onPropChange(node.id, 'label', e.target.value)} /></label><label>placeholder<input value={node.customProps?.placeholder || ''} onChange={(e) => onPropChange(node.id, 'placeholder', e.target.value)} /></label></div>
        </div>)}
      </div>
    </div>
    <div className="code-card"><div className="code-toolbar"><strong>생성 JSX</strong><button disabled={!nodes.length} onClick={onSave}>JSX 파일 생성</button></div><pre>{generatedCode || '// 컴포넌트를 추가하면 JSX가 생성됩니다.'}</pre></div>
  </div>;
}
