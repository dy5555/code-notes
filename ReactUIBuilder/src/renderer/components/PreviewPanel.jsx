import React from 'react';

export default function PreviewPanel({ preview, mode, setMode, onBuild, disabled }) {
  return <div className="preview-card live-preview-card">
    <div className="preview-toolbar">
      <div className="preview-modes">
        <button className={mode === 'isolated' ? 'active' : ''} onClick={() => setMode('isolated')}>단독</button>
        <button className={mode === 'context' ? 'active' : ''} onClick={() => setMode('context')}>사용 구조</button>
        <button className={mode === 'screen' ? 'active' : ''} onClick={() => setMode('screen')}>전체 화면</button>
      </div>
      <button className="run-preview" disabled={disabled || preview.status === 'loading'} onClick={onBuild}>
        {preview.status === 'loading' ? '렌더링 중…' : '실제 Preview 실행'}
      </button>
    </div>
    <div className="preview-frame-wrap">
      {preview.status === 'ready' && <iframe title="React component preview" sandbox="allow-scripts" src={preview.url} />}
      {preview.status === 'error' && <div className="preview-error"><strong>Preview 실패</strong><p>{preview.error}</p>{preview.details?.map((item, index) => <code key={index}>{item.location?.file}:{item.location?.line} {item.text}</code>)}</div>}
      {preview.status === 'idle' && <div className="preview-placeholder"><span>◫</span><p>실제 Preview 실행을 누르면 프로젝트의 React 컴포넌트와 CSS를 로컬에서 번들링합니다.</p><small>Provider·Store·API 의존성 때문에 실패하면 원인과 필요한 설정을 표시합니다.</small></div>}
    </div>
  </div>;
}
