// aaa014 화면 상수

// 콤보 전체 선택값
export const ALL_VAL = 'ALL';

// w 콤보 (기본값 w2)
export const W_OPTS = [
  { value: 'w1', label: 'w1' },
  { value: 'w2', label: 'w2' },
  { value: 'w3', label: 'w3' },
  { value: 'w4', label: 'w4' },
];
export const DEFAULT_W = 'w2';

// family solid Radio 기본값 (목록은 서버 조회)
export const DEFAULT_FAMILY = 'a';

// family 목록 조회 정의
// - 화면 진입 시: FAMILY_COMBO_DEF + COMBO_DEFS 한 번에 조회
// - family 변경 시: COMBO_DEFS만 다시 조회
export const FAMILY_COMBO_DEF = {
  comboTp: 'FAMILY',
  TableNm: 'TB_FAMILY',
  CodeNm: 'FAMILY_CD',
  ValueNm: 'FAMILY_NM',
  PrntCodeNm: '',
  GTS_TYP_CD: '',
  SYS_TYP_CD: '',
  CD_DIV: '',
  SORT_TYPE: '',
  IN_CONT: '',
  EVNT_OBJ_NM: '',
  SV_OBJ_TXT: '',
  SC_SEQ: '',
};

// 연쇄 콤보 순서 (앞 콤보 변경 시 뒤쪽 콤보 ALL 초기화, h는 독립이라 제외)
export const CHAIN_COMBO_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// 콤보 a~h 조회 정의 (기존 Nexacro 공통 Dataset 컬럼 그대로)
// - comboTp: 프론트 구분용
// - PrntCodeNm: 부모 콤보 코드 컬럼 (부모 없는 a, h는 '')
// - 테이블, 컬럼, 조건 값은 임시 값 → 실제 값으로 교체
export const COMBO_DEFS = [
  {
    comboTp: 'A',
    TableNm: 'TB_A',
    CodeNm: 'A_CD',
    ValueNm: 'A_NM',
    PrntCodeNm: '',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
    EVNT_OBJ_NM: '',
    SV_OBJ_TXT: '',
    SC_SEQ: '',
  },
  {
    comboTp: 'B',
    TableNm: 'TB_B',
    CodeNm: 'B_CD',
    ValueNm: 'B_NM',
    PrntCodeNm: 'A_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
    EVNT_OBJ_NM: '',
    SV_OBJ_TXT: '',
    SC_SEQ: '',
  },
  {
    comboTp: 'C',
    TableNm: 'TB_C',
    CodeNm: 'C_CD',
    ValueNm: 'C_NM',
    PrntCodeNm: 'B_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
    EVNT_OBJ_NM: '',
    SV_OBJ_TXT: '',
    SC_SEQ: '',
  },
  {
    comboTp: 'D',
    TableNm: 'TB_D',
    CodeNm: 'D_CD',
    ValueNm: 'D_NM',
    PrntCodeNm: 'C_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
    EVNT_OBJ_NM: '',
    SV_OBJ_TXT: '',
    SC_SEQ: '',
  },
  {
    comboTp: 'E',
    TableNm: 'TB_E',
    CodeNm: 'E_CD',
    ValueNm: 'E_NM',
    PrntCodeNm: 'D_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
    EVNT_OBJ_NM: '',
    SV_OBJ_TXT: '',
    SC_SEQ: '',
  },
  {
    comboTp: 'F',
    TableNm: 'TB_F',
    CodeNm: 'F_CD',
    ValueNm: 'F_NM',
    PrntCodeNm: 'E_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
    EVNT_OBJ_NM: '',
    SV_OBJ_TXT: '',
    SC_SEQ: '',
  },
  {
    comboTp: 'G',
    TableNm: 'TB_G',
    CodeNm: 'G_CD',
    ValueNm: 'G_NM',
    PrntCodeNm: 'F_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
    EVNT_OBJ_NM: '',
    SV_OBJ_TXT: '',
    SC_SEQ: '',
  },
  {
    comboTp: 'H',
    TableNm: 'TB_H',
    CodeNm: 'H_CD',
    ValueNm: 'H_NM',
    PrntCodeNm: '',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
    EVNT_OBJ_NM: '',
    SV_OBJ_TXT: '',
    SC_SEQ: '',
  },
];
