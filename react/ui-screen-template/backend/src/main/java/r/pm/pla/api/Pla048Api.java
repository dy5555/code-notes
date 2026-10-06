package r.pm.pla.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import r.pm.pla.dto.Pla048Dto;
import r.pm.pla.service.Pla048Service;

/**
 * PLA048 API
 * 실제 회사 package/import/공통 응답 타입에 맞게 경로만 조정해서 사용.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/r/pm/pla")
public class Pla048Api {

    private final Pla048Service pla048Service;

    /**
     * S001 - 화면 최초 진입 시 최신 월/주차 조회
     */
    @GetMapping("/pla04801")
    public Pla048Dto pla04801(Pla048Dto dto) {
        return pla048Service.pla048Select(dto);
    }
}
