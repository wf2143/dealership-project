package com.dealership.model;

import jakarta.persistence.*;

@Entity
@Table(name = "app_user",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = "username"),
           @UniqueConstraint(columnNames = "email")
       })
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "username", nullable = false, unique = true)
    private String username;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "role")
    private String role;

    @Column(name = "employee_id")
    private String employeeId;

    @Column(name = "start_date")
    private String startDate;

    public Long getId()                         { return id; }
    public void setId(Long id)                  { this.id = id; }

    public String getFirstName()                { return firstName; }
    public void setFirstName(String firstName)  { this.firstName = firstName; }

    public String getLastName()                 { return lastName; }
    public void setLastName(String lastName)    { this.lastName = lastName; }

    public String getUsername()                 { return username; }
    public void setUsername(String username)    { this.username = username; }
    public String getPassword()                 { return password; }
    public void setPassword(String password)     { this.password = password; }
    public String getEmail()                    { return email; }
    public void setEmail(String email)          { this.email = email; }

    public String getRole()                     { return role; }
    public void setRole(String role)            { this.role = role; }

    public String getEmployeeId()               { return employeeId; }
    public void setEmployeeId(String eid)       { this.employeeId = eid; }

    public String getStartDate()                { return startDate; }
    public void setStartDate(String startDate)  { this.startDate = startDate; }
}