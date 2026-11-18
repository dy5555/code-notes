// AAA014 화면 상수

// 공통 콤보 조회 URL (apiCodeSelect api 속성에 전달)
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
// - COLUMN0, COLUMN1: 코드 컬럼 (명칭은 안 씀, 화면 표시도 코드)
// - 응답은 CODE, VALUE로 받음
// - IN_CONT에는 항상 걸리는 고정 조건만 적음 (상위 콤보 조건은 조회 시 자동으로 붙음)
// - SC_SEQ: 연쇄 순서 (프론트 전용, 서버로 안 보냄)
//     숫자: 나보다 작은 번호가 상위 → 상위 COLUMN0 = 상위 값 조건 자동 추가, 내가 바뀌면 큰 번호 초기화
//     빈 값: 완전 독립 (조건 없음, 초기화 안 됨)
// - 테이블, 컬럼, 조건 값은 임시 값 → 실제 값으로 교체
export const COMBO_DEFS = {
  FAMILY: {
    TABLENM: 'TB_FAMILY',
    COLUMN0: 'FAMILY_CD',
    COLUMN1: 'FAMILY_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
    SC_SEQ: 1,
  },
  A: {
    TABLENM: 'TB_A',
    COLUMN0: 'A_CD',
    COLUMN1: 'A_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
    SC_SEQ: 2,
  },
  B: {
    TABLENM: 'TB_B',
    COLUMN0: 'B_CD',
    COLUMN1: 'B_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
    SC_SEQ: 3,
  },
  C: {
    TABLENM: 'TB_C',
    COLUMN0: 'C_CD',
    COLUMN1: 'C_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
    SC_SEQ: 4,
  },
  D: {
    TABLENM: 'TB_D',
    COLUMN0: 'D_CD',
    COLUMN1: 'D_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
    SC_SEQ: 5,
  },
  E: {
    TABLENM: 'TB_E',
    COLUMN0: 'E_CD',
    COLUMN1: 'E_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
    SC_SEQ: 6,
  },
  F: {
    TABLENM: 'TB_F',
    COLUMN0: 'F_CD',
    COLUMN1: 'F_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
    SC_SEQ: 7,
  },
  G: {
    TABLENM: 'TB_G',
    COLUMN0: 'G_CD',
    COLUMN1: 'G_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
    SC_SEQ: 8,
  },
  H: {
    TABLENM: 'TB_H',
    COLUMN0: 'H_CD',
    COLUMN1: 'H_CD',
    GTS_TYP_CD: '',
    SYS_TYP_CD: '',
    CD_DIV: '',
    SORT_TYPE: '',
    IN_CONT: '',
    SC_SEQ: '',
  },
};
