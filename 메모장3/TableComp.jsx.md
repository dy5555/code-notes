# TableComp.jsx — 일괄보정 버튼 연결 예시

기존 TableComp의 그리드 및 버튼 JSX는 유지하고 다음 부분만 연결하세요. 실제 컴포넌트 전체 코드는 제공되지 않아 이 파일은 연결 예시입니다.

```jsx
// TableComp props에 handleBatchAdjust, isAdjusting 추가
const adjustCount = (rowData ?? []).filter(
    (item) => item.gnlCrrYn === 'Y'
).length;

// 기존 일괄보정 버튼에 다음 속성 적용
<button
    type="button"
    onClick={handleBatchAdjust}
    disabled={isAdjusting || adjustCount === 0}
>
    {isAdjusting
        ? '일괄보정 처리 중...'
        : `보정 가능 데이터 : ${adjustCount}건 일괄보정`}
</button>
```

`RPA000Tab.jsx`에서 기존 TableComp에 `handleBatchAdjust`, `isAdjusting`을 전달해야 합니다. 기존 TableComp의 propTypes를 사용한다면 두 항목도 추가하세요.

이 건수는 현재 조회된 `rowData` 중 `gnlCrrYn === 'Y'`인 행의 수입니다.
