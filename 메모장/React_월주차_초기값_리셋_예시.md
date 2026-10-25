# React 월·주차 초기값 저장 및 초기화 예시

> 학습용 예시입니다. 실제 API 경로와 응답 필드명, DatePicker의 value 형식은 사내 프로젝트에 맞춰 연결하세요.

## useAAA013Search.js

```jsx
import { useCallback, useEffect, useState } from "react";
// 실제 프로젝트의 API 함수 경로로 변경
import { getInitialMonthWeek } from "API_경로";

export function useAAA013Search() {
    // 최초 서버 조회값: 사용자가 검색조건을 바꿔도 유지
    const [initialFilter, setInitialFilter] = useState(null);

    // 현재 화면에 표시할 값: 사용자가 DatePicker에서 변경하는 대상
    const [filter, setFilter] = useState({
        stockMonth: null,
        salesDemandWeek: null,
        somMonth: null,
        somCds: [],
        salesResultMonth: null,
        inboundDemandWeek: null,
    });

    // 화면 최초 표시 후 초기 월·주차를 서버에서 한 번 조회
    useEffect(() => {
        let active = true;

        const fetchInitialFilter = async () => {
            try {
                const response = await getInitialMonthWeek();

                // TODO: 회사 API의 실제 응답 구조에 맞춰 데이터 추출
                // TODO: 월·주차 값을 사내 DatePicker가 요구하는 형식으로 변환
                const data = response?.data ?? response;

                const nextFilter = {
                    stockMonth: data.stockMonth,
                    salesDemandWeek: data.salesDemandWeek,
                    somMonth: data.somMonth,
                    somCds: [],
                    salesResultMonth: data.salesResultMonth,
                    inboundDemandWeek: data.inboundDemandWeek,
                };

                if (!active) return;

                // 초기값 보관: reset에서 사용
                setInitialFilter(nextFilter);
                // 현재값 설정: 화면 DatePicker에 표시
                setFilter(nextFilter);
            } catch (error) {
                if (active) console.error("월·주차 초기값 조회 실패", error);
            }
        };

        fetchInitialFilter();
        return () => { active = false; };
    }, []);

    // 초기화 버튼 클릭 시 최초 조회한 값으로 복원 (API 재호출 X)
    const reset = useCallback(() => {
        if (!initialFilter) return; // 초기 API 응답 전이면 초기화하지 않음

        setFilter({
            ...initialFilter,
            somCds: [], // 선택한 SOM 코드는 비움
        });
    }, [initialFilter]); // 초기값이 바뀌면 reset 함수도 최신값을 사용

    // Tab에서 사용할 값과 함수 공개
    return { filter, setFilter, reset };
}
```

## AAA013Tab.jsx

```jsx
import { useAAA013Search } from "../hooks/useAAA013Search";

export const AAA013Tab = () => {
    // Hook에서 현재 검색조건과 초기화 함수 가져오기
    const { filter, setFilter, reset } = useAAA013Search();

    return (
        <>
            {/* 현재 월·주차와 값 변경 함수를 검색 컴포넌트에 전달 */}
            <SearchFilterComp filter={filter} setFilter={setFilter} />

            {/* 클릭 시 Hook에 정의한 reset 실행 */}
            <button type="button" onClick={reset}>초기화</button>
        </>
    );
};
```

**참고:** 실제 Tab이 `({ filter })`로 부모의 검색조건을 받는 구조라면, 위처럼 Hook에서 별도의 filter를 생성하기보다 부모가 관리하는 상태 및 변경 함수와 연결해야 합니다.

## 실행 흐름

1. 화면 진입 → `useEffect`에서 초기 월·주차 API 호출
2. 응답 수신 → `initialFilter`와 `filter`에 같은 초기값 저장
3. 사용자가 월 변경 → `filter`만 변경
4. 초기화 버튼 클릭 → `reset()` 실행
5. `initialFilter`에 보관한 값을 `filter`에 다시 설정

`[initialFilter]`는 **초기화 실행 명령이 아니라 useCallback의 의존성 배열**입니다.
