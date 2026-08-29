package com.sih.cognicare.exception;

public class AuthenticationRequiredException extends RuntimeException {
    public AuthenticationRequiredException() {
        super("Missing, invalid, or expired access token");
    }
}