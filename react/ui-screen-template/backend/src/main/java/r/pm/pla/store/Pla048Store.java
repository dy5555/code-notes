package r.pm.pla.store;

import org.apache.ibatis.annotations.Mapper;

import r.pm.pla.dto.Pla048Dto;

/**
 * PLA048 MyBatis Store
 */
@Mapper
public interface Pla048Store {

    /**
     * 화면 최초 진입 시 최신 월/주차 조회
     * Pla048Mapper.xml의 S001과 연결된다.
     */
    Pla048Dto S001(Pla048Dto dto);
}
