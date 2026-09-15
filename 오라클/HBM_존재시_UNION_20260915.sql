-- A 조회 결과에 CODE = 'HBM'이 존재할 경우
-- B에서 CODE가 'HBM%'인 데이터를 추가로 UNION

SELECT A.CODE
     , A.NAME
  FROM TABLE_A A

UNION

SELECT B.CODE
     , B.NAME
  FROM TABLE_B B
 WHERE B.CODE LIKE 'HBM%'
   AND EXISTS (
       SELECT 1
         FROM TABLE_A C
        WHERE C.CODE = 'HBM'
       )
;
