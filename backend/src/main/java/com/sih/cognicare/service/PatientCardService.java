package com.sih.cognicare.service;

import com.sih.cognicare.dto.GenerateCardResponse;
import com.sih.cognicare.dto.KioskScanResponse;
import com.sih.cognicare.dto.PatientProfileResponse;
import com.sih.cognicare.exception.InvalidQrTokenException;
import com.sih.cognicare.exception.PatientNotFoundException;
import com.sih.cognicare.model.Patient;
import com.sih.cognicare.model.PatientCard;
import com.sih.cognicare.repository.PatientCardRepository;
import com.sih.cognicare.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientCardService {

    private final PatientCardRepository patientCardRepository;
    private final PatientRepository patientRepository;
    private final JwtService jwtService;

    @Transactional
    public GenerateCardResponse generateCard(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        patientCardRepository.deactivateActiveCardsByPatientId(patientId);

        PatientCard card = PatientCard.builder()
                .patientId(patientId)
                .secureToken(UUID.randomUUID().toString())
                .isActive(true)
                .issuedAt(LocalDateTime.now())
                .build();
        patientCardRepository.save(card);

        return GenerateCardResponse.builder()
                .secureToken(card.getSecureToken())
                .patientId(patientId)
                .patientName(patient.getName())
                .issuedAt(card.getIssuedAt())
                .isActive(card.isActive())
                .build();
    }

    @Transactional(readOnly = true)
    public KioskScanResponse scan(String qrData) {
        PatientCard card = patientCardRepository
                .findTopBySecureTokenAndIsActiveTrue(qrData)
                .orElseThrow(InvalidQrTokenException::new);

        Patient patient = patientRepository.findById(card.getPatientId())
                .orElseThrow(() -> new PatientNotFoundException(card.getPatientId()));

        PatientProfileResponse profile = PatientProfileResponse.builder()
                .id(patient.getId())
                .name(patient.getName())
                .languagePreference(patient.getPreferredLanguage())
                .build();

        return KioskScanResponse.builder()
                .token(jwtService.generateToken(patient.getId()))
                .patient(profile)
                .build();
    }
}