package com.sih.cognicare.exception;

public class PatientNotFoundException extends RuntimeException {
    public PatientNotFoundException(Long patientId) {
        super("Patient not found: id=" + patientId);
    }
}