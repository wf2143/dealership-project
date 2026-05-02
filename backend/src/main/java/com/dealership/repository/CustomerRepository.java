package com.dealership.repository;

import com.dealership.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // ── SELECT queries ────────────────────────────────────────

    /**
     * Find a customer by their exact email address.
     * Uses the idx_customer_email index for fast lookup.
     *
     * SQL: SELECT * FROM customer WHERE email = ?
     */
    @Query(value = "SELECT * FROM customer WHERE email = :email", nativeQuery = true)
    Optional<Customer> findByEmail(@Param("email") String email);

    /**
     * Find a customer by their phone number.
     * Uses the idx_customer_phone index.
     *
     * SQL: SELECT * FROM customer WHERE phone = ?
     */
    @Query(value = "SELECT * FROM customer WHERE phone = :phone", nativeQuery = true)
    Optional<Customer> findByPhone(@Param("phone") String phone);

    /**
     * Search customers whose name contains the given string (case-insensitive).
     *
     * SQL: SELECT * FROM customer WHERE name LIKE ?
     */
    @Query(value = "SELECT * FROM customer WHERE name LIKE CONCAT('%', :name, '%')",
           nativeQuery = true)
    List<Customer> searchByName(@Param("name") String name);

    /**
     * Find all customers who have made at least one transaction.
     * Joins customer to transaction on cust_id.
     *
     * SQL: SELECT DISTINCT c.* FROM customer c
     *      INNER JOIN transaction t ON c.cust_id = t.customer_id
     */
    @Query(value = """
            SELECT DISTINCT c.*
            FROM customer c
            INNER JOIN transaction t ON c.cust_id = t.customer_id
            """, nativeQuery = true)
    List<Customer> findCustomersWithTransactions();

    /**
     * Find all customers who have never made a transaction.
     *
     * SQL: SELECT * FROM customer c
     *      WHERE NOT EXISTS (
     *          SELECT 1 FROM transaction t WHERE t.customer_id = c.cust_id
     *      )
     */
    @Query(value = """
            SELECT * FROM customer c
            WHERE NOT EXISTS (
                SELECT 1 FROM transaction t WHERE t.customer_id = c.cust_id
            )
            """, nativeQuery = true)
    List<Customer> findCustomersWithNoTransactions();

    // ── UPDATE queries ────────────────────────────────────────

    /**
     * Update a customer's contact info by ID.
     *
     * SQL: UPDATE customer SET phone = ?, email = ? WHERE cust_id = ?
     */
    @Modifying
    @Query(value = "UPDATE customer SET phone = :phone, email = :email WHERE cust_id = :id",
           nativeQuery = true)
    void updateContactInfo(@Param("id")    Long id,
                           @Param("phone") String phone,
                           @Param("email") String email);

    /**
     * Update a customer's name by ID.
     *
     * SQL: UPDATE customer SET name = ? WHERE cust_id = ?
     */
    @Modifying
    @Query(value = "UPDATE customer SET name = :name WHERE cust_id = :id",
           nativeQuery = true)
    void updateName(@Param("id") Long id, @Param("name") String name);

    // ── DELETE queries ────────────────────────────────────────

    /**
     * Delete a customer by ID.
     * (JpaRepository provides deleteById — this is the explicit SQL version.)
     *
     * SQL: DELETE FROM customer WHERE cust_id = ?
     */
    @Modifying
    @Query(value = "DELETE FROM customer WHERE cust_id = :id", nativeQuery = true)
    void deleteCustomerById(@Param("id") Long id);
}