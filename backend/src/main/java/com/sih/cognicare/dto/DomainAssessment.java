package com.sih.cognicare.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class DomainAssessment {

    @JsonProperty("needs_help")
    @JsonAlias({"needsHelp", "needs_help"})
    private boolean needsHelp;

    @JsonProperty("impairment_level")
    @JsonAlias({"impairmentLevel", "impairment_level"})
    private String impairmentLevel;

    @JsonProperty("score_pct")
    @JsonAlias({"scorePct", "score_pct"})
    private int scorePct;

    @JsonProperty("evidence")
    private String evidence;
}
