-- [방법 1] 곱하기로 부호 반전
-- 연간 / 상반기 / 하반기 원본 행 + 증감 행 추가 (연도, COL_3별)
-- COL_2 : 연간 / 상반기 / 하반기
-- 증감  : 하반기 - 상반기 (연간은 계산 제외)
--         단, COL_3 = 'RANK' 는 상반기 - 하반기 (-1 곱해서 부호 반전)
-- 예) 상반기 300, 하반기 500 → 증감 200 / RANK 상반기 5, 하반기 3 → 증감 2

WITH BASE AS (
    SELECT SUBSTR(TGT_HALF, 1, 4) AS TGT_YEAR
         , COL_2
         , COL_3
         , WF_SALE_AMT
      FROM 테이블명
     WHERE TGT_HALF LIKE '2026%'      -- 특정 연도만 필요할 때 (인덱스 사용 가능)
)
SELECT TGT_YEAR, COL_3, COL_2, WF_SALE_AMT
     , DECODE(COL_2, '연간', 1, '상반기', 2, '하반기', 3) AS SORT_NO
  FROM BASE
 UNION ALL
SELECT TGT_YEAR
     , COL_3
     , '증감'                                          AS COL_2
     , SUM(CASE COL_2
                WHEN '하반기' THEN  WF_SALE_AMT
                WHEN '상반기' THEN -WF_SALE_AMT
                ELSE 0                                 -- 연간 제외
           END)
     * DECODE(COL_3, 'RANK', -1, 1)                    AS WF_SALE_AMT  -- RANK: 상반기 - 하반기 / 그 외: 하반기 - 상반기
     , 4                                               AS SORT_NO
  FROM BASE
 GROUP BY TGT_YEAR, COL_3
 ORDER BY TGT_YEAR, COL_3, SORT_NO


-- =====================================================================
-- [방법 2] 곱하기 대신 CASE 안에서 직접 나누기 (결과 동일)
-- =====================================================================

WITH BASE AS (
    SELECT SUBSTR(TGT_HALF, 1, 4) AS TGT_YEAR
         , COL_2
         , COL_3
         , WF_SALE_AMT
      FROM 테이블명
     WHERE TGT_HALF LIKE '2026%'
)
SELECT TGT_YEAR, COL_3, COL_2, WF_SALE_AMT
     , DECODE(COL_2, '연간', 1, '상반기', 2, '하반기', 3) AS SORT_NO
  FROM BASE
 UNION ALL
SELECT TGT_YEAR
     , COL_3
     , '증감'                                          AS COL_2
     , SUM(CASE WHEN COL_3 = 'RANK' THEN               -- RANK: 상반기 - 하반기
                     CASE COL_2 WHEN '상반기' THEN  WF_SALE_AMT
                                WHEN '하반기' THEN -WF_SALE_AMT
                                ELSE 0 END
                ELSE                                   -- 그 외: 하반기 - 상반기
                     CASE COL_2 WHEN '하반기' THEN  WF_SALE_AMT
                                WHEN '상반기' THEN -WF_SALE_AMT
                                ELSE 0 END
           END)                                        AS WF_SALE_AMT
     , 4                                               AS SORT_NO
  FROM BASE
 GROUP BY TGT_YEAR, COL_3
 ORDER BY TGT_YEAR, COL_3, SORT_NO
