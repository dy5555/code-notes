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
    COMBO_DEFS
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

// 값이 비어 있는지 (비어 있으면 조건을 붙이지 않음 = 전체)
const isEmptyVal = (val) => val === null || val === undefined || val === '';

// 콤보별 추가 조건 목록: family + 연쇄 상위 콤보 전부
// - 조건 컬럼은 각 콤보 데이터셋 행의 COLUMN0 (하위 테이블에 같은 이름으로 있음)
// - 예) d: family, a, b, c 조건 / h: family 조건만 (독립)
const getComboConds = (comboTp, familyVal, chainValMap) => {
    const familyCond = { col: COMBO_DEFS[FAMILY_COMBO_TP].COLUMN0, val: familyVal };

    const chainIdx = CHAIN_COMBO_ORDER.indexOf(comboTp);
    if (chainIdx < 0) return [familyCond];

    const upperConds = CHAIN_COMBO_ORDER
        .slice(0, chainIdx)
        .map((upperComboTp) => ({ col: COMBO_DEFS[upperComboTp].COLUMN0, val: chainValMap[upperComboTp] }));

    return [familyCond, ...upperConds];
};

// 데이터셋 행 + 추가 조건 → apiCodeSelect params
// - 추가 조건을 IN_CONT(고정 조건) 뒤에 붙임 (값이 없으면 안 붙임)
// - queryDeps: 조건 값이 바뀌면 apiCodeSelect가 다시 조회하도록 의존값 전달
const buildComboParams = (comboDef, conds) => {
    const addCond = conds
        .filter(({ col, val }) => col && !isEmptyVal(val))
        .map(({ col, val }) => ` AND ${col} = '${escapeSqlVal(val)}'`)
        .join('');

    return {
        ...comboDef,
        IN_CONT: `${comboDef.IN_CONT}${addCond}`.trim(),
        queryDeps: conds.map(({ val }) => (isEmptyVal(val) ? null : val))
    };
};

// 응답 필드: CODE(값), VALUE(표시)
const toOpt = (row) => ({ label: row.VALUE, value: row.CODE });

export function useAAA014Search() {
    // 퍼블리셔 초기 필터는 유지만 하고, 값 변경은 formMethods로만 함
    const [filters] = useState(createInitialFilters);
    const formMethods = useForm({ defaultValues: createInitialFilters() });
    const { control, getValues, setValue, watch } = formMethods;

    const [familyOpts, setFamilyOpts] = useState([]);

    // family + 연쇄 콤보(a~g) 값 구독: 바뀌면 params 다시 계산 → apiCodeSelect 재조회
    const familyVal = useWatch({ control, name: COMBO_FIELD_NMS.FAMILY });
    const chainVals = useWatch({ control, name: CHAIN_COMBO_ORDER.map((comboTp) => COMBO_FIELD_NMS[comboTp]) });

    // 콤보 a~h params ({ A: {...}, B: {...}, ... })
    const comboParams = useMemo(() => {
        const chainValMap = Object.fromEntries(CHAIN_COMBO_ORDER.map((comboTp, idx) => [comboTp, chainVals[idx]]));

        return Object.fromEntries(COMBO_TPS.map((comboTp) => [
            comboTp,
            buildComboParams(COMBO_DEFS[comboTp], getComboConds(comboTp, familyVal, chainValMap))
        ]));
    }, [familyVal, chainVals]);

    // family 목록 조회 params (추가 조건 없음)
    const familyParams = useMemo(() => buildComboParams(COMBO_DEFS[FAMILY_COMBO_TP], []), []);

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
