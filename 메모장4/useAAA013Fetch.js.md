# useAAA013Fetch.js — API 호출 전담 Hook (풀코드)

메모장3 대비 수정
- 사내 공통 `toast`, API 함수 import 추가 (react-toastify 사용 안 함)
- 사내 toast 사용법 유지: `toast.loading(msg, 0)` → `finally`에서 `toast.destroy()`
- 메인 조회 실패 시 `toast.error` 표시, 실패 시 토스트 중복 방지를 위해 `retry: false`
- 주차(`YYYYww`) 포맷은 변경하지 않음 (규칙 확정 전 스킵)

```jsx
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
// TODO: 다른 화면에서 쓰는 사내 공통 toast import 경로로 교체하세요.
import { toast } from '@/utils/toast';
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

    // aaa03: 조회 버튼으로 실행하는 메인 그리드
    const {
        data: rowData = [],
        isLoading
    } = useQuery({
        queryKey: ['AAA013_GRID', tabId, searchParams, searchTrigger],
        queryFn: async () => {
            if (!searchParams) return [];
            const params = {
                ...searchParams,
                stockMonth: searchParams.stockMonth?.format('YYYYMM') ?? null,
                salesDemandWeek: searchParams.salesDemandWeek?.format('YYYYww') ?? null,
                somMonth: searchParams.somMonth?.format('YYYYMM') ?? null,
                salesResultMonth: searchParams.salesResultMonth?.format('YYYYMM') ?? null,
                inboundDemandWeek: searchParams.inboundDemandWeek?.format('YYYYww') ?? null
            };

            toast.loading('조회 중입니다.', 0);
            try {
                const result = await fetchaaa01303(params);
                if (!result.data?.length) {
                    toast.info('조회결과가 존재하지 않습니다.');
                }
                return result.data ?? [];
            } catch (error) {
                toast.error('조회 중 오류가 발생했습니다.');
                throw error;
            } finally {
                toast.destroy();
            }
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
        setSomMonth,
        search,
        clearGrid,
        batchAdjust,
        isAdjusting
    };
}
```

- `toast` import 경로(`@/utils/toast`)는 임시값입니다. 실제 사내 공통 경로로 바꾸세요.
- 사내 toast에 `error` 함수가 없으면 해당 화면에서 쓰는 오류 알림 함수로 바꾸세요.
- `fetchaaa01301~05` 함수명과 `result.data` 응답 형식은 실제 API 규격과 대조가 필요합니다.
