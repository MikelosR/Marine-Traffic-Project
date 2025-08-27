package com.seax.back.model;

import jakarta.persistence.Embeddable;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Embeddable //JPA annotation that tells Hibernate that this class is not a separate entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Point {
    private long lat;
    private long lon;
}
