package r.pm.pla.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import r.pm.pla.dto.Pla048Dto;
import r.pm.pla.store.Pla048Store;

/**
 * PLA048 Service
 */
@Service
@RequiredArgsConstructor
public class Pla048Service {

    private final Pla048Store pla048Store;

    /**
     * S001 - 화면 최초 진입 시 최신 월/주차 조회
     */
    public Pla048Dto pla048Select(Pla048Dto dto) {
        return pla048Store.S001(dto);
    }
}
