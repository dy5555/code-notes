import { useQuery } from '@tanstack/react-query';
// TODO: 공통 콤보 API 호출 함수 경로/이름 실제 값으로 교체
import { fetchCommCombo } from '../api/AAA014Api';
import { COMBO_DEFS, FAMILY_COMBO_TP } from '../consts/AAA014Vars';

// family 데이터셋 행 (SC_SEQ는 프론트 전용이라 빼고 전송)
const { SC_SEQ, ...FAMILY_COMBO_PARAMS } = COMBO_DEFS[FAMILY_COMBO_TP];

export function useAAA014Fetch(tabId) {
    // family 목록: 화면 진입 시 데이터셋 행 그대로 1번 조회 (a~h는 apiCodeSelect가 각자 조회)
    const {
        data: familyData = [],
        isSuccess: isFamilySuccess
    } = useQuery({
        queryKey: ['AAA014_FAMILY', tabId],
        queryFn: async () => {
            const result = await fetchCommCombo(FAMILY_COMBO_PARAMS);
            return result.data ?? [];
        },
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 0,
        gcTime: 5 * 60 * 1000
    });

    return {
        familyData,
        isFamilySuccess
    };
}
