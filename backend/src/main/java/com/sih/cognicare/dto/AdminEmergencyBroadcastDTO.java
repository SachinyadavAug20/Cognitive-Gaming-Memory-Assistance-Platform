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
public class AdminEmergencyBroadcastDTO {
    private String broadcastId;
    private String targetState;        // "Assam", "Meghalaya", "All NER"
    private String targetDistrict;     // "Majuli", "East Khasi Hills", "All"
    private String alertCategory;      // "FLOOD_MONSOON_WANDERING", "LANDSLIDE_POWER_OUTAGE", "EXTREME_COLD_WEATHER"
    private String language;           // "as", "kha", "mni", "hi", "en"
    private String messageText;
    private int recipientsDelivered;
    private LocalDateTime dispatchedAt;
    private String dispatchStatus;     // "DELIVERED", "BROADCASTING", "QUEUED"
}
