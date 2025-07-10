package com.seax.back.controller;

import com.seax.back.model.AisData;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class AisWebSocketController {
    private final SimpMessagingTemplate template;
    @Autowired
    public AisWebSocketController(SimpMessagingTemplate template) {
        this.template = template;
    }
    public void sendAisUpdate(AisData data) {
        template.convertAndSend("/topic/ais-data", data);
    }
}