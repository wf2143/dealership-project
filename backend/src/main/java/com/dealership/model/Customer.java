package com.dealership.model;

import jakarta.persistence.*;

@Entity
@Table(name = "customer",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = "phone"),
           @UniqueConstraint(columnNames = "email")
       })
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cust_id")
    private Long customerId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "phone", unique = true)
    private String phone;

    @Column(name = "email", unique = true)
    private String email;
    

    public Long getCustomerId(){ 
        return customerId; 
    }
    
    public void setCustomerId(Long id){ 
        this.customerId = id; 
    }

    public String getName(){ 
        return name;
    }

    public void setName(String name){ 
        this.name = name; 
    }

    public String getPhone(){ 
        return phone; 
    }

    public void setPhone(String phone){ 
        this.phone = phone; 
    }

    public String getEmail(){ 
        return email; 
    }

    public void setEmail(String email){ 
        this.email = email; 
    }
}