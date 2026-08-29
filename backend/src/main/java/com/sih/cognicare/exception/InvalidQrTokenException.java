package com.sih.cognicare.exception;

public class InvalidQrTokenException extends RuntimeException {
    public InvalidQrTokenException() {
        super("Invalid or inactive QR card token");
    }
}