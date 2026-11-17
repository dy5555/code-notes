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

// IN_CONT 자리표시자: {FAMILY}, {A} ~ {F}
const PLACEHOLDER_REG = /\{([A-Z_]+)\}/g;

// 데이터셋 행 + 현재 화면 값 → CodeSelect params
// - IN_CONT를 'AND' 단위로 나눠서, 자리표시자 값이 비어 있는 조건은 빼고 나머지는 값으로 바꿈
// - 자리표시자가 없는 고정 조건은 그대로 유지
// - queryDeps: 이 콤보가 쓰는 자리표시자 값 목록 (바뀌면 CodeSelect 재조회)
const buildComboParams = (comboDef, condVals) => {
    const usedKeys = [];

    const inCont = comboDef.IN_CONT
        .split(/(?=\bAND\b)/i)
        .filter((clause) => {
            const keys = [...clause.matchAll(PLACEHOLDER_REG)].map(([, key]) => key);
            usedKeys.push(...keys);
            return keys.every((key) => !isEmptyVal(condVals[key]));
        })
        .map((clause) => clause.replace(PLACEHOLDER_REG, (_, key) => escapeSqlVal(condVals[key])))
        .join('')
        .trim();

    return {
        ...comboDef,
        IN_CONT: inCont,
        queryDeps: usedKeys.map((key) => (isEmptyVal(condVals[key]) ? null : condVals[key]))
    };
};

// 공통 콤보 조회 행 → Radio 옵션
// 응답 필드: CODE(값), VALUE(표시)
const toOpt = (row) => ({ label: row.VALUE, value: row.CODE });

export function useAAA014Search() {
    // 퍼블리셔 초기 필터는 유지만 하고, 값 변경은 formMethods로만 함
    const [filters] = useState(createInitialFilters);
    const formMethods = useForm({ defaultValues: createInitialFilters() });
    const { control, getValues, setValue, watch } = formMethods;

    const [familyOpts, setFamilyOpts] = useState([]);

    // family + 연쇄 콤보(a~g) 값 구독: 바뀌면 params 다시 계산 → CodeSelect 재조회
    const familyVal = useWatch({ control, name: COMBO_FIELD_NMS.FAMILY });
    const chainVals = useWatch({ control, name: CHAIN_COMBO_ORDER.map((comboTp) => COMBO_FIELD_NMS[comboTp]) });

    // 콤보 a~h params ({ A: {...}, B: {...}, ... })
    const comboParams = useMemo(() => {
        // 자리표시자 값: { FAMILY: 'a', A: 'A1', B: null, ... }
        const condVals = {
            [FAMILY_COMBO_TP]: familyVal,
            ...Object.fromEntries(CHAIN_COMBO_ORDER.map((comboTp, idx) => [comboTp, chainVals[idx]]))
        };

        return Object.fromEntries(COMBO_TPS.map((comboTp) => [
            comboTp,
            buildComboParams(COMBO_DEFS[comboTp], condVals)
        ]));
    }, [familyVal, chainVals]);

    // family 목록 조회 params (자리표시자 없음)
    const familyParams = useMemo(() => buildComboParams(COMBO_DEFS[FAMILY_COMBO_TP], {}), []);

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
