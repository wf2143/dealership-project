package com.dealership.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "employee")
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Column(name = "end_date")
    private LocalDate endDate;          // NULL means still employed

    @Column(name = "salary", nullable = false)
    private double salary;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "active", nullable = false)
    private boolean active;


    public Long getId()                       { return id; }
    public void setId(Long id)                { this.id = id; }

    public String getName()                   { return name; }
    public void setName(String name)          { this.name = name; }

    public LocalDate getHireDate(){ 
        return hireDate; 
    
    }
    public void setHireDate(LocalDate d){ 
        this.hireDate = d; 
    }

    public LocalDate getEndDate(){ 
        return endDate; 
    }
    
    public void setEndDate(LocalDate d)       { this.endDate = d; }

    public double getSalary()                 { return salary; }
    public void setSalary(double salary)      { this.salary = salary; }

    public String getPhone()                  { return phone; }
    public void setPhone(String phone)        { this.phone = phone; }

    public String getEmail()                  { return email; }
    public void setEmail(String email)        { this.email = email; }

    public boolean isActive()                 { return active; }
    public void setActive(boolean active)     { this.active = active; }
}