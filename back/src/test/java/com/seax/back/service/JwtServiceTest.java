package com.seax.back.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
    }

    @Test
    void testCreateAndValidateToken() {
        Long userId = 1L;
        String email = "test@example.com";
        String role = "USER";

        String token = jwtService.createToken(userId, email, role);
        assertNotNull(token);

        assertTrue(jwtService.isTokenValid(token));
        assertEquals(userId, jwtService.getUserIdFromToken(token));
        assertEquals(role, jwtService.getRoleFromToken(token));
    }

    @Test
    void testInvalidToken() {
        String invalidToken = "invalid.token.string";
        assertFalse(jwtService.isTokenValid(invalidToken));
        assertNull(jwtService.getUserIdFromToken(invalidToken));
        assertNull(jwtService.getRoleFromToken(invalidToken));
    }

    @Test
    void testTokenWithBearerPrefix() {
        Long userId = 2L;
        String email = "user@test.com";
        String role = "ADMIN";

        String token = jwtService.createToken(userId, email, role);
        String bearerToken = "Bearer " + token;

        assertTrue(jwtService.isTokenValid(bearerToken));
        assertEquals(userId, jwtService.getUserIdFromToken(bearerToken));
        assertEquals(role, jwtService.getRoleFromToken(bearerToken));
    }
}
