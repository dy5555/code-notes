package r.pm.pla.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.Setter;

/**
 * PLA048 조회조건/조회결과 DTO
 */
@Getter
@Setter
public class Pla048Dto {

    @Schema(description = "재고조회 월", hidden = true)
    private String stockMonth;

    @Schema(description = "판매 Demand 주차", hidden = true)
    private String salesDemandWeek;

    @Schema(description = "수요 SOM 월", hidden = true)
    private String somMonth;

    @Schema(description = "판매실적 월", hidden = true)
    private String salesResultMonth;

    @Schema(description = "입고 Demand 주차", hidden = true)
    private String inboundDemandWeek;
}
