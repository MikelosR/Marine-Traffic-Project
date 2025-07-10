package com.seax.back;

import com.seax.back.producer.CsvProducer;
import com.seax.back.service.StaticDataBatchProcessor;
import com.seax.back.service.TableCleanupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@EnableScheduling
public class BackApplication implements CommandLineRunner {

	@Autowired
	private CsvProducer csvProducer;

	@Autowired
	private TableCleanupService tableCleanupService;
	@Autowired
	StaticDataBatchProcessor staticDataBatchProcessor;

	public static void main(String[] args) {
		SpringApplication.run(BackApplication.class, args);
	}

	@Override
	public void run(String... args) {
		System.out.println("🚀 SeaX Maritime Surveillance System Starting...");
		//🧹STEP 0: Clean tables before starting
		tableCleanupService.cleanAllTables();
		//PHASE 1: Load complete static vessel database
		try {
			staticDataBatchProcessor.loadAllStaticData();
			System.out.println(":) Static vessel database ready!");
		} catch (Exception e) {
			System.err.println("CRITICAL ERROR: Failed to load static vessel data");
			System.exit(1);
		}

		//PHASE 2: Start dynamic streaming
		System.out.println("PHASE 2: Starting Dynamic AIS Stream");
		new Thread(() -> {
			csvProducer.produceCsvData();
		}).start();

		System.out.println(":) Maritime surveillance system ready!");
	}
}
