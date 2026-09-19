package com.sih.cognicare.security;

import com.sih.cognicare.exception.AuthenticationRequiredException;
import com.sih.cognicare.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Set;

/**
 * Bearer-token validator for protected API namespaces.
 * Paths not in the protected set are passed through without auth.
 */
@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {

    private static final String BEARER_PREFIX = "Bearer ";

    /** Paths that require a valid JWT. All other paths are public. */
    private static final Set<String> PROTECTED_PREFIXES = Set.of(
            "/api/v1/patients/",
            "/api/v1/admin/",
            "/api/v1/surveillance/",
            "/api/v1/ai/",
            "/api/v1/caregiver/",
            "/admin/"
    );

    private final JwtService jwtService;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();

        boolean needsAuth = PROTECTED_PREFIXES.stream().anyMatch(path::startsWith);
        if (!needsAuth) {
            return true;
        }

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            reject(response, "Missing or malformed Authorization header");
            return false;
        }

        String token = header.substring(BEARER_PREFIX.length());
        if (!jwtService.isValid(token)) {
            reject(response, "Invalid or expired token");
            return false;
        }

        return true;
    }

    private void reject(HttpServletResponse response, String message) {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        try {
            response.getWriter().write("{\"error\":\"" + message + "\"}");
        } catch (java.io.IOException ignored) {
        }
    }
}
