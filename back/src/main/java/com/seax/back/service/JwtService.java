package com.seax.back.service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import org.springframework.stereotype.Service;

import java.util.Date;



@Service
public class JwtService {

    //Secret key for signing tokens (in production, use environment variable!)
    private final String SECRET_KEY = "mySecretKeyForSeaXMaritimePlatform2025ThisShouldBeEnoughIThink";
    //mathematical formula used to create signatures
    private final Algorithm algorithm = Algorithm.HMAC256(SECRET_KEY); //HMAC256 cryptographic algorithm (like SHA256, but for signatures)
    private final JWTVerifier verifier = JWT.require(algorithm).build();

    //Token expires in 24 hours
    private final static long EXPIRATION_TIME = 24 * 60 * 60 * 1000; //24 hours in milliseconds

    //Create a JWT token for a user
    public String createToken(Long userId, String email, String role) {
        Date expiration = new Date(System.currentTimeMillis() + EXPIRATION_TIME);
        //Payload
        return JWT.create()
                .withSubject(userId.toString())     //User ID as subject
                .withClaim("email", email)          //Add email to token
                .withClaim("role", role)            //Add role to token
                .withIssuedAt(new Date())           //When token was created
                .withExpiresAt(expiration)          //When token expires
                .sign(algorithm);                   //produces the complete JWT token string
    }


    //Extract user ID from token - MOST USED METHOD
    public Long getUserIdFromToken(String token) {
        try {
            //Remove "Bearer " prefix if present
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            DecodedJWT jwt = verifier.verify(token); //Split token: header.payload.signature
            //Get user ID
            String userIdStr = jwt.getSubject();
            return Long.parseLong(userIdStr);
        } catch (JWTVerificationException | NumberFormatException e) {
            System.err.println("Invalid token: " + e.getMessage());
            return null;
        }
    }

    //Check if token is valid and not expired
    public boolean isTokenValid(String token) {
        try {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7);
            }

            verifier.verify(token); //throw exception if invalid/expired
            return true;
        } catch (JWTVerificationException e) {
            System.err.println("Token validation failed: " + e.getMessage());
            return false;
        }
    }

    //Extract role from token - FOR VESSEL ENDPOINTS (isInFleet feature)
    public String getRoleFromToken(String token) {
        try {
            if (token.startsWith("Bearer ")) { token = token.substring(7); }

            DecodedJWT jwt = verifier.verify(token);
            return jwt.getClaim("role").asString();

        } catch (JWTVerificationException e) {
            return null;
        }
    }
}