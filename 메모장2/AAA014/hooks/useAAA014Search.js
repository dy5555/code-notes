import { useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import {
    ALL_VAL,
    ALL_OPT,
    DEFAULT_W,
    DEFAULT_FAMILY,
    FAMILY_COMBO_TP,
    COMBO_TPS,
    COMBO_FIELD_NMS
} from '../consts/AAA014Vars';

// 콤보 a~h 선택값 초기값: 전부 ALL ({ aCd: 'ALL', bCd: 'ALL', ... })
const createInitComboVals = () =>
    Object.fromEntries(COMBO_TPS.map((comboTp) => [COMBO_FIELD_NMS[comboTp], ALL_VAL]));

// 콤보 a~h 옵션 초기값: 전부 [전체] ({ A: [전체], B: [전체], ... })
const createInitComboOpts = () =>
    Object.fromEntries(COMBO_TPS.map((comboTp) => [comboTp, [ALL_OPT]]));

const createInitialFilters = () => ({
    month: dayjs(), // 현재월
    wCd: DEFAULT_W,
    family: DEFAULT_FAMILY,
    ...createInitComboVals(),
    rpCd: null, // 검색박스: 로직 추후
    plnProdId: null // 검색박스: 로직 추후
});

// 조회 행 → Select 옵션 (화면에는 NM 표시, 값은 CD)
const toOpt = (row) => ({ label: row.NM, value: row.CD });

export function useAAA014Search() {
    // 퍼블리셔 초기 필터는 유지만 하고, 값 변경은 formMethods로만 함
    const [filters] = useState(createInitialFilters);
    const formMethods = useForm({ defaultValues: createInitialFilters() });
    const { getValues } = formMethods;

    const [familyOpts, setFamilyOpts] = useState([]);
    const [comboOpts, setComboOpts] = useState(createInitComboOpts);

    // a~h 조회 원본 (PRNT_CD 포함, 연쇄 필터할 때 사용)
    const comboRowsRef = useRef([]);

    // 콤보 조회 결과 반영: COMBO_TP별로 나눠서 옵션 세팅
    const applyComboData = useCallback((rows) => {
        const list = rows ?? [];

        // family 목록은 최초 조회에만 포함 (family 변경 재조회 결과에는 없음)
        const familyRows = list.filter((row) => row.COMBO_TP === FAMILY_COMBO_TP);
        if (familyRows.length > 0) {
            setFamilyOpts(familyRows.map(toOpt));
        }

        // a~h: 맨 앞에 [전체] 붙이고 COMBO_TP별로 담기
        // TODO: 앞 콤보가 ALL일 때 뒤 콤보에 전체 목록을 보여줄지 확인 필요 (현재는 전체 목록)
        comboRowsRef.current = list.filter((row) => row.COMBO_TP !== FAMILY_COMBO_TP);
        const nextComboOpts = createInitComboOpts();
        comboRowsRef.current.forEach((row) => {
            nextComboOpts[row.COMBO_TP]?.push(toOpt(row));
        });
        setComboOpts(nextComboOpts);
    }, []);

    const getSearchParams = useCallback(() => ({ ...getValues() }), [getValues]);

    return {
        filters,
        formMethods,
        familyOpts,
        comboOpts,
        applyComboData,
        getSearchParams
    };
}
