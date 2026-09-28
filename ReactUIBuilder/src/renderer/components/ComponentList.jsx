import React, { useEffect, useRef, useState } from 'react';

function ThumbnailCard({ item, projectPath, selected, onSelect, onQuickAdd }) {
  const ref = useRef(null);
  const [thumbnail, setThumbnail] = useState({ status: 'idle' });

  useEffect(() => {
    setThumbnail({ status: 'idle' });
    if (!projectPath || !ref.current) return undefined;
    let cancelled = false;
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || thumbnail.status !== 'idle') return;
      observer.disconnect();
      setThumbnail({ status: 'loading' });
      try {
        const usage = item.usages[0] || null;
        const response = await window.uiBuilder.buildThumbnail({
          projectPath,
          component: item,
          usage,
          mockProps: {},
        });
        if (!cancelled) setThumbnail(response.ok ? { status: 'ready', url: response.url } : { status: 'error', error: response.error });
      } catch (error) {
        if (!cancelled) setThumbnail({ status: 'error', error: error.message });
      }
    }, { rootMargin: '100px' });
    observer.observe(ref.current);
    return () => { cancelled = true; observer.disconnect(); };
  }, [item.id, projectPath]);

  return <div ref={ref} role="button" tabIndex={0} className={`thumbnail-card ${selected ? 'active' : ''}`} onClick={() => onSelect(item.id)} onKeyDown={(event) => { if (event.key === 'Enter') onSelect(item.id); }}>
    <span className="thumbnail-image">
      {thumbnail.status === 'ready' && <img src={thumbnail.url} alt={`${item.name} 미리보기`} />}
      {thumbnail.status === 'loading' && <span className="thumbnail-loading">렌더링 중…</span>}
      {thumbnail.status === 'error' && <span className="thumbnail-error" title={thumbnail.error}>Preview 실패</span>}
      {thumbnail.status === 'idle' && <span className="thumbnail-loading">대기 중</span>}
    </span>
    <span className="thumbnail-meta"><span><strong>{item.name}</strong><small>{item.relativePath}</small></span><b>{item.usageCount}회</b></span>
    <span className="thumbnail-actions"><span>클릭해서 상세보기</span><button type="button" disabled={!item.usages.length} onClick={(event) => { event.stopPropagation(); onQuickAdd(item); }}>＋ 추가</button></span>
  </div>;
}

export default function ComponentList({ items, selectedId, onSelect, projectPath, viewMode, onViewModeChange, onQuickAdd }) {
  return <div className={`component-list ${viewMode === 'cards' ? 'card-mode' : ''}`}>
    <div className="list-header"><span>컴포넌트 <b>{items.length}</b></span><div className="view-toggle"><button className={viewMode === 'cards' ? 'active' : ''} onClick={() => onViewModeChange('cards')}>이미지</button><button className={viewMode === 'list' ? 'active' : ''} onClick={() => onViewModeChange('list')}>목록</button></div></div>
    {viewMode === 'cards'
      ? items.map((item) => <ThumbnailCard key={item.id} item={item} projectPath={projectPath} selected={selectedId === item.id} onSelect={onSelect} onQuickAdd={onQuickAdd} />)
      : items.map((item) => <button key={item.id} className={`component-item ${selectedId === item.id ? 'active' : ''}`} onClick={() => onSelect(item.id)}><span className="component-icon">◇</span><span className="component-copy"><strong>{item.name}</strong><small>{item.relativePath}</small></span><span className="usage-badge">{item.usageCount}</span></button>)}
    {!items.length && <div className="list-empty">조회된 컴포넌트가 없습니다.</div>}
  </div>;
}
