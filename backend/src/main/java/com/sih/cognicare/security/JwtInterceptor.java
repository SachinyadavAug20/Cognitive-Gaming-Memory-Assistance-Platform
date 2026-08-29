package com.sih.cognicare.security;

import com.sih.cognicare.exception.AuthenticationRequiredException;
import com.sih.cognicare.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Lightweight Bearer-token validator for the kiosk/patient namespace
 * ({@code /api/v1/patients/**}). No Spring Security is wired up yet, so this
 * interceptor keeps the hackathon contract honest:
 *
 * <ul>
 *   <li>a present, signature-and-expiry-valid {@code Authorization: Bearer}
 *       token is accepted;</li>
 *   <li>a present but invalid/expired token is rejected with HTTP 401;</li>
 *   <li>an absent header is still allowed for now, because every live patient
 *       route today is shared with the caregiver app (profile, family, places,
 *       medical-profile, onboard, analyze-pdf) which has no token yet. Flip to
 *       fail-closed once dedicated patient-session endpoints exist.</li>
 * </ul>
 */
@Component
@RequiredArgsConstructor
public class JwtInterceptor implements HandlerInterceptor {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null) {
            return true;
        }
        if (!header.startsWith(BEARER_PREFIX)) {
            throw new AuthenticationRequiredException();
        }

        String token = header.substring(BEARER_PREFIX.length());
        if (!jwtService.isValid(token)) {
            throw new AuthenticationRequiredException();
        }
        return true;
    }
}