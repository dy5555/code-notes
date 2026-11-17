// AAA014 화면 상수

// 콤보 전체 선택값 (화면 표시는 '전체')
export const ALL_VAL = 'ALL';
export const ALL_OPT = { label: '전체', value: ALL_VAL };

// w 콤보 (기본값 w2)
export const W_OPTS = [
  { label: 'w1', value: 'w1' },
  { label: 'w2', value: 'w2' },
  { label: 'w3', value: 'w3' },
  { label: 'w4', value: 'w4' },
];
export const DEFAULT_W = 'w2';

// family solid Radio 기본값 (목록은 서버 조회)
export const DEFAULT_FAMILY = 'a';

// 콤보 구분값
export const FAMILY_COMBO_TP = 'FAMILY';
export const COMBO_TPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// 연쇄 콤보 순서 (앞 콤보 변경 시 뒤쪽 콤보 ALL 초기화, h는 독립이라 제외)
export const CHAIN_COMBO_ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

// 콤보별 폼 필드명 (React Hook Form name)
export const COMBO_FIELD_NMS = {
  A: 'aCd',
  B: 'bCd',
  C: 'cCd',
  D: 'dCd',
  E: 'eCd',
  F: 'fCd',
  G: 'gCd',
  H: 'hCd',
};

// 콤보별 화면 라벨 (실제 라벨명으로 교체)
export const COMBO_LABELS = {
  A: 'a',
  B: 'b',
  C: 'c',
  D: 'd',
  E: 'e',
  F: 'f',
  G: 'g',
  H: 'h',
};

// family 목록 조회 정의
// - 화면 진입 시: FAMILY_COMBO_DEF + COMBO_DEFS 한 번에 조회
// - family 변경 시: COMBO_DEFS만 다시 조회
// - family 목록 자체에는 family 조건을 넣지 않음
export const FAMILY_COMBO_DEF = {
  COMBO_TP: FAMILY_COMBO_TP,
  TABLENM: 'TB_FAMILY',
  COLUMN0: 'FAMILY_CD',
  COLUMN1: 'FAMILY_NM',
  PrntCodeNm: '',
  GTS_TYP_CD: '',
  SYS_TYP_CD: '',
  CD_DIV: '',
  SORT_TYPE: '',
  IN_CONT: '',
};

// 콤보 a~h 조회 정의 (기존 공통 쿼리 파라미터명 그대로)
// - COMBO_TP: 프론트 구분용
// - PrntCodeNm: 부모 콤보 코드 컬럼 (부모 없는 a, h는 '')
// - family 조건(FAMILY_CD)은 조회 시 Fetch 훅에서 자동으로 추가
// - 테이블, 컬럼, 조건 값은 임시 값 → 실제 값으로 교체
export const COMBO_DEFS = [
  {
    COMBO_TP: 'A',
    TABLENM: 'TB_A',
    COLUMN0: 'A_CD',
    COLUMN1: 'A_NM',
    PrntCodeNm: '',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
  },
  {
    COMBO_TP: 'B',
    TABLENM: 'TB_B',
    COLUMN0: 'B_CD',
    COLUMN1: 'B_NM',
    PrntCodeNm: 'A_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
  },
  {
    COMBO_TP: 'C',
    TABLENM: 'TB_C',
    COLUMN0: 'C_CD',
    COLUMN1: 'C_NM',
    PrntCodeNm: 'B_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
  },
  {
    COMBO_TP: 'D',
    TABLENM: 'TB_D',
    COLUMN0: 'D_CD',
    COLUMN1: 'D_NM',
    PrntCodeNm: 'C_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
  },
  {
    COMBO_TP: 'E',
    TABLENM: 'TB_E',
    COLUMN0: 'E_CD',
    COLUMN1: 'E_NM',
    PrntCodeNm: 'D_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
  },
  {
    COMBO_TP: 'F',
    TABLENM: 'TB_F',
    COLUMN0: 'F_CD',
    COLUMN1: 'F_NM',
    PrntCodeNm: 'E_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
  },
  {
    COMBO_TP: 'G',
    TABLENM: 'TB_G',
    COLUMN0: 'G_CD',
    COLUMN1: 'G_NM',
    PrntCodeNm: 'F_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
  },
  {
    COMBO_TP: 'H',
    TABLENM: 'TB_H',
    COLUMN0: 'H_CD',
    COLUMN1: 'H_NM',
    PrntCodeNm: '',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
  },
];
