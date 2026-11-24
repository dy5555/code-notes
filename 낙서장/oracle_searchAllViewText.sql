-- =====================================================================
-- 전체 뷰(ALL_VIEWS) 정의 텍스트에서 키워드 검색
--  - TEXT 컬럼이 LONG 타입이라 LIKE 불가(ORA-00932) → DBMS_XMLGEN으로 CLOB 변환 후 검색
--  - 길이 제한 없음 / 다른 스키마 권한 문제(GET_DDL ORA-31603) 없음
--  - 주의: XML 변환이라 <, >, & 는 &lt; &gt; &amp; 로 바뀜 (테이블명/컬럼명 검색은 무관)
-- =====================================================================
SELECT v.owner
     , v.view_name
  FROM all_views v
 WHERE v.owner NOT IN ('SYS', 'SYSTEM', 'XDB', 'MDSYS', 'CTXSYS', 'ORDSYS', 'WMSYS')  -- 시스템 스키마 제외(속도)
   AND UPPER(DBMS_XMLGEN.GETXML(
             'SELECT text FROM all_views'
          || ' WHERE owner = '''     || v.owner     || ''''
          || '   AND view_name = ''' || v.view_name || ''''
         )) LIKE '%검색어%'   -- 대문자로 입력
 ORDER BY v.owner, v.view_name;
