/**
 * Nexacro 14 동적 그리드 - 셀에 이미지 넣기 (포맷 문자열 조합 방식)
 *
 * [1] text + displaytype="image" : 셀 내용 자체가 이미지 (데이터 값 표시 X)
 * [2] style background           : 배경에 이미지 + text에 데이터 값 표시
 *
 * ※ JS 문자열을 작은따옴표로 감싸고 있으므로 URL() 안의 작은따옴표는 &apos; 로 표기
 */

// [1] 이미지만 표시
strBody += '<Cell col="' + nCol + '" displaytype="image" text="theme://images/img_1.png"/>';

// [2] 이미지 + 데이터 값 표시 (padding 으로 글자를 이미지 오른쪽으로 밀기)
strBody += '<Cell col="' + nCol + '" text="bind:' + strColId + '"'
         + ' style="background:URL(&apos;theme://images/img_1.png&apos;) no-repeat left middle; padding:0 0 0 20;"/>';

// 조합 완료 후 세팅
// this.Grid00.formats = strFormat;


/* =====================================================================
 * [3] 행/컬럼 조건별 배경색 + 이미지 + 0 은 "-" 표시
 *     - COL_1, COL_2                     : 없음
 *     - RANK 행 (COL_3 부터)              : 배경색
 *     - 증감 + RANK 행 (COL_3 이후 데이터) : 배경색 + 값에 따라 이미지
 *                                          (양수: img_1 ▲초록 / 음수: img_2 ▼빨강 / 0: img_3 ―노랑)
 *     - 이미지: 왼쪽 / 글자: 중앙 (padding 좌우 동일해야 정중앙 + 이미지와 안 겹침)
 *     - 숫자 표시: 0 / null → "-", 그 외 천 단위 콤마 (displaytype number, mask 사용 X)
 *     - 데이터셋 값은 숫자 그대로 유지 (정렬/이미지 판단 영향 없음)
 *     - 이미지 파일: 낙서장/images/ → theme://images/ 에 복사
 * ===================================================================== */

// 호출부 (포맷 문자열 조합 - 모든 셀 공통)
//  - currow  : expr 예약어, 현재 행 번호
//  - 컬럼 ID 는 "이름 자체"를 넘겨야 하므로 &apos; 로 감쌈 (감싸지 않으면 값이 넘어감)
strBody += '<Cell col="' + nCol + '"'
         + ' text="expr:comp.parent.fn_fmtNum(' + strColId + ')"'
         + ' style="background:EXPR(comp.parent.fn_getCellBg(currow, &apos;' + strColId + '&apos;));'
         + ' align:center middle; padding:0 20 0 20;"/>';

/**
 * 컬럼/행 조건에 따라 셀 배경 리턴
 *  - COL_1, COL_2                     : 없음
 *  - RANK 행 (COL_3 부터)              : 배경색
 *  - 증감 + RANK 행 (COL_3 이후 데이터) : 배경색 + 값에 따라 이미지
 * @param  nRow      현재 행 번호 (currow)
 * @param  strColId  셀 컬럼 ID
 * @return background 스타일 값
 * ※ 그리드가 Div/Tab 안에 있으면 comp.parent 가 Div 를 가리킬 수 있음 → 함수 위치 경로 맞출 것
 */
this.fn_getCellBg = function(nRow, strColId)
{
    var strRankColor = "#ffe0e0";                           // RANK 색상으로 변경
    var strHalfGbn   = this.ds_list.getColumn(nRow, "COL_2");
    var strGbn       = this.ds_list.getColumn(nRow, "COL_3");

    // COL_1, COL_2 / RANK 외 행 : 적용 안 함
    if (strColId == "COL_1" || strColId == "COL_2") return "";
    if (strGbn != "RANK") return "";

    // RANK 행 : COL_3 이거나 증감 행이 아니면 색상만
    if (strColId == "COL_3" || strHalfGbn != "증감") return strRankColor;

    // 증감 + RANK 행 데이터 컬럼 : 색상 + 값에 따라 이미지
    var nVal   = nexacro.toNumber(this.ds_list.getColumn(nRow, strColId), 0);
    var strImg = "img_3.png";                               // 0

    if (nVal > 0)       strImg = "img_1.png";               // 양수
    else if (nVal < 0)  strImg = "img_2.png";               // 음수

    return strRankColor + " URL('theme://images/" + strImg + "') no-repeat left middle";
};

/**
 * 숫자 표시용 포맷 (0 / null → "-", 그 외 천 단위 콤마)
 * @param  vVal 셀 데이터 값
 * @return 화면 표시 문자열
 */
this.fn_fmtNum = function(vVal)
{
    if (vVal == null || vVal === "" || nexacro.toNumber(vVal, 0) == 0) return "-";

    return String(vVal).replace(/\B(?=(\d{3})+(?!\d))/g, ",");   // 1234567 → 1,234,567
};
