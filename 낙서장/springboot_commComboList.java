// =====================================================================
// 콤보 일괄 조회 (aaa014) - Controller / Service / Mapper
// - 프론트에서 콤보 정의 배열(COMBO_DEFS)을 보내면 쿼리 1번으로 조회
// - Mapper XML: 낙서장/mybatis_commComboList_foreach.xml 의 selectCommComboList
// - 패키지명, URL은 프로젝트 규칙에 맞게 변경
// =====================================================================


// ---------------------------------------------------------------------
// Aaa014Controller.java
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
public class Aaa014Controller {

    private final Aaa014Service aaa014Svc;

    /**
     * 콤보 목록 일괄 조회
     * @param comboDefs 콤보 정의 목록 (FAMILY, A ~ H)
     * @return COMBO_TP, CD, NM, PRNT_CD 목록
     */
    @PostMapping("/aaa014/comboList")
    public List<Map<String, Object>> selectComboList(@RequestBody List<Map<String, Object>> comboDefs) {
        return aaa014Svc.selectComboList(comboDefs);
    }
}


// ---------------------------------------------------------------------
// Aaa014Service.java
// ---------------------------------------------------------------------
package com.xxx.aaa014;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.xxx.comm.CommComboMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class Aaa014Service {

    private final CommComboMapper commComboMapper;

    public List<Map<String, Object>> selectComboList(List<Map<String, Object>> comboDefs) {
        // 정의가 비어 있으면 foreach가 빈 SQL을 만들어 에러가 나므로 미리 차단
        if (comboDefs == null || comboDefs.isEmpty()) {
            return Collections.emptyList();
        }
        return commComboMapper.selectCommComboList(comboDefs);  // UNION ALL 쿼리 1번 실행
    }
}


// ---------------------------------------------------------------------
// CommComboMapper.java
// ---------------------------------------------------------------------
package com.xxx.comm;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CommComboMapper {

    // [기존] 콤보 1개 조회 - 다른 화면에서 사용 중
    List<Map<String, Object>> selectCommCombo(Map<String, Object> comboDef);

    // [신규] 콤보 여러 개 일괄 조회
    List<Map<String, Object>> selectCommComboList(List<Map<String, Object>> comboDefs);
}
