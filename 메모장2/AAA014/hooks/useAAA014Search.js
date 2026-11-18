import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import dayjs from 'dayjs';
import {
    DEFAULT_W,
    DEFAULT_FAMILY,
    FAMILY_COMBO_TP,
    COMBO_TPS,
    COMBO_FIELD_NMS,
    COMBO_DEFS
} from '../consts/AAA014Vars';
// TODO: 공통 함수 import 경로 실제 위치로 교체
import { makeChainCombo } from '../../common/comboSeqUtil';

// 콤보 a~h 선택값 초기값: 전부 null (placeholder '전체' 표시)
const createInitComboVals = () =>
    Object.fromEntries(COMBO_TPS.map((comboTp) => [COMBO_FIELD_NMS[comboTp], null]));

const createInitialFilters = () => ({
    month: dayjs(), // 현재월
    wCd: DEFAULT_W,
    [COMBO_FIELD_NMS.FAMILY]: DEFAULT_FAMILY,
    ...createInitComboVals(),
    rpCd: null, // 검색박스: 로직 추후
    plnProdId: null // 검색박스: 로직 추후
});

// 폼 필드명 → 콤보 구분 ({ family: 'FAMILY', a: 'A', ... })
const FIELD_NM_TO_COMBO_TP = Object.fromEntries(
    Object.entries(COMBO_FIELD_NMS).map(([comboTp, fieldNm]) => [fieldNm, comboTp])
);

// 값을 지켜볼 콤보 (family + a~h)
const WATCH_COMBO_TPS = [FAMILY_COMBO_TP, ...COMBO_TPS];

// 응답 필드: CODE(값), VALUE(표시)
const toOpt = (row) => ({ label: row.VALUE, value: row.CODE });

export function useAAA014Search() {
    // 퍼블리셔 초기 필터는 유지만 하고, 값 변경은 formMethods로만 함
    const [filters] = useState(createInitialFilters);
    const formMethods = useForm({ defaultValues: filters });
    const { control, getValues, setValue, watch, reset } = formMethods;

    const [familyOpts, setFamilyOpts] = useState([]);

    // 조회 버튼 비활성 여부 (TODO: 조회 가능 조건 정해지면 setter 추가)
    const [disabledSearchBox] = useState(false);

    // 콤보 값 구독: 바뀌면 params 다시 계산 → apiCodeSelect 재조회
    const watchVals = useWatch({ control, name: WATCH_COMBO_TPS.map((comboTp) => COMBO_FIELD_NMS[comboTp]) });

    // 콤보 a~h params ({ A: {...}, B: {...}, ... })
    // - 상위 콤보 조건은 공통 함수가 SC_SEQ 보고 자동으로 붙임
    const comboParams = useMemo(() => {
        const comboVals = Object.fromEntries(WATCH_COMBO_TPS.map((comboTp, idx) => [comboTp, watchVals[idx]]));

        return Object.fromEntries(COMBO_TPS.map((comboTp) => [
            comboTp,
            makeChainCombo(COMBO_DEFS, comboTp, comboVals).params
        ]));
    }, [watchVals]);

    // 콤보 값 전체로 초기화
    const clearCombos = useCallback((comboTps) => {
        comboTps.forEach((comboTp) => setValue(COMBO_FIELD_NMS[comboTp], null));
    }, [setValue]);

    // 사용자가 값을 바꿨을 때만 하위 콤보 초기화 (setValue로 바뀐 건 type이 없어서 제외)
    // - 하위 콤보는 공통 함수가 SC_SEQ 보고 판단 (family 변경 → a~g, b 변경 → c~g, h는 독립)
    useEffect(() => {
        const subscription = watch((_, { name, type }) => {
            if (type !== 'change') return;

            const comboTp = FIELD_NM_TO_COMBO_TP[name];
            if (!comboTp) return;

            clearCombos(makeChainCombo(COMBO_DEFS, comboTp).lowerComboTps);
        });
        return () => subscription.unsubscribe();
    }, [watch, clearCombos]);

    // family 목록 조회 결과 반영
    const applyFamilyData = useCallback((rows) => {
        setFamilyOpts((rows ?? []).map(toOpt));
    }, []);

    // 초기화: 최초 필터 값으로 복원 (현재월, w2, family a, 콤보 전체). API 재호출 없음
    // - reset은 type이 'change'가 아니라 연쇄 초기화 로직은 안 탐
    const resetFilters = useCallback(() => {
        reset({ ...filters });
    }, [reset, filters]);

    const getSearchParams = useCallback(() => ({ ...getValues() }), [getValues]);

    return {
        filters,
        formMethods,
        familyOpts,
        comboParams,
        disabledSearchBox,
        applyFamilyData,
        resetFilters,
        getSearchParams
    };
}
