package com.dealership.model;

import jakarta.persistence.*;

@Entity
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String make;
    private String model;
    private String color;
    private int year;
    private int mileage;
    private double price;

    private String bodyType;
    private String fuelType;
    private String status;

}