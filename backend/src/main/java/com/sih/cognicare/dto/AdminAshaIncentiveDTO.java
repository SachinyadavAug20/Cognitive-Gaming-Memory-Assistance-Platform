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
public class AdminAshaIncentiveDTO {
    private String workerId;
    private String workerName;
    private String district;
    private String primaryPhc;
    private int screeningsCompleted;
    private int assistedGameSessions;
    private int totalIncentiveInr; // e.g. ₹3,400
    private String abhaLinkedBankMasked; // e.g. "SBI •••• 4092"
    private String disbursementStatus;  // "APPROVED", "PENDING_VERIFICATION", "DISBURSED"
    private LocalDateTime lastVerifiedAt;
}
