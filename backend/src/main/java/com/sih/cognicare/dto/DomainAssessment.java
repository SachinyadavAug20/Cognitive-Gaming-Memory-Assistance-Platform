package com.sih.cognicare.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DomainAssessment {
    private boolean needsHelp;
    private String evidence;
}
