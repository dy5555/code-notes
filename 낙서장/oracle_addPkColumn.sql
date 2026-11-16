-- =====================================================================
-- 데이터가 있는 테이블에 PK 컬럼 추가 (기존 PK + 새 컬럼 = 복합 PK)
--  - 새 컬럼: NEW_COL VARCHAR2(50) DEFAULT '*'
--  - 기존 데이터에 모두 '*'가 들어가므로 새 컬럼 단독 PK는 불가 (중복)
-- =====================================================================

-- 1. 기존 PK 이름과 컬럼 확인
SELECT c.CONSTRAINT_NAME, cc.COLUMN_NAME, cc.POSITION
  FROM USER_CONSTRAINTS c
  JOIN USER_CONS_COLUMNS cc ON c.CONSTRAINT_NAME = cc.CONSTRAINT_NAME
 WHERE c.TABLE_NAME = 'A'
   AND c.CONSTRAINT_TYPE = 'P'
 ORDER BY cc.POSITION;

-- 1-1. 이 PK를 참조하는 FK 확인 (있으면 3번에서 에러 → FK 먼저 처리)
SELECT TABLE_NAME, CONSTRAINT_NAME
  FROM USER_CONSTRAINTS
 WHERE R_CONSTRAINT_NAME = 'PK_A';

-- 2. 컬럼 추가 (기존 행에는 '*'가 채워짐)
--    11g 이상: DEFAULT + NOT NULL은 메타데이터만 바뀌어서 데이터가 많아도 빠름
ALTER TABLE A ADD (NEW_COL VARCHAR2(50) DEFAULT '*' NOT NULL);

-- 3. 기존 PK 삭제 (인덱스도 같이 삭제)
--    3~4번 사이에는 PK가 없으므로 운영 DB라면 사용량이 적은 시간에 실행
ALTER TABLE A DROP CONSTRAINT PK_A DROP INDEX;

-- 4. 새 컬럼을 넣어서 PK 재생성
ALTER TABLE A ADD CONSTRAINT PK_A PRIMARY KEY (기존컬럼1, 기존컬럼2, NEW_COL);
