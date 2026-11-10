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
 * [3] RANK 행만 값에 따라 이미지 변경 (양수: img_1 / 음수: img_2 / 0: img_3)
 *     - 배경 = 원래 색상 + 이미지 (RANK 외 행은 색상만)
 *     - 이미지: 왼쪽 / 글자: 중앙
 *     - 셀 style 의 EXPR() 에서 폼 함수 호출 → 함수가 background 값 리턴
 *     - padding 좌우 동일(20)하게 줘야 글자가 정중앙 + 이미지와 안 겹침
 *     - expr 안에서 따옴표 없는 컬럼ID(WF_SALE_AMT, COL_3)는 현재 행의 "값"으로 넘어감
 * ===================================================================== */

// 호출부 (포맷 문자열 조합)
strBody += '<Cell col="' + nCol + '" text="bind:' + strColId + '"'
         + ' style="background:EXPR(comp.parent.fn_getDiffImg(' + strColId + ', COL_3));'
         + ' align:center middle; padding:0 20 0 20;"/>';

/**
 * RANK 행만 증감값에 따라 셀 배경(색상 + 이미지) 리턴
 * @param  vVal    셀 데이터 값
 * @param  strGbn  COL_3 구분 코드
 * @return background 스타일 값 (RANK 아니면 색상만)
 *         예) #ffffff URL('theme://images/img_1.png') no-repeat left middle
 * ※ 그리드가 Div/Tab 안에 있으면 comp.parent 가 Div 를 가리킬 수 있음 → 함수 위치 경로 맞출 것
 */
this.fn_getDiffImg = function(vVal, strGbn)
{
    var strBgColor = "#ffffff";                 // 원래 배경색으로 변경

    if (strGbn != "RANK") return strBgColor;    // RANK 외 행은 색상만

    var nVal    = nexacro.toNumber(vVal, 0);
    var strImg  = "img_3.png";                  // 0

    if (nVal > 0)       strImg = "img_1.png";   // 양수
    else if (nVal < 0)  strImg = "img_2.png";   // 음수

    return strBgColor + " URL('theme://images/" + strImg + "') no-repeat left middle";
};
