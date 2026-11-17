import { useQuery } from '@tanstack/react-query';
// API 파일 경로는 실제 프로젝트 위치에 맞추세요.
import { fetchaaa01401 } from '../api/AAA014Api';
import { DEFAULT_FAMILY } from '../consts/AAA014Vars';

export function useAAA014Fetch(tabId) {
    // aaa01: 최초 진입 시 family 목록 + a~h 목록 한 번에 조회 (화면 전용 UNION ALL 쿼리 1번)
    // - inclFamilyYn: 'Y'면 family 목록도 같이 조회 (family 변경 재조회 때는 'N')
    const {
        data: initComboData = [],
        isSuccess: isInitComboSuccess
    } = useQuery({
        queryKey: ['AAA014_INIT_COMBO', tabId],
        queryFn: async () => {
            const result = await fetchaaa01401({ family: DEFAULT_FAMILY, inclFamilyYn: 'Y' });
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
