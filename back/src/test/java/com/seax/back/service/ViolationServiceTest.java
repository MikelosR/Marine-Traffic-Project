package com.seax.back.service;

import com.seax.back.model.*;
import com.seax.back.repository.VesselRepository;
import com.seax.back.repository.ViolationRepository;
import com.seax.back.repository.ZoneRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ViolationServiceTest {

    @Mock
    private VesselRepository vesselRepository;

    @Mock
    private ZoneRepository zoneRepository;

    @Mock
    private ViolationRepository violationRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ViolationService violationService;

    private Zone zone;
    private Vessel vesselInZoneWithViolation;
    private Vessel vesselInZoneWithoutViolation;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setId(1L);

        zone = new Zone();
        zone.setUser(user);
        zone.setStartPoint(new Point(0, 0));
        zone.setEndPoint(new Point(10, 10));
        zone.setSpeedMax(20);
        zone.setSpeedMin(5);
        zone.setTypes(Set.of("Cargo"));
        zone.setStatus(Set.of(0));

        vesselInZoneWithViolation = new Vessel();
        vesselInZoneWithViolation.setMmsi(12345L);
        vesselInZoneWithViolation.setName("Violator");
        vesselInZoneWithViolation.setLatitude(5.0);
        vesselInZoneWithViolation.setLongitude(5.0);
        vesselInZoneWithViolation.setSpeedOverGround(25.0); // Speed violation
        vesselInZoneWithViolation.setVesselType("Tanker"); // Type violation
        vesselInZoneWithViolation.setNavigationalStatus(1); // Status violation

        vesselInZoneWithoutViolation = new Vessel();
        vesselInZoneWithoutViolation.setMmsi(67890L);
        vesselInZoneWithoutViolation.setName("Compliant");
        vesselInZoneWithoutViolation.setLatitude(5.0);
        vesselInZoneWithoutViolation.setLongitude(5.0);
        vesselInZoneWithoutViolation.setSpeedOverGround(15.0);
        vesselInZoneWithoutViolation.setVesselType("Cargo");
        vesselInZoneWithoutViolation.setNavigationalStatus(0);
    }

    @Test
    void checkAllZonesAndVessels_shouldCreateViolations_whenVesselViolatesRules() {
        when(zoneRepository.findAll()).thenReturn(Collections.singletonList(zone));
        when(vesselRepository.findVesselsInBoundingBox(anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(Collections.singletonList(vesselInZoneWithViolation));

        violationService.checkAllZonesAndVessels();

        // Expect 3 violations: speed, type, and status
        verify(violationRepository, times(3)).save(any(Violation.class));
        verify(messagingTemplate, times(3)).convertAndSend(eq("/topic/violations/1"), any(Violation.class));
    }

    @Test
    void checkAllZonesAndVessels_shouldNotCreateViolations_whenVesselIsCompliant() {
        when(zoneRepository.findAll()).thenReturn(Collections.singletonList(zone));
        when(vesselRepository.findVesselsInBoundingBox(anyDouble(), anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(Collections.singletonList(vesselInZoneWithoutViolation));

        violationService.checkAllZonesAndVessels();

        verify(violationRepository, never()).save(any(Violation.class));
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
    }

}
