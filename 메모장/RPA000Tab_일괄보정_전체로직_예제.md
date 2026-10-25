# RPA000Tab.jsx — 일괄보정 포함 전체 흐름 예제

> 현재 대화에서 확인한 구조를 기준으로 작성한 **Tab 예제**입니다. 실제 프로젝트 원본 전체 코드는 확인되지 않았으므로 기존 탭 구성, import 경로, API 함수 이름은 실제 소스에 맞게 유지/조정하세요. 기존 소스를 덮어쓰지 마세요.

```jsx
import { useState } from 'react';
import SearchFilterComp from '../components/SearchFilterComp';
import TableComp from '../components/TableComp';
import { useGridColumns } from '../hooks/useRPA000GridColumns';
// 실제 RPA000Api.js의 export 이름/경로에 맞춰 수정
import { callBatchAdjust } from '@/api/r/pm/pla/RPA000Api';

// getSearchParams, 검색필터 관련 props는 RPA000.jsx에서 전달받음
const RPA000Tab = ({
    tabId,
    getSearchParams,
    ...searchFilterProps
}) => {
    const {
        rowData,
        adjustCnt,
        loading,
        isSearched,
        search
    } = useGridColumns(tabId);

    const [isBatchRunning, setIsBatchRunning] = useState(false);

    const handleSearch = async () => {
        await search(getSearchParams());
    };

    const runBatchRpSomCdFix = async () => {
        if (isBatchRunning) return;

        const adjustList = rowData
            .filter(row => row.GNL_CRR_YN === 'Y')
            .map(row => ({
                SALES_PROD_ID: row.SALES_PROD_ID,
                TO_BE_RP_SOM_CD: row.TO_BE_RP_SOM_CD
            }));

        if (adjustList.length === 0) return;

        const params = getSearchParams();

        setIsBatchRunning(true);
        try {
            // Controller가 받는 요청 키 'adjustList'는 백엔드와 맞춰야 함
            await callBatchAdjust({ ...params, adjustList });
            await search(params);
        } catch (error) {
            // 프로젝트 공통 오류 메시지 처리 방식에 맞춰 연결
            console.error('일괄보정 실패', error);
        } finally {
            setIsBatchRunning(false);
        }
    };

    return (
        <>
            {/* 검색 필터의 기존 props/이벤트 구성은 현재 소스 유지 */}
            <SearchFilterComp
                {...searchFilterProps}
                onSearch={handleSearch}
            />

            <TableComp
                rowData={rowData}
                adjustCnt={adjustCnt}
                isSearched={isSearched}
                loading={loading || isBatchRunning}
                tabId={tabId}
                runBatchRpSomCdFix={runBatchRpSomCdFix}
            />
        </>
    );
};

export default RPA000Tab;
```

## 기존 소스에 적용할 핵심

1. `RPA000Tab.jsx`에 `runBatchRpSomCdFix` 함수 선언.
2. `rowData.filter(row => row.GNL_CRR_YN === 'Y')`로 대상만 추출.
3. `map`으로 `SALES_PROD_ID`, `TO_BE_RP_SOM_CD` 두 필드만 배열에 포함.
4. `callBatchAdjust({ ...params, adjustList })` 호출 후 `search(params)` 재조회.
5. `<TableComp runBatchRpSomCdFix={runBatchRpSomCdFix} />`로 전달.
6. `TableComp.jsx`에서 props와 `propTypes` 등록 후 버튼 `onClick={runBatchRpSomCdFix}` 연결.

**주의:** `RPA000.jsx`에서 이미 사용 중인 필터 관련 props, `SearchFilterComp`의 실제 이벤트 속성, `callBatchAdjust`의 API 주소, 백엔드 DTO의 배열 키는 현재 프로젝트 원본과 대조해야 합니다. `console.error`도 회사 환경에 맞는 공통 오류 처리로 변경하세요.
