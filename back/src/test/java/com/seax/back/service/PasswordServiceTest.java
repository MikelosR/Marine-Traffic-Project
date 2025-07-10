package com.seax.back.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class PasswordServiceTest {

    private PasswordService passwordService;

    @BeforeEach
    void setUp() {
        passwordService = new PasswordService();
    }

    @Test
    void testHashAndVerifyPassword() {
        String plainPassword = "password123";
        String hashedPassword = passwordService.hashPassword(plainPassword);

        assertNotNull(hashedPassword);
        assertNotEquals(plainPassword, hashedPassword);

        assertTrue(passwordService.verifyPassword(plainPassword, hashedPassword));
        assertFalse(passwordService.verifyPassword("wrongpassword", hashedPassword));
    }
}
