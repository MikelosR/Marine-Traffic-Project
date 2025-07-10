package com.seax.back.service;

import com.seax.back.repository.VesselRepository;
import com.seax.back.repository.VesselPositionHistoryRepository;
import com.seax.back.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TableCleanupService {

    private final VesselRepository vesselRepository;

    private final VesselPositionHistoryRepository positionHistoryRepository;

    private final UserRepository userRepository;

    public TableCleanupService(VesselRepository vesselRepository, VesselPositionHistoryRepository positionHistoryRepository, UserRepository userRepository) {
        this.vesselRepository = vesselRepository;
        this.positionHistoryRepository = positionHistoryRepository;
        this.userRepository = userRepository;
    }

    //🗑️Clean position history table
    @Transactional
    public void cleanPositionHistoryTable() {
        try {
            long count = positionHistoryRepository.count();
            positionHistoryRepository.deleteAll();
            System.out.println("️🗑️ Cleaned vessel_position_history table: " + count + " records deleted xx");
        } catch (Exception e) {
            System.err.println("ERROR cleaning position history table: " + e.getMessage());
        }
    }

    //🗑️Clean vessels table
    @Transactional
    public void cleanVesselsTable() {
        try {
            long count = vesselRepository.count();
            vesselRepository.deleteAll();
            System.out.println("🗑️ Cleaned vessels table: " + count + " records deleted");
        } catch (Exception e) {
            System.err.println("ERROR cleaning vessels table: " + e.getMessage());
        }
    }

    //🗑️Clean users table
    @Transactional
    public void cleanUsersTable() {
        try {
            long count = userRepository.count();
            userRepository.deleteAll();
            System.out.println("🗑️ Cleaned users table: " + count + " records deleted");
        } catch (Exception e) {
            System.err.println("ERROR cleaning users table: " + e.getMessage());
        }
    }

    //Master cleanup method - call individual methods as needed
    public void cleanAllTables() {
        System.out.println("🧹 CLEANING ALL TABLES...");

        //Clean position history
        cleanPositionHistoryTable();

        //Clean vessels
        cleanVesselsTable();

        //Clean users (COMMENT THIS LINE IF YOU DON'T WANT TO CLEAN USERS)
        //cleanUsersTable();
        System.out.println(" :) Table cleanup complete! :) ");
    }
}