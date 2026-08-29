package com.sih.cognicare.dto;

import jakarta.validation.constraints.NotBlank;

public record KioskScanRequest(
        @NotBlank(message = "qrData is required")
        String qrData
) {}