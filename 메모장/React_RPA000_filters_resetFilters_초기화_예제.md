# RPA000 검색조건 초기값 및 초기화 예제

`filters`: 화면에서 변경하는 검색조건  
`resetFilters`: 최초 API 조회값을 보관하는 초기화용 검색조건

```jsx
import { useState, useEffect, useCallback } from 'react';

// 검색조건 기본값 생성
const createInitialFilters = () => ({
    stockMonth: null,        // 재고조회 월
    salesDemandWeek: null,   // 판매 Demand 주차
    somMonth: null,          // 수요 SOM 월
    somCds: [],              // SOM 코드
    salesResultMonth: null,  // 판매실적 월
    inboundDemandWeek: null  // 입고 Demand 주차
});

export function useRPA000Search() {

    // 1. 실제 화면에서 사용하는 검색조건
    const [filters, setFilters] = useState(createInitialFilters);

    // 2. 초기화 버튼에서 사용할 최초 조회값
    const [resetFilters, setResetFilters] = useState(createInitialFilters);

    // 3. 화면 최초 진입 시 월·주차 API 조회
    useEffect(() => {
        const loadInitialFilters = async () => {
            try {
                // 실제 프로젝트 API 함수로 교체
                const result = await getInitialMonthWeek();

                // 조회한 월·주차와 기본 검색조건 합치기
                const initialData = {
                    ...createInitialFilters(),
                    ...result
                };

                // 실제 검색조건 설정
                setFilters({
                    ...initialData,
                    somCds: [...initialData.somCds]
                });

                // 초기화용 검색조건 별도 보관
                setResetFilters({
                    ...initialData,
                    somCds: [...initialData.somCds]
                });
            } catch (error) {
                console.error('초기 검색조건 조회 실패', error);
            }
        };

        loadInitialFilters();
    }, []);

    // 4. 검색조건 변경
    const handleInputChange = useCallback((name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    // 5. 초기화 버튼 클릭
    const handleReset = useCallback(() => {
        setFilters({
            ...resetFilters,
            somCds: [...resetFilters.somCds]
        });
    }, [resetFilters]);

    // 6. 다른 컴포넌트에서 사용
    return {
        filters,
        setFilters,
        resetFilters,
        handleInputChange,
        handleReset
    };
}
```

**참고:** `getInitialMonthWeek()`는 예시 이름이므로 실제 API 함수로 교체해야 합니다. API 응답의 키와 날짜 타입도 실제 프로젝트에 맞게 변환해야 합니다.
