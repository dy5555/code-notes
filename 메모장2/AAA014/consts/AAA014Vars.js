// AAA014 화면 상수

// 공통 콤보 조회 URL (CodeSelect api 속성에 전달)
// TODO: 실제 공통 콤보 URL로 교체
export const COMM_COMBO_URL = '';

// w 콤보 (기본값 w2)
export const W_OPTS = [
  { label: 'w1', value: 'w1' },
  { label: 'w2', value: 'w2' },
  { label: 'w3', value: 'w3' },
  { label: 'w4', value: 'w4' },
];
export const DEFAULT_W = 'w2';

// family solid Radio 기본값 (목록은 공통 콤보 API로 조회)
export const DEFAULT_FAMILY = 'a';

// 콤보 구분값
export const FAMILY_COMBO_TP = 'FAMILY';
export const COMBO_TPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// 연쇄 콤보 순서 (앞 콤보 변경 시 뒤쪽 콤보 전체로 초기화, h는 독립이라 제외)
export const CHAIN_COMBO_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// 콤보별 폼 필드명 (퍼블리셔 CustomField name 기준)
export const COMBO_FIELD_NMS = {
  FAMILY: 'family',
  A: 'a',
  B: 'b',
  C: 'c',
  D: 'd',
  E: 'e',
  F: 'f',
  G: 'g',
  H: 'h',
};

// 콤보별 화면 제목 (퍼블리셔 CustomField title 기준, 실제 문구로 교체)
export const COMBO_TITLES = {
  A: 'a select',
  B: 'b select',
  C: 'c select',
  D: 'd select',
  E: 'e select',
  F: 'f select',
  G: 'g select',
  H: 'h select',
};

// 공통 콤보 데이터셋 9개 행 (Nexacro 공통 콤보 Dataset과 같은 역할, 키: 콤보 구분)
// - 공통 API 파라미터: TABLENM, COLUMN0, COLUMN1, GTS_TYP_CD, SYS_TYP_CD, CD_DIV, SORT_TYPE, IN_CONT
// - 응답도 CODE, VALUE로 받음
// - IN_CONT 자리표시자 {FAMILY}, {A} ~ {F}: 조회 직전에 화면의 현재 값으로 바뀜
//     값이 전체(빈 값)면 그 조건(AND ~)은 통째로 빠짐
//     자리표시자 조건은 'AND 컬럼 = '{키}'' 형태로 한 줄씩 적을 것 (괄호 안에 넣지 말 것)
//     고정 조건(예: AND USE_YN = 'Y')은 그대로 적으면 항상 붙음
// - 테이블, 조건 컬럼은 임시 값 → 실제 값으로 교체
export const COMBO_DEFS = {
  FAMILY: {
    TABLENM: 'TB_FAMILY',
    COLUMN0: 'CODE',
    COLUMN1: 'VALUE',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: "",
  },
  A: {
    TABLENM: 'TB_A',
    COLUMN0: 'CODE',
    COLUMN1: 'VALUE',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: "AND FAMILY_CD = '{FAMILY}'",
  },
  B: {
    TABLENM: 'TB_B',
    COLUMN0: 'CODE',
    COLUMN1: 'VALUE',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: "AND FAMILY_CD = '{FAMILY}' AND A_CD = '{A}'",
  },
  C: {
    TABLENM: 'TB_C',
    COLUMN0: 'CODE',
    COLUMN1: 'VALUE',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: "AND FAMILY_CD = '{FAMILY}' AND A_CD = '{A}' AND B_CD = '{B}'",
  },
  D: {
    TABLENM: 'TB_D',
    COLUMN0: 'CODE',
    COLUMN1: 'VALUE',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: "AND FAMILY_CD = '{FAMILY}' AND A_CD = '{A}' AND B_CD = '{B}' AND C_CD = '{C}'",
  },
  E: {
    TABLENM: 'TB_E',
    COLUMN0: 'CODE',
    COLUMN1: 'VALUE',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: "AND FAMILY_CD = '{FAMILY}' AND A_CD = '{A}' AND B_CD = '{B}' AND C_CD = '{C}' AND D_CD = '{D}'",
  },
  F: {
    TABLENM: 'TB_F',
    COLUMN0: 'CODE',
    COLUMN1: 'VALUE',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: "AND FAMILY_CD = '{FAMILY}' AND A_CD = '{A}' AND B_CD = '{B}' AND C_CD = '{C}' AND D_CD = '{D}' AND E_CD = '{E}'",
  },
  G: {
    TABLENM: 'TB_G',
    COLUMN0: 'CODE',
    COLUMN1: 'VALUE',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: "AND FAMILY_CD = '{FAMILY}' AND A_CD = '{A}' AND B_CD = '{B}' AND C_CD = '{C}' AND D_CD = '{D}' AND E_CD = '{E}' AND F_CD = '{F}'",
  },
  H: {
    TABLENM: 'TB_H',
    COLUMN0: 'CODE',
    COLUMN1: 'VALUE',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: "AND FAMILY_CD = '{FAMILY}'",
  },
};
