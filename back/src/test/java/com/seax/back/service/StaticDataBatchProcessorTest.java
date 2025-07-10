package com.seax.back.service;

import com.seax.back.repository.VesselRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
public class StaticDataBatchProcessorTest {

    @Autowired
    private StaticDataBatchProcessor staticDataBatchProcessor;

    @Autowired
    private VesselRepository vesselRepository;

    @Test
    public void testLoadAllStaticData() {
        // Given
        // The database is clean (handled by the test profile)

        // When
        staticDataBatchProcessor.loadAllStaticData();

        // Then
        long vesselCount = vesselRepository.count();
        assertThat(vesselCount).isGreaterThan(0);

        // Verify a few specific vessels
        vesselRepository.findByMmsi(228000100L).ifPresent(vessel -> {
            assertThat(vessel.getName()).isEqualTo("ABEILLE BOURBON");
            assertThat(vessel.getVesselType()).isEqualTo("Tug");
            assertThat(vessel.getCountry()).isEqualTo("France");
        });

        vesselRepository.findByMmsi(247123456L).ifPresent(vessel -> {
            assertThat(vessel.getName()).isEqualTo("ITALIA");
            assertThat(vessel.getVesselType()).isEqualTo("Cargo");
            assertThat(vessel.getCountry()).isEqualTo("Italy");
        });
    }
}
