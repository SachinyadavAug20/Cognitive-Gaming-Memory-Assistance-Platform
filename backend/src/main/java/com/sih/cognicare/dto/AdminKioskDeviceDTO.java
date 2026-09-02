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
public class AdminKioskDeviceDTO {
    private String deviceId;
    private String villageLocation;
    private String state;
    private int batteryPct;
    private int cameraFps;
    private int storageFreeMb;
    private String firmwareVersion;
    private boolean isLowBandwidth2G;
    private int queuedPackets;
    private LocalDateTime lastHeartbeat;
    private String deviceHealth; // "OPTIMAL", "WARNING", "OFFLINE"
}
