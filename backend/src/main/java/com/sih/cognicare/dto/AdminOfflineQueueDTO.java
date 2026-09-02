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
public class AdminOfflineQueueDTO {
    private int pendingSyncPackets;
    private int synchronizedToday;
    private boolean lowBandwidthMode;
    private String networkType;          // "2G Edge", "3G Hills", "Broadband PHC"
    private double dataSavedPct;         // e.g. 64.2% data compression
    private LocalDateTime lastBatchSync;
    private String syncStatus;           // "SYNCHRONIZED", "QUEUED", "PENDING_RETRY"
}
