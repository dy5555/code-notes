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

// 콤보 조회 조건 9개 행 (Nexacro 공통 콤보 Dataset 행과 같은 역할)
// - 프론트 전용 (서버로 안 보냄)
//     COMBO_TP      : 콤보 구분
//     FAMILY_COLUMN : family 조건 컬럼 (값 있으면 in_cont에 family 조건 추가)
//     PRNT_COMBO_TP : 부모 콤보 구분 (부모 값으로 조회 조건 추가)
//     PRNT_COLUMN   : 부모 조건 컬럼
// - 서버 전송 (공통 쿼리 파라미터명 그대로, 소문자)
//     tablenm, column0, column1, gts_typ_cd, sys_typ_cd, cd_div, sort_type, in_cont
// - 테이블, 컬럼, 조건 값은 임시 값 → 실제 값으로 교체
export const COMBO_DEFS = [
  {
    COMBO_TP: 'FAMILY',
    FAMILY_COLUMN: '',
    PRNT_COMBO_TP: '',
    PRNT_COLUMN: '',
    tablenm: 'TB_FAMILY',
    column0: 'FAMILY_CD',
    column1: 'FAMILY_NM',
    gts_typ_cd: '',
    sys_typ_cd: '',
    cd_div: '',
    sort_type: '',
    in_cont: '',
  },
  {
    COMBO_TP: 'A',
    FAMILY_COLUMN: 'FAMILY_CD',
    PRNT_COMBO_TP: '',
    PRNT_COLUMN: '',
    tablenm: 'TB_A',
    column0: 'A_CD',
    column1: 'A_NM',
    gts_typ_cd: '',
    sys_typ_cd: '',
    cd_div: '',
    sort_type: '',
    in_cont: '',
  },
  {
    COMBO_TP: 'B',
    FAMILY_COLUMN: 'FAMILY_CD',
    PRNT_COMBO_TP: 'A',
    PRNT_COLUMN: 'A_CD',
    tablenm: 'TB_B',
    column0: 'B_CD',
    column1: 'B_NM',
    gts_typ_cd: '',
    sys_typ_cd: '',
    cd_div: '',
    sort_type: '',
    in_cont: '',
  },
  {
    COMBO_TP: 'C',
    FAMILY_COLUMN: 'FAMILY_CD',
    PRNT_COMBO_TP: 'B',
    PRNT_COLUMN: 'B_CD',
    tablenm: 'TB_C',
    column0: 'C_CD',
    column1: 'C_NM',
    gts_typ_cd: '',
    sys_typ_cd: '',
    cd_div: '',
    sort_type: '',
    in_cont: '',
  },
  {
    COMBO_TP: 'D',
    FAMILY_COLUMN: 'FAMILY_CD',
    PRNT_COMBO_TP: 'C',
    PRNT_COLUMN: 'C_CD',
    tablenm: 'TB_D',
    column0: 'D_CD',
    column1: 'D_NM',
    gts_typ_cd: '',
    sys_typ_cd: '',
    cd_div: '',
    sort_type: '',
    in_cont: '',
  },
  {
    COMBO_TP: 'E',
    FAMILY_COLUMN: 'FAMILY_CD',
    PRNT_COMBO_TP: 'D',
    PRNT_COLUMN: 'D_CD',
    tablenm: 'TB_E',
    column0: 'E_CD',
    column1: 'E_NM',
    gts_typ_cd: '',
    sys_typ_cd: '',
    cd_div: '',
    sort_type: '',
    in_cont: '',
  },
  {
    COMBO_TP: 'F',
    FAMILY_COLUMN: 'FAMILY_CD',
    PRNT_COMBO_TP: 'E',
    PRNT_COLUMN: 'E_CD',
    tablenm: 'TB_F',
    column0: 'F_CD',
    column1: 'F_NM',
    gts_typ_cd: '',
    sys_typ_cd: '',
    cd_div: '',
    sort_type: '',
    in_cont: '',
  },
  {
    COMBO_TP: 'G',
    FAMILY_COLUMN: 'FAMILY_CD',
    PRNT_COMBO_TP: 'F',
    PRNT_COLUMN: 'F_CD',
    tablenm: 'TB_G',
    column0: 'G_CD',
    column1: 'G_NM',
    gts_typ_cd: '',
    sys_typ_cd: '',
    cd_div: '',
    sort_type: '',
    in_cont: '',
  },
  {
    COMBO_TP: 'H',
    FAMILY_COLUMN: 'FAMILY_CD',
    PRNT_COMBO_TP: '',
    PRNT_COLUMN: '',
    tablenm: 'TB_H',
    column0: 'H_CD',
    column1: 'H_NM',
    gts_typ_cd: '',
    sys_typ_cd: '',
    cd_div: '',
    sort_type: '',
    in_cont: '',
  },
];

// COMBO_TP로 행 찾기용 ({ FAMILY: {...}, A: {...}, ... })
export const COMBO_DEF_MAP = Object.fromEntries(COMBO_DEFS.map((comboDef) => [comboDef.COMBO_TP, comboDef]));
