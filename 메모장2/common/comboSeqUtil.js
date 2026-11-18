// 연쇄 콤보 공통 함수 (SC_SEQ 기준)
// - 회사 공통 함수 파일에 그대로 옮겨서 사용
// - 콤보 데이터셋 행에 SC_SEQ만 적으면 상위/하위 관계를 자동으로 판단
//
// SC_SEQ 규칙 (Nexacro 공통 콤보와 동일)
// - 숫자: 연쇄 콤보. 나보다 작은 번호가 전부 상위, 큰 번호가 전부 하위
// - 빈 값: 완전 독립. 상위 조건 없음, 다른 콤보가 바뀌어도 초기화 안 됨
//
// 전제
// - 하위 테이블에 상위 콤보 코드 컬럼이 상위 콤보의 COLUMN0과 같은 이름으로 있음
// - 한 줄로 이어지는 연쇄만 지원 (갈라지는 연쇄는 지원 안 함)

/**
 * 연쇄 콤보 처리: params 생성 + 하위 콤보 목록
 * - params: 상위 콤보의 COLUMN0과 현재 값으로 IN_CONT 뒤에 조건 추가 (값이 비면 안 붙임)
 *           SC_SEQ는 프론트 전용이라 빼고, queryDeps에 상위 값 목록을 넣음
 * - lowerComboTps: 이 콤보가 바뀌면 초기화할 하위 콤보 목록
 * @param {object} comboDefs 콤보 데이터셋 ({ FAMILY: {...}, A: {...}, ... })
 * @param {string} comboTp 대상 콤보 구분
 * @param {object} comboVals 콤보별 현재 값 ({ FAMILY: 'a', A: 'A1', ... })
 * @returns {{ params: object, lowerComboTps: string[] }}
 *
 * @example
 * makeChainCombo(COMBO_DEFS, 'C', { FAMILY: 'a', A: 'A1', B: 'B2' });
 * // → {
 * //     params: { TABLENM: 'TB_C', ..., IN_CONT: "AND FAMILY_CD = 'a' AND A_CD = 'A1' AND B_CD = 'B2'", queryDeps: ['a', 'A1', 'B2'] },
 * //     lowerComboTps: ['D', 'E', 'F', 'G']
 * //   }
 */
export const makeChainCombo = (comboDefs, comboTp, comboVals = {}) => {
    const isEmptyVal = (val) => val === null || val === undefined || val === '';
    const escapeSqlVal = (val) => String(val).replace(/'/g, "''"); // 작은따옴표로 SQL을 끼워 넣는 것 방지

    const { SC_SEQ: mySeq, ...sendParams } = comboDefs[comboTp];
    const isChain = !isEmptyVal(mySeq); // 빈 값이면 완전 독립

    // 연쇄 콤보 목록 (SC_SEQ 오름차순)
    const chainEntries = Object.entries(comboDefs)
        .filter(([, comboDef]) => !isEmptyVal(comboDef.SC_SEQ))
        .sort(([, defA], [, defB]) => Number(defA.SC_SEQ) - Number(defB.SC_SEQ));

    // 상위 조건: 나보다 SC_SEQ가 작은 콤보의 COLUMN0 = 현재 값
    const conds = isChain
        ? chainEntries
            .filter(([, comboDef]) => Number(comboDef.SC_SEQ) < Number(mySeq))
            .map(([upperComboTp, comboDef]) => ({ col: comboDef.COLUMN0, val: comboVals[upperComboTp] }))
        : [];

    const addCond = conds
        .filter(({ col, val }) => col && !isEmptyVal(val))
        .map(({ col, val }) => ` AND ${col} = '${escapeSqlVal(val)}'`)
        .join('');

    // 하위 콤보: 나보다 SC_SEQ가 큰 콤보
    const lowerComboTps = isChain
        ? chainEntries
            .filter(([, comboDef]) => Number(comboDef.SC_SEQ) > Number(mySeq))
            .map(([lowerComboTp]) => lowerComboTp)
        : [];

    return {
        params: {
            ...sendParams,
            IN_CONT: `${sendParams.IN_CONT ?? ''}${addCond}`.trim(),
            queryDeps: conds.map(({ val }) => (isEmptyVal(val) ? null : val))
        },
        lowerComboTps
    };
};
