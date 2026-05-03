package com.dealership.repository;

import com.dealership.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    @Modifying
    @Query(value = "DELETE FROM customer WHERE customer_id = :id", nativeQuery = true)
    void deleteCustomerById(@Param("id") Long id);
}
