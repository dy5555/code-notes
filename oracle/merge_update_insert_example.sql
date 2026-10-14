-- 3개 조건이 일치하면 UPDATE, 없으면 INSERT
-- CRT_YM이 YYYYMM 문자 컬럼이라면 TO_CHAR(SYSDATE, 'YYYYMM') 사용
MERGE INTO TABLE_NAME A
USING (
    SELECT :PLNREV        AS PLNREV
         , :PROD_GRP_CD   AS PROD_GRP_CD
         , :TGT_MM_GBN_CD AS TGT_MM_GBN_CD
      FROM DUAL
) B
ON (
       A.PLNREV        = B.PLNREV
   AND A.PROD_GRP_CD   = B.PROD_GRP_CD
   AND A.TGT_MM_GBN_CD = B.TGT_MM_GBN_CD
)
WHEN MATCHED THEN
    UPDATE SET
           A.ADJUST_RATIO = '50'
         , A.ABS_YN       = 'Y'
         , A.USE_YN       = 'N'
         , A.CHG_TM       = SYSDATE
         , A.CHGUSER_ID   = 'aaaa'
WHEN NOT MATCHED THEN
    INSERT (
           PLNREV
         , PROD_GRP_CD
         , TGT_MM_GBN_CD
         , ADJUST_RATIO
         , ABS_YN
         , USE_YN
         , CRT_YM
         , CRT_USER_ID
    )
    VALUES (
           B.PLNREV
         , B.PROD_GRP_CD
         , B.TGT_MM_GBN_CD
         , '50'
         , 'Y'
         , 'N'
         , SYSDATE
         , 'aaaa'
    );
