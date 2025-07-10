
package com.seax.back.producer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.CSVReader;
import com.seax.back.model.AisData;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

@Component
public class CsvProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    //Jackson is a Java library for converting between: Java Objects ⇄ JSON
    private final ObjectMapper mapper;
    private static final long PROCESSING_BUFFER_MS = 50;

    public CsvProducer(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper mapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.mapper = mapper;
    }

    public void produceCsvData() {
        //Loads the file nari_dynamic.csv from the resources/ folder
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("nari_dynamic.csv");
             BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(is), 65536);
             CSVReader reader = new CSVReader(bufferedReader)) {

            if (is == null) {
                System.err.println("XXX CSV file NOT found. XXX");
                return;
            }

            reader.readNext(); //Skip header
            String[] nextLine;
            long lastTimestamp = -1;

            while ((nextLine = reader.readNext()) != null) {
                try {
                    //Check if row has enough columns
                    if (nextLine.length < 9) {
                        System.err.println("XXX Skipping row - not enough columns: " + String.join(",", nextLine) + " XXX");
                        continue;
                    }

                    AisData data = new AisData(
                            Long.parseLong(nextLine[0]),
                            Integer.parseInt(nextLine[1]),
                            Integer.parseInt(nextLine[2]),
                            Double.parseDouble(nextLine[3]),
                            Double.parseDouble(nextLine[4]),
                            Integer.parseInt(nextLine[5]),
                            Double.parseDouble(nextLine[6]),
                            Double.parseDouble(nextLine[7]),
                            Long.parseLong(nextLine[8])
                    );

                    long currentTimestamp = data.getTimestamp();
                    if (lastTimestamp != -1) {
                        long delta = currentTimestamp - lastTimestamp;
                        long sleepTimeMs = (delta * 1000) - PROCESSING_BUFFER_MS;

                        if (delta > 0 && sleepTimeMs > 0) {
                            Thread.sleep(sleepTimeMs);
                        }
                    }

                    String json = mapper.writeValueAsString(data);
                    //null means we’re not using a key
                    kafkaTemplate.send(new ProducerRecord<>("ais-data", null, json));
                    System.out.println(":) Sent: " + json + " :)");
                    lastTimestamp = currentTimestamp;

                } catch (NumberFormatException e) {
                    //Handle bad number format gracefully
                    System.err.println("XXX Skipping row - invalid number format: " + String.join(",", nextLine));
                } catch (Exception e) {
                    //Handle any other errors gracefully
                    System.err.println("XXX Skipping row - unexpected error: " + String.join(",", nextLine));
                    e.printStackTrace();
                }
            }
        }
        //Java automatically calls file.close() even if exception happens. (try())
        catch (Exception e) {
            e.printStackTrace();
        }
    }
}
