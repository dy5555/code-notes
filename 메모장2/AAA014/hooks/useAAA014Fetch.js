import { useQuery } from '@tanstack/react-query';
// API 파일 경로는 실제 프로젝트 위치에 맞추세요.
import { fetchaaa01401 } from '../api/AAA014Api';
import { COMBO_DEFS, FAMILY_COMBO_DEF, DEFAULT_FAMILY } from '../consts/AAA014Vars';

// a~h 정의에 family 조건 추가 (family 목록 정의에는 넣지 않음)
const addFamilyCond = (comboDefs, family) =>
    comboDefs.map((comboDef) => ({ ...comboDef, FAMILY_CD: family }));

export function useAAA014Fetch(tabId) {
    // aaa01: 최초 진입 시 family 목록 + a~h 목록 한 번에 조회 (UNION ALL 쿼리 1번)
    const {
        data: initComboData = [],
        isSuccess: isInitComboSuccess
    } = useQuery({
        queryKey: ['AAA014_INIT_COMBO', tabId],
        queryFn: async () => {
            const comboDefs = [FAMILY_COMBO_DEF, ...addFamilyCond(COMBO_DEFS, DEFAULT_FAMILY)];
            const result = await fetchaaa01401(comboDefs);
            return result.data ?? [];
        },
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 5 * 60 * 1000
    });

    return {
        initComboData,
        isInitComboSuccess
    };
}
