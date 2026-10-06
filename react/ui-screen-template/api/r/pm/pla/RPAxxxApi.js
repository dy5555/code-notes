/**
 * RPAxxx API
 *
 * 회사 프로젝트 기준:
 * - 메인 Grid 조회: queryViewPost
 * - 초기값/SOM 코드/건수 등 보조 조회: get
 *
 * TODO:
 * 회사에서 실제 axiosUtil import 경로와
 * get/queryViewPost의 인자 형식을 확인한 뒤 아래 호출부만 맞춘다.
 */

// TODO: 실제 회사 공통 axiosUtil 경로로 변경
// import axiosUtil from "@/.../axiosUtil";

/** 최초 월/주차 기준값 조회 - GET */
export const getInitialFilterValues = async () => {
  // return await axiosUtil.get("실제 초기값 조회 URL");
  throw new Error("TODO: axiosUtil.get 초기값 조회 API 연결 필요");
};

/** SOM 월 기준 코드 목록 조회 - GET */
export const getSomCdOptions = async (params) => {
  // return await axiosUtil.get("실제 SOM 코드 조회 URL", { params });
  throw new Error("TODO: axiosUtil.get SOM 코드 조회 API 연결 필요");
};

/** 메인 Grid 조회 - queryViewPost */
export const queryMainGrid = async (params) => {
  // return await axiosUtil.queryViewPost("실제 메인 조회 URL", params);
  throw new Error("TODO: axiosUtil.queryViewPost 메인 조회 API 연결 필요");
};

/** 보정 가능 데이터 건수 조회 - GET */
export const getCorrectionAvailableCnt = async (params) => {
  // return await axiosUtil.get("실제 보정 가능 건수 조회 URL", { params });
  throw new Error("TODO: axiosUtil.get 보정 가능 건수 조회 API 연결 필요");
};
