// =====================================================================
// AAA014 콤보 일괄 조회 - Controller / Service / Mapper
// - 화면 전용 UNION ALL 쿼리 1번 실행 (Mapper XML: 낙서장/mybatis_AAA014ComboList.xml)
// - 패키지명, URL은 프로젝트 규칙에 맞게 변경
// =====================================================================


// ---------------------------------------------------------------------
// AAA014Controller.java
// ---------------------------------------------------------------------
package com.xxx.aaa014;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AAA014Controller {

    private final AAA014Service aaa014Svc;

    /**
     * 콤보 목록 일괄 조회
     * @param param family: family 값, inclFamilyYn: 'Y'면 family 목록도 같이 조회
     * @return COMBO_TP, CD, NM, PRNT_CD 목록
     */
    @PostMapping("/aaa014/comboList")
    public List<Map<String, Object>> selectComboList(@RequestBody Map<String, Object> param) {
        return aaa014Svc.selectComboList(param);
    }
}


// ---------------------------------------------------------------------
// AAA014Service.java
// ---------------------------------------------------------------------
package com.xxx.aaa014;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AAA014Service {

    private final AAA014Mapper aaa014Mapper;

    public List<Map<String, Object>> selectComboList(Map<String, Object> param) {
        return aaa014Mapper.selectComboList(param);  // UNION ALL 쿼리 1번 실행
    }
}


// ---------------------------------------------------------------------
// AAA014Mapper.java
// ---------------------------------------------------------------------
package com.xxx.aaa014;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AAA014Mapper {

    // 콤보 일괄 조회 (family + a~h)
    List<Map<String, Object>> selectComboList(Map<String, Object> param);
}
