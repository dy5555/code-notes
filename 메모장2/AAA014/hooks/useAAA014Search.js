import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import dayjs from 'dayjs';
import {
    DEFAULT_W,
    DEFAULT_FAMILY,
    FAMILY_COMBO_TP,
    COMBO_TPS,
    CHAIN_COMBO_ORDER,
    COMBO_FIELD_NMS,
    COMBO_DEF_MAP
} from '../consts/AAA014Vars';

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

// SQL 문자열 값 이스케이프: 작은따옴표로 문장을 끊고 SQL을 끼워 넣는 것 방지
const escapeSqlVal = (val) => String(val).replace(/'/g, "''");

// 콤보 행 + 현재 family/부모 값 → CodeSelect params
// - family, 부모 조건을 in_cont 뒤에 붙임 (값이 없으면 안 붙임)
// - 프론트 전용 항목(COMBO_TP 등)은 빼고 공통 쿼리 파라미터만 전송
// - queryDeps: family/부모 값이 바뀌면 CodeSelect가 다시 조회하도록 의존값 전달
const buildComboParams = (comboDef, familyVal, prntVal) => {
    const { COMBO_TP, FAMILY_COLUMN, PRNT_COMBO_TP, PRNT_COLUMN, ...sendParams } = comboDef;

    let addCond = '';
    if (FAMILY_COLUMN && familyVal) {
        addCond += ` AND ${FAMILY_COLUMN} = '${escapeSqlVal(familyVal)}'`;
    }
    if (PRNT_COLUMN && prntVal) {
        addCond += ` AND ${PRNT_COLUMN} = '${escapeSqlVal(prntVal)}'`;
    }

    return {
        ...sendParams,
        in_cont: `${sendParams.in_cont}${addCond}`,
        queryDeps: [familyVal ?? null, prntVal ?? null]
    };
};

// 공통 콤보 조회 행 → Radio 옵션
// TODO: 공통 콤보 API 응답 필드명(CD, NM) 실제 값으로 교체
const toOpt = (row) => ({ label: row.NM, value: row.CD });

export function useAAA014Search() {
    // 퍼블리셔 초기 필터는 유지만 하고, 값 변경은 formMethods로만 함
    const [filters] = useState(createInitialFilters);
    const formMethods = useForm({ defaultValues: createInitialFilters() });
    const { control, getValues, setValue, watch } = formMethods;

    const [familyOpts, setFamilyOpts] = useState([]);

    // family + 연쇄 부모(a~f) 값 구독: 바뀌면 params 다시 계산 → CodeSelect 재조회
    const familyVal = useWatch({ control, name: COMBO_FIELD_NMS.FAMILY });
    const chainVals = useWatch({ control, name: CHAIN_COMBO_ORDER.map((comboTp) => COMBO_FIELD_NMS[comboTp]) });

    // 콤보 a~h params ({ A: {...}, B: {...}, ... })
    const comboParams = useMemo(() => {
        const chainValMap = Object.fromEntries(CHAIN_COMBO_ORDER.map((comboTp, idx) => [comboTp, chainVals[idx]]));

        return Object.fromEntries(COMBO_TPS.map((comboTp) => {
            const comboDef = COMBO_DEF_MAP[comboTp];
            const prntVal = comboDef.PRNT_COMBO_TP ? chainValMap[comboDef.PRNT_COMBO_TP] : null;
            return [comboTp, buildComboParams(comboDef, familyVal, prntVal)];
        }));
    }, [familyVal, chainVals]);

    // family 목록 조회 params (조건 고정)
    const familyParams = useMemo(() => buildComboParams(COMBO_DEF_MAP[FAMILY_COMBO_TP], null, null), []);

    // 콤보 값 전체로 초기화
    const clearCombos = useCallback((comboTps) => {
        comboTps.forEach((comboTp) => setValue(COMBO_FIELD_NMS[comboTp], null));
    }, [setValue]);

    // 사용자가 값을 바꿨을 때만 초기화 (setValue로 바뀐 건 type이 없어서 제외)
    // - family 변경: a~h 전부 초기화
    // - a~f 변경: 바꾼 콤보 뒤쪽 ~ g까지 초기화
    useEffect(() => {
        const subscription = watch((_, { name, type }) => {
            if (type !== 'change') return;

            if (name === COMBO_FIELD_NMS.FAMILY) {
                clearCombos(COMBO_TPS);
                return;
            }

            const chainIdx = CHAIN_COMBO_ORDER.findIndex((comboTp) => COMBO_FIELD_NMS[comboTp] === name);
            if (chainIdx >= 0) {
                clearCombos(CHAIN_COMBO_ORDER.slice(chainIdx + 1));
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, clearCombos]);

    // family 목록 조회 결과 반영
    const applyFamilyData = useCallback((rows) => {
        setFamilyOpts((rows ?? []).map(toOpt));
    }, []);

    const getSearchParams = useCallback(() => ({ ...getValues() }), [getValues]);

    return {
        filters,
        formMethods,
        familyOpts,
        familyParams,
        comboParams,
        applyFamilyData,
        getSearchParams
    };
}
