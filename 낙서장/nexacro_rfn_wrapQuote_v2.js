/**
 * 콤마 구분 문자열을 SQL IN절용 문자열로 변환
 *  - "All"          → ''
 *  - "c,a c,b"      → 'c','a c','b'  (값 중간 공백 유지)
 *  - "A , B "       → 'A','B'        (콤마 앞뒤 / 문자열 앞뒤 공백만 제거)
 *  - " ,A" / ",A"   → ""             (맨 앞이 콤마면 빈 값)
 *
 * 원래 코드 대비 변경: strRtnVal 한 줄만 수정
 *  (원래) this.gfn_replace(this.gfn_replace(strVal,'undefined',''),' ','')  → 공백 전부 제거
 *  (변경) 콤마 앞뒤 + 문자열 앞뒤 스페이스만 제거
 */
this.rfn_wrapQuote = function(strVal)
{
    if (strVal == "All")
        return '';

    var strRtnVal = this.gfn_replace(strVal, 'undefined', '').replace(/ *, */g, ",").replace(/^ +| +$/g, "");

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
