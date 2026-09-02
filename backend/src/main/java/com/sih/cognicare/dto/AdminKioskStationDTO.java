package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminKioskStationDTO {
    private String kioskId;
    private String stationName;
    private String locationDistrict;
    private String state;
    private String status; // "ONLINE", "IDLE", "OFFLINE"
    private int scansToday;
    private LocalDateTime lastPingAt;
}
