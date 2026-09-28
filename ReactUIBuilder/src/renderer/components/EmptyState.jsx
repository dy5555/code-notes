import React from 'react';
export default function EmptyState({ hasResult }) { return <div className="empty-state"><div className="empty-graphic">{'{ }'}</div><h2>{hasResult ? '컴포넌트를 선택하세요' : 'React 프로젝트를 스캔하세요'}</h2><p>{hasResult ? '왼쪽 목록에서 컴포넌트를 선택하면 사용 구조와 상세정보를 확인할 수 있습니다.' : '상단에서 프로젝트 루트 폴더를 선택한 뒤 프로젝트 스캔을 실행하세요.'}</p></div>; }
