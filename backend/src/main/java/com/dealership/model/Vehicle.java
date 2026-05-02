package com.dealership.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vin;
    private String make;
    private String model;
    private String trim;
    private String color;
    private int year;
    private int mileage;
    private double price;
    private String bodyType;
    private String fuelType;
    private String status;
    private String lot;
    private int daysOnLot;
}
