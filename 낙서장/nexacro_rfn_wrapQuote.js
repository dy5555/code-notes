/**
 * 콤마 구분 문자열을 SQL IN절용 문자열로 변환
 *  - "All"        → ''
 *  - "서울 강남,부산" → '서울 강남','부산'  (값 중간 공백 유지)
 *  - "A, B , C"   → 'A','B','C'        (콤마 앞뒤 공백만 제거)
 *  - " ,A" / ",A" → ""                 (맨 앞이 콤마면 빈 값)
 */
this.rfn_wrapQuote = function(strVal)
{
    if (strVal == "All")
        return '';

    var strRtnVal = this.gfn_replace(strVal, 'undefined', '');
    if (this.gfn_isNull(strRtnVal))
        strRtnVal = "";

    // 콤마로 나눈 뒤 각 값의 앞뒤 공백만 제거 (값 중간 공백은 유지)
    // Nexacro 14에서 String.trim() 미지원 가능성 때문에 정규식 사용
    var arrVal = String(strRtnVal).split(",");
    for (var i = 0; i < arrVal.length; i++) {
        arrVal[i] = arrVal[i].replace(/^\s+|\s+$/g, "");
    }
    strRtnVal = arrVal.join(",");

    if (strRtnVal.substr(0, 1) == ",")
        strRtnVal = "";

    if (this.gfn_isEmpty(strRtnVal))
        return strRtnVal;

    return this.gfn_wrapQuote(this.gfn_replace(strRtnVal, ",", "','"));
};

// 변경 없음
this.gfn_wrapQuote = function(val)
{
    var sVal = "";

    if (this.gfn_isNull(val))
        sVal = "";
    else
        sVal = val;

    return "'" + sVal + "'";
};
