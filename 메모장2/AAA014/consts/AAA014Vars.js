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
