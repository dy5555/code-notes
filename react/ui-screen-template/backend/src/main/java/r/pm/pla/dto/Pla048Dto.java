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

    // S001 조회 결과의 구분값
    // 예: stock_ym
    @Schema(description = "구분", hidden = true)
    private String type;

    // type에 해당하는 실제 월/주차 값
    // 예: 202605
    @Schema(description = "월/주차 코드", hidden = true)
    private String code;

    // PLN Revision 값
    // 예: ccc
    @Schema(description = "PLN Revision", hidden = true)
    private String plnRev;
}
