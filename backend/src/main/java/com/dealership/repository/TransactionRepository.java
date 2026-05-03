package com.dealership.repository;

import com.dealership.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Modifying
    @Query(value = "DELETE FROM `transaction` WHERE transaction_id = :id", nativeQuery = true)
    void deleteTransactionById(@Param("id") Long id);

    @Modifying
    @Query(value = "DELETE FROM `transaction` WHERE customer_id = :customerId", nativeQuery = true)
    void deleteByCustomerId(@Param("customerId") Long customerId);
}
