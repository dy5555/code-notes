// arrDimList 중 dim_cols 값이 비어 있는 항목([{dim_cols=}])을 걸러서 paramMap에 넣음
// - DAO 호출 전에 실행
// - 결과가 빈 리스트면 XML의 <isNotEmpty property="arrDimList">에서 통째로 생략됨

List<Map<String, Object>> dimList = new ArrayList<>();
if (arrDimList != null) {
    for (Map<String, Object> dimMap : arrDimList) {
        Object dimCols = dimMap.get("dim_cols");
        if (dimCols != null && !dimCols.toString().trim().isEmpty()) {
            dimList.add(dimMap);
        }
    }
}
paramMap.put("arrDimList", dimList);
