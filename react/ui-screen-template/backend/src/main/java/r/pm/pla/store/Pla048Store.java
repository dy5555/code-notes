package r.pm.pla.store;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import r.pm.pla.dto.Pla048Dto;

/**
 * PLA048 MyBatis Store
 */
@Mapper
public interface Pla048Store {

    /**
     * 화면 최초 진입 시 최신 월/주차 조회
     *
     * UNION ALL 결과가 여러 행이므로 Pla048Dto 한 건이 아니라
     * List<Pla048Dto>로 받는다.
     *
     * 각 행 예:
     * type   : stock_ym
     * code   : 202605
     * plnRev : ccc
     */
    List<Pla048Dto> S001(Pla048Dto dto);
}
