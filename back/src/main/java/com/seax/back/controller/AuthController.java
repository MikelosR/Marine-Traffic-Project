package com.seax.back.controller;

import com.seax.back.model.*;
import com.seax.back.repository.UserRepository;
import com.seax.back.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.seax.back.service.PasswordService;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final UserRepository userRepository;

    private final JwtService jwtService;

    private final PasswordService passwordService;

    public AuthController(UserRepository userRepository, JwtService jwtService, PasswordService passwordService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordService = passwordService;
    }

    //POST /api/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail());

        if (user != null && passwordService.verifyPassword(request.getPassword(), user.getPassword())) {
            String token = jwtService.createToken(user.getId(), user.getEmail(), user.getRole());
            LoginResponse response = new LoginResponse("success", user.getRole(), token);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }

    //POST /api/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        User existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser != null) {
            return ResponseEntity.status(400).body("Email already exists");
        }

        User newUser = new User();
        newUser.setFirstName(request.getFirstName());
        newUser.setLastName(request.getLastName());
        newUser.setEmail(request.getEmail());
        newUser.setPassword(passwordService.hashPassword(request.getPassword()));
        newUser.setRole("USER");

        User savedUser = userRepository.save(newUser);
        String token = jwtService.createToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole());

        RegisterResponse response = new RegisterResponse("User created successfully", token);
        return ResponseEntity.ok(response);
    }

    //GET /api/user/me
    @GetMapping("/user/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        // Use helper method to get authenticated user
        User user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(401).body("Authorization token required or invalid");
        }

        UserResponse response = new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole()
        );
        return ResponseEntity.ok(response);
    }

    //POST /api/reset-password
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                           @RequestBody ResetPasswordRequest request) {
        //Use helper method to get authenticated user
        User user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(401).body("Authorization token required or invalid");
        }

        if (passwordService.verifyPassword(request.getCurrentPassword(), user.getPassword())) {
            user.setPassword(passwordService.hashPassword(request.getNewPassword()));
            userRepository.save(user);
            return ResponseEntity.ok("Password updated successfully");
        } else {
            return ResponseEntity.status(400).body("Current password is incorrect");
        }
    }

    //DELETE /api/user
    @DeleteMapping("/user")
    public ResponseEntity<?> deleteUser(@RequestHeader(value = "Authorization", required = false) String authHeader,
                                        @RequestParam String confirmPassword) {
        //Use helper method to get authenticated user
        User user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(401).body("Authorization token required or invalid");
        }

        if (passwordService.verifyPassword(confirmPassword, user.getPassword())) {
            userRepository.delete(user);
            return ResponseEntity.ok("User deleted successfully");
        } else {
            return ResponseEntity.status(400).body("Invalid password");
        }
    }

    //HELPER METHOD
    private User getAuthenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }

        Long userId = jwtService.getUserIdFromToken(authHeader);
        if (userId == null) {
            return null;
        }

        return userRepository.findById(userId).orElse(null);
    }
}