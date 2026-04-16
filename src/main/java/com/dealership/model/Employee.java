package com.dealership.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private LocalDate hireDate;
    private LocalDate endDate;
    private double salary;
    private String phone;
    private String email;
    private boolean active;
}