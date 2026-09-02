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
public class AdminAuditLogDTO {
    private String id;
    private String actorRole;     // "ASHA_WORKER", "PHC_PHYSICIAN", "ADMIN_SUPERVISOR", "KIOSK_AUTOMATION"
    private String actorName;
    private String actionType;    // "VIEW_RECORD", "REISSUE_QR", "TELE_MANAS_SCHEDULE", "CALIBRATE_AI", "EXPORT_AUDIT"
    private Long targetPatientId;
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp;
}
