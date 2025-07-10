package com.seax.back.util;

import com.seax.back.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class AuthHelper {

    @Autowired
    private JwtService jwtService;
    
    //Helper method to reduce duplication
    private Long extractUserIdFromAuth(String authHeader) {
        if (authHeader != null && jwtService.isTokenValid(authHeader)) {
            return jwtService.getUserIdFromToken(authHeader);
        }
        return null;
    }


    //Helper method for authentication validation
    public ResponseEntity<?> validateAuthAndGetUserId(String authHeader) {
        if (authHeader == null || !jwtService.isTokenValid(authHeader)) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid or expired token"));
        }

        Long userId = jwtService.getUserIdFromToken(authHeader);
        if (userId == null) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Could not extract user from token"));
        }
        return null; //No error
    }

    //Helper method to get user ID directly (returns null if invalid)
    public Long getUserIdFromAuth(String authHeader) {
        if (authHeader == null || !jwtService.isTokenValid(authHeader)) {
            return null;
        }
        return jwtService.getUserIdFromToken(authHeader);
    }

    //Helper method to check if user is admin
    private boolean isAdminUser(String authHeader) {
        if (authHeader == null || !jwtService.isTokenValid(authHeader)) {
            return false;
        }

        String role = jwtService.getRoleFromToken(authHeader);
        return "ADMIN".equals(role);
    }
}