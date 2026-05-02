package com.dealership.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private String username;

    @JsonIgnore
    private String password;

    private String role;
    private String email;
    private String phone;
    private LocalDate hireDate;
    private LocalDate endDate;
    private double salary;
    private boolean active;
}