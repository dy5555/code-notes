# RPA000 그리드 Hook - 메인 조회 API 연결 예제

> 현재 확인된 구조를 기준으로 만든 **전체 예제**입니다. 퍼블리셔가 작성한 실제 `columnDefs`, `defaultColDef`, `tabId` 처리 코드는 확인되지 않았으므로 아래 예시 컬럼/스타일을 실제 코드로 교체하세요. **실제 API 함수명과 응답 형식도 확인 후 변경**해야 합니다.

## 1. hooks/useRPA000GridColumns.js

```jsx
import { useState, useMemo, useCallback } from 'react';
// 실제 프로젝트 API 함수명 및 경로에 맞게 수정
import { getRPA000List } from '../../../../api/r/pm/pla/RPA000Api';

export function useRPA000GridColumns(tabId) {
    // 메인 조회 결과
    const [rowData, setRowData] = useState([]);
    const [adjustCnt, setAdjustCnt] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isSearched, setIsSearched] = useState(false);

    // 기존 퍼블리셔 columnDefs 코드를 이 위치에 그대로 유지
    // field는 실제 API 응답 키로 맞추기
    const columnDefs = useMemo(() => [
        { headerName: '구분', field: 'gbn', width: 120 },
        { headerName: 'SALES_PROD_ID', field: 'salesProdId', width: 180 },
        { headerName: 'RP_SOM_CD', field: 'rpSomCd', width: 160 },
        { headerName: '일괄보정여부', field: 'adjustYn', width: 140 },
        { headerName: '보정 RP_SOM_CD', field: 'adjustRpSomCd', width: 180 }
    ], []);

    // 기존 퍼블리셔 defaultColDef 코드를 이 위치에 그대로 유지
    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
        cellStyle: { textAlign: 'center' }
    }), []);

    // RPA000Tab의 조회 버튼에서 호출
    const search = useCallback(async (params) => {
        setLoading(true);
        try {
            const result = await getRPA000List(params);
            // API가 result.data에 배열을 반환한다는 가정
            const list = result.data ?? [];

            setRowData(list);
            // SQL 결과 컬럼이 ADJUST_CNT로 오는 경우
            setAdjustCnt(Number(list[0]?.ADJUST_CNT ?? 0));
            setIsSearched(true);
        } catch (error) {
            console.error('RPA000 메인 조회 실패', error);
            setRowData([]);
            setAdjustCnt(0);
            setIsSearched(false);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        columnDefs,
        defaultColDef,
        rowData,
        adjustCnt,
        loading,
        isSearched,
        search
    };
}
```

## 2. RPA000Tab.jsx 연결 예시

```jsx
// 기존 formMethods는 useRPA000Search에서 전달받은 객체 사용
const {
    rowData,
    adjustCnt,
    loading,
    isSearched,
    search
} = useRPA000GridColumns(tabId);

const handleSearch = async () => {
    await search(formMethods.getValues());
};

// 기존 JSX에서:
// <SearchFilterComp onSearch={handleSearch} ... />
// <TableComp rowData={rowData} isSearched={isSearched} loading={loading} tabId={tabId} ... />
// 일괄보정 버튼의 건수에는 adjustCnt 사용
```

## 주의사항

- `useRPA000GridColumns`를 Tab과 TableComp에서 각각 호출하면 **조회 상태가 공유되지 않습니다**. Tab에서 조회한 `rowData`를 TableComp에 Props로 전달하세요. TableComp에서 컬럼만 가져오기 위해 Hook을 호출하는 기존 구조는 유지할 수 있습니다.
- `ADJUST_CNT`는 전체 보정 가능 건수가 각 조회 행에 반복되어 내려온다는 가정입니다. **조회 행이 0개면 0으로 표시**됩니다.
- API 이름 `getRPA000List`, import 경로, 응답 `result.data`, 컬럼 field 이름, 스타일은 예시이므로 실제 프로젝트와 일치시켜야 합니다.
- `columnDefs`와 `defaultColDef`의 **기존 구현을 덮어쓰지 말고 유지**하세요.
