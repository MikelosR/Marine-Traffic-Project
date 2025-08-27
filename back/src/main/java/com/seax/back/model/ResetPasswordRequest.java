package com.seax.back.model;

import lombok.Data;

@Data
public class ResetPasswordRequest {

    private String currentPassword;
    private String newPassword;
}
