-- 하반기 WF_SALE_AMT - 상반기 WF_SALE_AMT (연도별)
-- SUBSTR(TGT_HALF, 6, 1) = '1' 이면 상반기, 아니면 하반기
-- 예) 하반기 500, 상반기 300 → -300 + 500 = 200

SELECT SUBSTR(TGT_HALF, 1, 4) AS TGT_YEAR
     , SUM(CASE WHEN SUBSTR(TGT_HALF, 6, 1) = '1' THEN -WF_SALE_AMT
                ELSE WF_SALE_AMT
           END) AS DIFF_SALE_AMT  -- 하반기 - 상반기
  FROM 테이블명
 WHERE TGT_HALF LIKE '2026%'      -- 특정 연도만 필요할 때 (인덱스 사용 가능)
 GROUP BY SUBSTR(TGT_HALF, 1, 4)
