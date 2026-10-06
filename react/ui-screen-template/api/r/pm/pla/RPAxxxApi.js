/**
 * RPA048 API
 *
 * 회사 프로젝트 API 호출 패턴
 * - 함수에서 params를 받는다.
 * - let searchData = params; 형태로 조회조건을 넘긴다.
 * - 메인 Grid 조회는 axiosUtil.queryViewPost(url, searchData, {}) 사용
 * - 나머지 조회는 axiosUtil.get(url, searchData, {}) 사용
 */

// TODO: 실제 회사 axiosUtil import 경로로 변경
// import axiosUtil from "@/.../axiosUtil";

/** 최초 월/주차 기준값 조회 */
export const getInitialFilterValues = async (params = {}) => {
  let searchData = params;

  const response = await axiosUtil.get(
    "실제 초기값 조회 URL",
    searchData,
    {}
  );

  return response;
};

/** SOM 월 기준 코드 목록 조회 */
export const getSomCdOptions = async (params) => {
  let searchData = params;

  const response = await axiosUtil.get(
    "실제 SOM 코드 조회 URL",
    searchData,
    {}
  );

  return response;
};

/** 메인 Grid 조회 */
export const searchRpa048 = async (params) => {
  let searchData = params;

  const response = await axiosUtil.queryViewPost(
    "실제 메인 조회 URL",
    searchData,
    {}
  );

  return response;
};

/** 보정 가능 데이터 건수 조회 */
export const getCorrectionAvailableCnt = async (params) => {
  let searchData = params;

  const response = await axiosUtil.get(
    "실제 보정 가능 건수 조회 URL",
    searchData,
    {}
  );

  return response;
};
