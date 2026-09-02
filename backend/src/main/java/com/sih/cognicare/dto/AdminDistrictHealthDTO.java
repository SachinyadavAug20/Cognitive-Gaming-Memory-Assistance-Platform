package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDistrictHealthDTO {
    private String state;               // Assam, Meghalaya, Manipur, etc.
    private String district;            // Kamrup, Majuli, East Khasi Hills, etc.
    private int enrolledPatients;
    private int mciStageCount;
    private int moderateStageCount;
    private int ashaWorkersActive;
    private int activeKiosks;
    private double cognitiveAdherenceRate; // Percentage e.g. 91.5%
    private String primaryPhc;
}
