package com.sih.cognicare.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
    }

    @Test
    @DisplayName("Should generate a valid 3-part HS256 JWT token for a given patient subject ID")
    void testGenerateToken() {
        Long patientId = 42L;
        String token = jwtService.generateToken(patientId);

        assertNotNull(token);
        String[] parts = token.split("\\.");
        assertEquals(3, parts.length, "JWT must contain header, payload, and signature");

        // Decode payload and verify subject
        String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
        assertTrue(payloadJson.contains("\"sub\":\"42\""), "Payload must contain the patient subject ID");
        assertTrue(payloadJson.contains("\"exp\":"), "Payload must contain the expiration timestamp");
        assertTrue(payloadJson.contains("\"iat\":"), "Payload must contain the issued-at timestamp");
    }

    @Test
    @DisplayName("Should validate freshly generated token as true")
    void testTokenValiditySuccess() {
        String token = jwtService.generateToken(101L);
        assertTrue(jwtService.isValid(token), "Freshly generated token must be valid");
    }

    @Test
    @DisplayName("Should reject tampered payload")
    void testTamperedPayloadFailsValidation() {
        String token = jwtService.generateToken(101L);
        String[] parts = token.split("\\.");

        // Tamper with payload
        String tamperedPayload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString("{\"sub\":\"999\",\"exp\":9999999999}".getBytes(StandardCharsets.UTF_8));
        String tamperedToken = parts[0] + "." + tamperedPayload + "." + parts[2];

        assertFalse(jwtService.isValid(tamperedToken), "Tampered token must fail signature verification");
    }

    @Test
    @DisplayName("Should reject tampered signature")
    void testTamperedSignatureFailsValidation() {
        String token = jwtService.generateToken(101L);
        String[] parts = token.split("\\.");

        String invalidSignature = parts[2] + "corrupted";
        String tamperedToken = parts[0] + "." + parts[1] + "." + invalidSignature;

        assertFalse(jwtService.isValid(tamperedToken), "Corrupted signature must be rejected");
    }

    @Test
    @DisplayName("Should reject malformed or null tokens safely without exceptions")
    void testMalformedTokens() {
        assertFalse(jwtService.isValid(null));
        assertFalse(jwtService.isValid(""));
        assertFalse(jwtService.isValid("singletokenwithnodots"));
        assertFalse(jwtService.isValid("part1.part2"));
        assertFalse(jwtService.isValid("part1.part2.part3.part4"));
        assertFalse(jwtService.isValid(".."));
    }

    @Test
    @DisplayName("Should reject expired tokens")
    void testExpiredToken() {
        // Construct a token with an expiration timestamp in the past
        long pastExp = (System.currentTimeMillis() / 1000) - 3600; // 1 hour ago
        String header = Base64.getUrlEncoder().withoutPadding().encodeToString("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
        String payload = Base64.getUrlEncoder().withoutPadding().encodeToString(("{\"sub\":\"101\",\"exp\":" + pastExp + "}").getBytes(StandardCharsets.UTF_8));

        // Even with whatever signature or fake signature, expired check must fail
        String expiredToken = header + "." + payload + ".fakesig";
        assertFalse(jwtService.isValid(expiredToken), "Expired token must be rejected");
    }
}
