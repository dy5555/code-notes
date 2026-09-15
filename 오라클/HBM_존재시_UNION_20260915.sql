-- A에 여러 CODE가 있어도 HBM 관련 CODE만 대상으로 비교
-- 예: A = HBM3, DDR5 / B = HBM3E, HBM4E, DDR5E
-- 결과: HBM3E

SELECT B.*
  FROM B
 WHERE B.CODE LIKE 'HBM%'
   AND EXISTS (
       SELECT 1
         FROM A
        WHERE A.CODE LIKE 'HBM%'
          AND B.CODE LIKE A.CODE || '%'
       )
;
