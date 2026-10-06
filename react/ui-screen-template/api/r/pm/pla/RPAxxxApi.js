/**
 * RPAxxx API
 *
 * 회사 프로젝트 호출 기준
 * - 메인 Grid 조회: queryViewPost(url, searchData, {})
 * - 초기값/SOM 코드/건수 조회: get(url, searchData, {})
 *
 * 세 번째 빈 객체({})는 회사 공통 함수에서 요구하는 인자이며,
 * 정확한 용도는 공통 함수 정의 확인 후 주석을 보완한다.
 */

// TODO: 실제 회사 공통 함수 import 경로로 변경
// import { get, queryViewPost } from "@/.../axiosUtil";

/** 최초 월/주차 기준값 조회 */
export const getInitialFilterValues = async () => {
  const searchData = {};

  const response = await get(
    "실제 초기값 조회 URL",
    searchData,
    {}
  );

  return response;
};

/** SOM 월 기준 코드 목록 조회 */
export const getSomCdOptions = async (searchData) => {
  const response = await get(
    "실제 SOM 코드 조회 URL",
    searchData,
    {}
  );

  return response;
};

/** 메인 Grid 조회 */
export const queryMainGrid = async (searchData) => {
  const response = await queryViewPost(
    "실제 메인 조회 URL",
    searchData,
    {}
  );

  return response;
};

/** 보정 가능 데이터 건수 조회 */
export const getCorrectionAvailableCnt = async (searchData) => {
  const response = await get(
    "실제 보정 가능 건수 조회 URL",
    searchData,
    {}
  );

  return response;
};
