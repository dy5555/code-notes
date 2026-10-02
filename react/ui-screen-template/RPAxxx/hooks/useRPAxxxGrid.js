import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";

/**
 * 메인 ag-Grid 전용 Hook
 *
 * 담당
 * - 메인 조회 API
 * - 보정 가능 데이터 건수 조회
 * - 일괄보정 처리
 * - rowData / columnDefs 관리
 */
const useRPAxxxGrid = (filterValues) => {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 보정 가능한 데이터 건수. 0이면 일괄보정 버튼 비활성화.
  const [correctionCount, setCorrectionCount] = useState(0);

  const columnDefs = useMemo(
    () => [
      { headerName: "구분", field: "type" },
      { headerName: "SALES_PROD_ID", field: "salesProdId" },
      { headerName: "RP_SOM_CD", field: "rpSomCd" },
      { headerName: "일괄보정여부", field: "batchCorrectionYn" },
      { headerName: "보정 RP_SOM_CD", field: "correctedRpSomCd" },
    ],
    []
  );

  /**
   * 화면 필터를 API/쿼리 파라미터로 변환한다.
   * 월 DatePicker 값은 dayjs 객체이므로 API 호출 직전에 YYYYMM으로 변환한다.
   */
  const makeParams = useCallback(() => ({
    stockMonth: filterValues.stockMonth
      ? dayjs(filterValues.stockMonth).format("YYYYMM")
      : "",
    salesDemandWeek: filterValues.salesDemandWeek,
    somCodes: filterValues.somCodes,
    somMonth: filterValues.somMonth
      ? dayjs(filterValues.somMonth).format("YYYYMM")
      : "",
    salesMonth: filterValues.salesMonth
      ? dayjs(filterValues.salesMonth).format("YYYYMM")
      : "",
    inDemandWeek: filterValues.inDemandWeek,
  }), [filterValues]);

  /**
   * 보정 가능 데이터 건수 조회
   * 메인 조회와 동일한 검색조건을 기준으로 조회한다.
   */
  const loadCorrectionCount = useCallback(async (params) => {
    // TODO: 실제 건수 조회 API로 교체
    // const result = await api.getCorrectionCount(params);
    // return Number(result.count || 0);

    console.log("보정 가능 데이터 건수 조회조건", params);
    return 0; // 예제 기본값
  }, []);

  /** 조회 버튼 클릭 */
  const search = useCallback(async () => {
    const params = makeParams();

    try {
      setLoading(true);

      // 메인 데이터와 보정 가능 건수를 함께 조회할 수 있다.
      // 서로 독립된 API라면 Promise.all로 병렬 호출하는 방식이 효율적이다.
      // const [result, count] = await Promise.all([
      //   api.searchRPAxxx(params),
      //   api.getCorrectionCount(params),
      // ]);
      // setRowData(result);
      // setCorrectionCount(Number(count.count || 0));

      console.log("메인 조회조건", params);

      // UI 확인용 임시 데이터
      setRowData([
        {
          type: "예시",
          salesProdId: "PROD001",
          rpSomCd: "SOM001",
          batchCorrectionYn: "N",
          correctedRpSomCd: "",
        },
      ]);

      const count = await loadCorrectionCount(params);
      setCorrectionCount(count);
    } catch (error) {
      console.error("메인 조회 중 오류가 발생했습니다.", error);
      setRowData([]);
      setCorrectionCount(0);
    } finally {
      setLoading(false);
    }
  }, [loadCorrectionCount, makeParams]);

  /**
   * 일괄보정 버튼 클릭
   * correctionCount가 0보다 큰 경우에만 버튼이 활성화되므로 실제 호출 가능.
   */
  const batchCorrect = useCallback(async () => {
    if (correctionCount <= 0) return;

    const params = makeParams();

    try {
      setLoading(true);

      // TODO: 실제 일괄보정 API로 교체
      // await api.batchCorrectRPAxxx(params);

      console.log("일괄보정 실행조건", params);

      // 보정 완료 후 화면을 다시 조회하여 Grid와 건수를 최신 상태로 맞춘다.
      // await search();
    } catch (error) {
      console.error("일괄보정 중 오류가 발생했습니다.", error);
    } finally {
      setLoading(false);
    }
  }, [correctionCount, makeParams]);

  return {
    rowData,
    columnDefs,
    loading,
    correctionCount,
    search,
    batchCorrect,
  };
};

export default useRPAxxxGrid;
