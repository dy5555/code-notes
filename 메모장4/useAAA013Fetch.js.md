# useAAA013Fetch.js — API 호출 전담 Hook (풀코드)

메모장3 대비 수정
- 사내 공통 `toast`(`signlw`), API 함수 import 추가 (react-toastify 사용 안 함)
- 사내 toast 사용법 유지: `toast.loading(msg, 0)` → 응답 후 `toast.destroy()`로 닫고 결과 토스트 표시
- 조회 파라미터 변환을 `requestParams`로 분리해 반환 (엑셀 다운로드에서 같은 조건 사용)
- 결과 토스트: 성공 `toast.success('조회를 완료했습니다.')`, 결과 없음 `toast.warning`, 오류 `toast.error`
- 메인 조회 실패 시 `toast.error` 표시, 실패 시 토스트 중복 방지를 위해 `retry: false`
- 주차(`YYYYww`) 포맷은 변경하지 않음 (규칙 확정 전 스킵)

```jsx
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'signlw';
// API 파일 경로는 실제 프로젝트 위치에 맞추세요.
import {
    fetchaaa01301,
    fetchaaa01302,
    fetchaaa01303,
    fetchaaa01304,
    fetchaaa01305
} from '../api/AAA013Api';

export function useAAA013Fetch(tabId) {
    const [somMonth, setSomMonth] = useState(null);
    const [searchParams, setSearchParams] = useState(null);
    const [searchTrigger, setSearchTrigger] = useState(0);
    const [isSearched, setIsSearched] = useState(false);

    // aaa01: 최초 월·주차
    const {
        data: initialData = [],
        isSuccess: isInitialSuccess
    } = useQuery({
        queryKey: ['AAA013_INITIAL', tabId],
        queryFn: async () => {
            const result = await fetchaaa01301({});
            return result.data ?? [];
        },
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 5 * 60 * 1000
    });

    // aaa05: SOM CD가 존재하는 전체 년월(YYYYMM), 화면 최초 진입 시 1회 조회
    const {
        data: somAvailableMonthData = [],
        isSuccess: isSomAvailableMonthSuccess,
        isLoading: isSomAvailableMonthLoading
    } = useQuery({
        queryKey: ['AAA013_SOM_AVAILABLE_MONTHS'],
        queryFn: async () => {
            const result = await fetchaaa01305({});
            return result.data ?? [];
        },
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        gcTime: 30 * 60 * 1000
    });

    // aaa02: SOM 월 변경 시 코드 목록
    const {
        data: somCodeData = [],
        isSuccess: isSomSuccess
    } = useQuery({
        queryKey: ['AAA013_SOM', tabId, somMonth],
        queryFn: async () => {
            if (!somMonth) return [];
            const result = await fetchaaa01302({ somMonth });
            return result.data ?? [];
        },
        enabled: !!somMonth,
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 5 * 60 * 1000
    });

    // 조회·엑셀 다운로드 공통 요청 파라미터 (Dayjs → 문자열)
    const requestParams = searchParams
        ? {
            ...searchParams,
            stockMonth: searchParams.stockMonth?.format('YYYYMM') ?? null,
            salesDemandWeek: searchParams.salesDemandWeek?.format('YYYYww') ?? null,
            somMonth: searchParams.somMonth?.format('YYYYMM') ?? null,
            salesResultMonth: searchParams.salesResultMonth?.format('YYYYMM') ?? null,
            inboundDemandWeek: searchParams.inboundDemandWeek?.format('YYYYww') ?? null
        }
        : null;

    // aaa03: 조회 버튼으로 실행하는 메인 그리드
    const {
        data: rowData = [],
        isLoading
    } = useQuery({
        queryKey: ['AAA013_GRID', tabId, searchParams, searchTrigger],
        queryFn: async () => {
            if (!requestParams) return [];

            toast.loading('조회 중입니다.', 0);
            let result;
            try {
                result = await fetchaaa01303(requestParams);
            } catch (error) {
                toast.destroy(); // 로딩 토스트 먼저 닫고 결과 토스트 표시
                toast.error('조회 중 오류가 발생했습니다.');
                throw error;
            }

            toast.destroy();
            const list = result.data ?? [];
            if (list.length === 0) {
                toast.warning('조회결과가 존재하지 않습니다.');
            } else {
                toast.success('조회를 완료했습니다.');
            }
            return list;
        },
        enabled: !!searchParams,
        retry: false, // 실패 시 토스트 중복 방지
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 5 * 60 * 1000
    });

    // aaa04: Java에 보정 대상 목록을 한 번 전달. Java에서 행별 프로시저 호출.
    const { mutateAsync: batchAdjust, isPending: isAdjusting } = useMutation({
        mutationFn: async (body) => {
            return await fetchaaa01304(body);
        }
    });

    const search = (params) => {
        setSearchParams(params);
        setSearchTrigger((prev) => prev + 1);
        setIsSearched(true);
    };

    const clearGrid = () => {
        setSearchParams(null);
        setIsSearched(false);
    };

    return {
        initialData,
        isInitialSuccess,
        somAvailableMonthData,
        isSomAvailableMonthSuccess,
        isSomAvailableMonthLoading,
        somCodeData,
        isSomSuccess,
        somMonth,
        rowData,
        isLoading,
        isSearched,
        requestParams,
        setSomMonth,
        search,
        clearGrid,
        batchAdjust,
        isAdjusting
    };
}
```

- `fetchaaa01301~05` 함수명과 `result.data` 응답 형식은 실제 API 규격과 대조가 필요합니다.
