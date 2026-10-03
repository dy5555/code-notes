import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";

/**
 * 메인 ag-Grid 전용 Hook
 * 공통 약어는 짧고 명확하게 사용한다. (code -> cd, count -> cnt)
 */
const useRPAxxxGrid = (searchFilter) => {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 보정 가능 데이터 건수. 0이면 일괄보정 버튼 비활성화.
  const [correctionAvailableCnt, setCorrectionAvailableCnt] = useState(0);

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

  /** 화면 검색조건을 API 파라미터로 변환 */
  const makeParams = useCallback(() => ({
    stockMonth: searchFilter.stockMonth
      ? dayjs(searchFilter.stockMonth).format("YYYYMM")
      : "",
    salesDemandWeek: searchFilter.salesDemandWeek,
    somCds: searchFilter.somCds,
    somMonth: searchFilter.somMonth
      ? dayjs(searchFilter.somMonth).format("YYYYMM")
      : "",
    salesResultMonth: searchFilter.salesResultMonth
      ? dayjs(searchFilter.salesResultMonth).format("YYYYMM")
      : "",
    inboundDemandWeek: searchFilter.inboundDemandWeek,
  }), [searchFilter]);

  /** 보정 가능 데이터 건수 조회 */
  const fetchCorrectionAvailableCnt = useCallback(async (params) => {
    // TODO: 실제 건수 조회 API로 교체
    // const result = await api.fetchCorrectionAvailableCnt(params);
    // return Number(result.cnt || 0);

    console.log("보정 가능 데이터 건수 조회조건", params);
    return 0;
  }, []);

  /** 메인 조회 */
  const handleSearch = useCallback(async () => {
    const params = makeParams();

    try {
      setLoading(true);

      // TODO: 실제 메인 조회 API로 교체
      // 독립 API라면 Grid 데이터/보정 가능 건수는 Promise.all로 병렬 조회 가능

      console.log("메인 조회조건", params);

      setRowData([
        {
          type: "예시",
          salesProdId: "PROD001",
          rpSomCd: "SOM001",
          batchCorrectionYn: "N",
          correctedRpSomCd: "",
        },
      ]);

      const cnt = await fetchCorrectionAvailableCnt(params);
      setCorrectionAvailableCnt(cnt);
    } catch (error) {
      console.error("메인 조회 중 오류가 발생했습니다.", error);
      setRowData([]);
      setCorrectionAvailableCnt(0);
    } finally {
      setLoading(false);
    }
  }, [fetchCorrectionAvailableCnt, makeParams]);

  /** 일괄보정 */
  const handleBatchCorrection = useCallback(async () => {
    if (correctionAvailableCnt <= 0) return;

    const params = makeParams();

    try {
      setLoading(true);

      // TODO: 실제 일괄보정 API로 교체
      // await api.batchCorrectRPAxxx(params);

      console.log("일괄보정 실행조건", params);

      // 처리 완료 후 handleSearch()로 Grid/건수를 최신 상태로 갱신
    } catch (error) {
      console.error("일괄보정 중 오류가 발생했습니다.", error);
    } finally {
      setLoading(false);
    }
  }, [correctionAvailableCnt, makeParams]);

  return {
    rowData,
    columnDefs,
    loading,
    correctionAvailableCnt,
    handleSearch,
    handleBatchCorrection,
  };
};

export default useRPAxxxGrid;
