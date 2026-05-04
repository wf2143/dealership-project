package com.dealership.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "vehicle")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "vin", unique = true)
    private String vin;

    @Column(name = "make", nullable = false)
    private String make;

    @Column(name = "model", nullable = false)
    private String model;

    @Column(name = "trim")
    private String trim;

    @Column(name = "color")
    private String color;

    @Column(name = "year", nullable = false)
    private int year;

    @Column(name = "mileage", nullable = false)
    private int mileage;

    @Column(name = "price", nullable = false)
    private double price;

    @Column(name = "body_type")
    private String bodyType;

    @Column(name = "fuel_type")
    private String fuelType;

    @Column(name = "status", nullable = false)
    private String status = "available";

    @Column(name = "lot")
    private String lot;

    @Column(name = "add_date", updatable = false)
    private LocalDate addDate;

    @Column(name = "change_date")
    private LocalDate changeDate;

    @PrePersist
    protected void onCreate() {
        this.addDate    = LocalDate.now();
        this.changeDate = LocalDate.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.changeDate = LocalDate.now();
    }

    public Long getId()                       { return id; }
    public void setId(Long id)                { this.id = id; }

    public String getVin()                    { return vin; }
    public void setVin(String vin)            { this.vin = vin; }

    public String getMake()                   { return make; }
    public void setMake(String make)          { this.make = make; }

    public String getModel()                  { return model; }
    public void setModel(String model)        { this.model = model; }

    public String getTrim()                   { return trim; }
    public void setTrim(String trim)          { this.trim = trim; }

    public String getColor()                  { return color; }
    public void setColor(String color)        { this.color = color; }

    public int getYear()                      { return year; }
    public void setYear(int year)             { this.year = year; }

    public int getMileage()                   { return mileage; }
    public void setMileage(int mileage)       { this.mileage = mileage; }

    public double getPrice()                  { return price; }
    public void setPrice(double price)        { this.price = price; }

    public String getBodyType()               { return bodyType; }
    public void setBodyType(String bodyType)  { this.bodyType = bodyType; }

    public String getFuelType()               { return fuelType; }
    public void setFuelType(String fuelType)  { this.fuelType = fuelType; }

    public String getStatus()                 { return status; }
    public void setStatus(String status)      { this.status = status; }

    public String getLot()                    { return lot; }
    public void setLot(String lot)            { this.lot = lot; }

    public LocalDate getAddDate()             { return addDate; }
    public void setAddDate(LocalDate d)       { this.addDate = d; }

    public LocalDate getChangeDate()          { return changeDate; }
    public void setChangeDate(LocalDate d)    { this.changeDate = d; }
}
