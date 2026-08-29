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
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PatientCardService {

    private final PatientCardRepository patientCardRepository;
    private final PatientRepository patientRepository;
    private final JwtService jwtService;

    @Transactional
    public GenerateCardResponse getCard(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        return patientCardRepository.findTopByPatientIdAndIsActiveTrue(patientId)
                .map(card -> toResponse(patient, card))
                .orElseGet(() -> generateCard(patientId));
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public GenerateCardResponse generateCard(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new PatientNotFoundException(patientId));

        List<PatientCard> activeCards =
                patientCardRepository.findAllByPatientIdAndIsActiveTrue(patientId);
        for (PatientCard card : activeCards) {
            card.setActive(false);
        }
        patientCardRepository.saveAll(activeCards);

        PatientCard card = PatientCard.builder()
                .patientId(patientId)
                .secureToken(UUID.randomUUID().toString())
                .isActive(true)
                .issuedAt(LocalDateTime.now())
                .build();
        patientCardRepository.save(card);

        return toResponse(patient, card);
    }

    private GenerateCardResponse toResponse(Patient patient, PatientCard card) {
        return GenerateCardResponse.builder()
                .secureToken(card.getSecureToken())
                .patientId(patient.getId())
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