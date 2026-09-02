package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminEpidemiologicalSurveillanceDTO {
    private String state;
    private String stateCode;
    private long estimatedElderlyPopulation;
    private int screenedPatientsCount;
    private double mciPrevalencePct;
    private double dementiaPrevalencePct;
    private double earlyInterventionIndexPct;
    private String remoteTerrainBarrierIndex; // "EXTREME_HILL", "RIVERINE_ISLAND", "BORDER_TERRAIN", "ACCESSIBLE_VALLEY"
    private double offlineSyncDelayAvgHours;
    private int activeAshaUnits;
    private int highRiskWanderingFlagged;
    private List<String> sundowningAgitationHotspots;
}
