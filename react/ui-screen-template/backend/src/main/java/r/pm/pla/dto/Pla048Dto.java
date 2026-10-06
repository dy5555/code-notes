package r.pm.pla.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * PLA048 조회조건/조회결과 DTO
 */
@Getter
@Setter
public class Pla048Dto {

    /** 재고조회 월 YYYYMM */
    private String stockMonth;

    /** 판매 Demand 주차 YYYYWW */
    private String salesDemandWeek;

    /** 수요 SOM 월 YYYYMM */
    private String somMonth;

    /** 판매실적 월 YYYYMM */
    private String salesResultMonth;

    /** 입고 Demand 주차 YYYYWW */
    private String inboundDemandWeek;
}
