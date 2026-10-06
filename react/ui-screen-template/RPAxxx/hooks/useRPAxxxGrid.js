import { useCallback, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  queryMainGrid,
  getCorrectionAvailableCnt,
} from "../../../api/r/pm/pla/RPAxxxApi";

/**
 * 메인 ag-Grid 전용 Hook
 */
const useRPAxxxGrid = (searchFilter) => {
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
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

  /** 화면 검색조건 -> API 파라미터 */
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

  /** 메인 조회 */
  const handleSearch = useCallback(async () => {
    const params = makeParams();

    try {
      setLoading(true);

      // 메인 Grid 조회만 queryViewPost 사용
      const [rows, cntResult] = await Promise.all([
        queryMainGrid(params),
        getCorrectionAvailableCnt(params),
      ]);

      setRowData(rows || []);
      setCorrectionAvailableCnt(Number(cntResult?.cnt || 0));
    } catch (error) {
      console.error("메인 조회 중 오류가 발생했습니다.", error);
      setRowData([]);
      setCorrectionAvailableCnt(0);
    } finally {
      setLoading(false);
    }
  }, [makeParams]);

  const handleBatchCorrection = useCallback(async () => {
    if (correctionAvailableCnt <= 0) return;

    // TODO: 일괄보정 API 방식 확인 후 구현
  }, [correctionAvailableCnt]);

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
