package com.seax.back.service;

import com.seax.back.model.User;
import com.seax.back.model.Vessel;
import com.seax.back.model.VesselPositionHistory;
import com.seax.back.repository.UserRepository;
import com.seax.back.repository.VesselPositionHistoryRepository;
import com.seax.back.repository.VesselRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VesselServiceTest {

    @Mock
    private VesselRepository vesselRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VesselPositionHistoryRepository positionHistoryRepository;

    @InjectMocks
    private VesselService vesselService;

    private Vessel vessel;
    private User user;

    @BeforeEach
    void setUp() {
        vessel = new Vessel();
        vessel.setMmsi(123456789L);
        vessel.setName("Test Vessel");

        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
    }

    @Test
    void testGetVesselByMmsi() {
        when(vesselRepository.findByMmsi(123456789L)).thenReturn(Optional.of(vessel));

        Optional<Vessel> result = vesselService.getVesselByMmsi(123456789L);

        assertTrue(result.isPresent());
        assertEquals("Test Vessel", result.get().getName());
    }

    @Test
    void testGetAllVessels() {
        when(vesselRepository.findAllOrderByName()).thenReturn(List.of(vessel));

        List<Vessel> result = vesselService.getAllVessels();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals("Test Vessel", result.get(0).getName());
    }

    @Test
    void testAddVesselToFleet() {
        when(vesselRepository.findByMmsi(123456789L)).thenReturn(Optional.of(vessel));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        boolean result = vesselService.addVesselToFleet(123456789L, 1L);

        assertTrue(result);
        assertTrue(user.getFleetVessels().contains(vessel));
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testRemoveVesselFromFleet() {
        user.addVesselToFleet(vessel);
        when(vesselRepository.findByMmsi(123456789L)).thenReturn(Optional.of(vessel));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        boolean result = vesselService.removeVesselFromFleet(123456789L, 1L);

        assertTrue(result);
        assertFalse(user.getFleetVessels().contains(vessel));
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testIsVesselInUserFleet() {
        user.addVesselToFleet(vessel);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        boolean result = vesselService.isVesselInUserFleet(123456789L, 1L);

        assertTrue(result);
    }

    @Test
    void testGetVesselTrack() {
        vessel.setTimestamp(System.currentTimeMillis() / 1000L);
        when(vesselRepository.findByMmsi(123456789L)).thenReturn(Optional.of(vessel));
        when(positionHistoryRepository.findByMmsiAndTimestampAfter(anyLong(), anyLong()))
                .thenReturn(List.of(new VesselPositionHistory()));

        List<VesselPositionHistory> result = vesselService.getVesselTrack(123456789L);

        assertFalse(result.isEmpty());
    }
}
