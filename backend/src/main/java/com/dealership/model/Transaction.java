package com.dealership.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "transaction")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long transactionId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "amount", nullable = false)
    private double amount;

    // e.g. 'cash', 'credit', 'finance'
    @Column(name = "payment_type")
    private String paymentType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    // ── Getters & Setters ─────────────────────────────────────

    public Long getTransactionId()                  { return transactionId; }
    public void setTransactionId(Long id)           { this.transactionId = id; }

    public LocalDate getDate()                      { return date; }
    public void setDate(LocalDate date)             { this.date = date; }

    public double getAmount()                       { return amount; }
    public void setAmount(double amount)            { this.amount = amount; }

    public String getPaymentType()                  { return paymentType; }
    public void setPaymentType(String paymentType)  { this.paymentType = paymentType; }

    public Customer getCustomer()                   { return customer; }
    public void setCustomer(Customer customer)      { this.customer = customer; }

    public Vehicle getVehicle()                     { return vehicle; }
    public void setVehicle(Vehicle vehicle)         { this.vehicle = vehicle; }
}