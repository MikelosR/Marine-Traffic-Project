package com.seax.back.service;

import com.seax.back.model.Point;
import com.seax.back.model.User;
import com.seax.back.model.Zone;
import com.seax.back.repository.UserRepository;
import com.seax.back.repository.ZoneRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ZoneServiceTest {

    @Mock
    private ZoneRepository zoneRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ZoneService zoneService;

    private User user;
    private Zone zone;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");

        zone = new Zone();
        zone.setId(1L);
        zone.setUser(user);
        zone.setStartPoint(new Point(10, 20));
        zone.setEndPoint(new Point(30, 40));
        zone.setTypes(Set.of("Cargo"));
        zone.setStatus(Set.of(1));
        zone.setSpeedMax(20);
        zone.setSpeedMin(5);
    }

    @Test
    void createOrUpdateZone_shouldCreateNewZone_whenNoneExists() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(zoneRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(zoneRepository.save(any(Zone.class))).thenReturn(zone);

        Zone result = zoneService.createOrUpdateZone(zone, 1L);

        assertNotNull(result);
        assertEquals(user, result.getUser());
        verify(zoneRepository).save(zone);
    }

    @Test
    void createOrUpdateZone_shouldUpdateExistingZone() {
        Zone newZoneData = new Zone();
        newZoneData.setStartPoint(new Point(15, 25));
        newZoneData.setEndPoint(new Point(35, 45));
        newZoneData.setTypes(Set.of("Tanker"));
        newZoneData.setStatus(Set.of(2));
        newZoneData.setSpeedMax(25);
        newZoneData.setSpeedMin(10);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(zoneRepository.findByUserId(1L)).thenReturn(Optional.of(zone));
        when(zoneRepository.save(any(Zone.class))).thenAnswer(i -> i.getArgument(0));

        Zone result = zoneService.createOrUpdateZone(newZoneData, 1L);

        assertNotNull(result);
        assertEquals(15, result.getStartPoint().getLat());
        assertEquals("Tanker", result.getTypes().iterator().next());
        assertEquals(25, result.getSpeedMax());
        verify(zoneRepository).save(zone);
    }

    @Test
    void getZoneByUserId_shouldReturnZone_whenExists() {
        when(zoneRepository.findByUserId(1L)).thenReturn(Optional.of(zone));

        Optional<Zone> result = zoneService.getZoneByUserId(1L);

        assertTrue(result.isPresent());
        assertEquals(zone, result.get());
    }

    @Test
    void deleteZoneByUserId_shouldReturnTrue_whenZoneIsDeleted() {
        when(zoneRepository.findByUserId(1L)).thenReturn(Optional.of(zone));
        doNothing().when(zoneRepository).delete(zone);

        boolean result = zoneService.deleteZoneByUserId(1L);

        assertTrue(result);
        verify(zoneRepository).delete(zone);
    }
}
