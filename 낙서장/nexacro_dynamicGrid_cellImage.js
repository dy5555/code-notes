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
