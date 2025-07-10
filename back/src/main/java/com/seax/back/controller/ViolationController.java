package com.seax.back.controller;

import com.seax.back.service.ViolationService;
import com.seax.back.util.AuthHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/violations")
public class ViolationController {

    private final ViolationService violationService;
    private final AuthHelper authHelper;

    @Autowired
    public ViolationController(ViolationService violationService, AuthHelper authHelper) {
        this.violationService = violationService;
        this.authHelper = authHelper;
    }

}
