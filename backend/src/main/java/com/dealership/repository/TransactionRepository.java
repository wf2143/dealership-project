package com.dealership.repository;

import com.dealership.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // ── SELECT queries ────────────────────────────────────────

    /**
     * Find all transactions for a specific customer.
     * Uses idx_transaction_customer index.
     *
     * SQL: SELECT * FROM transaction WHERE customer_id = ?
     *      ORDER BY date DESC
     */
    @Query(value = """
            SELECT * FROM transaction
            WHERE customer_id = :customerId
            ORDER BY date DESC
            """, nativeQuery = true)
    List<Transaction> findByCustomerId(@Param("customerId") Long customerId);

    /**
     * Find all transactions for a specific vehicle.
     *
     * SQL: SELECT * FROM transaction WHERE vehicle_id = ? ORDER BY date DESC
     */
    @Query(value = """
            SELECT * FROM transaction
            WHERE vehicle_id = :vehicleId
            ORDER BY date DESC
            """, nativeQuery = true)
    List<Transaction> findByVehicleId(@Param("vehicleId") Long vehicleId);

    /**
     * Find all transactions within a date range.
     * Uses idx_transaction_date index.
     *
     * SQL: SELECT * FROM transaction
     *      WHERE date BETWEEN ? AND ?
     *      ORDER BY date DESC
     */
    @Query(value = """
            SELECT * FROM transaction
            WHERE date BETWEEN :from AND :to
            ORDER BY date DESC
            """, nativeQuery = true)
    List<Transaction> findByDateRange(@Param("from") LocalDate from,
                                      @Param("to")   LocalDate to);

    /**
     * Find transactions by payment type (cash, credit, finance).
     *
     * SQL: SELECT * FROM transaction WHERE payment_type = ?
     */
    @Query(value = "SELECT * FROM transaction WHERE payment_type = :paymentType",
           nativeQuery = true)
    List<Transaction> findByPaymentType(@Param("paymentType") String paymentType);

    /**
     * Get total revenue across all transactions.
     *
     * SQL: SELECT SUM(amount) FROM transaction
     */
    @Query(value = "SELECT SUM(amount) FROM transaction", nativeQuery = true)
    Double totalRevenue();

    /**
     * Get total revenue within a date range.
     *
     * SQL: SELECT SUM(amount) FROM transaction WHERE date BETWEEN ? AND ?
     */
    @Query(value = "SELECT SUM(amount) FROM transaction WHERE date BETWEEN :from AND :to",
           nativeQuery = true)
    Double totalRevenueBetween(@Param("from") LocalDate from,
                               @Param("to")   LocalDate to);

    /**
     * Get monthly sales summary: month, number of sales, total revenue.
     * Returns Object[] rows: [month (YYYY-MM), count, total].
     *
     * SQL: SELECT DATE_FORMAT(date, '%Y-%m') AS month,
     *             COUNT(*) AS sales_count,
     *             SUM(amount) AS total_revenue
     *      FROM transaction
     *      GROUP BY month
     *      ORDER BY month DESC
     */
    @Query(value = """
            SELECT DATE_FORMAT(date, '%Y-%m') AS month,
                   COUNT(*)                   AS sales_count,
                   SUM(amount)                AS total_revenue
            FROM transaction
            GROUP BY month
            ORDER BY month DESC
            """, nativeQuery = true)
    List<Object[]> monthlySalesSummary();

    /**
     * Find transactions where amount is above a given value.
     *
     * SQL: SELECT * FROM transaction WHERE amount > ? ORDER BY amount DESC
     */
    @Query(value = "SELECT * FROM transaction WHERE amount > :min ORDER BY amount DESC",
           nativeQuery = true)
    List<Transaction> findByAmountGreaterThan(@Param("min") double min);

    // ── UPDATE queries ────────────────────────────────────────

    /**
     * Update the payment type on a transaction by ID.
     *
     * SQL: UPDATE transaction SET payment_type = ? WHERE transaction_id = ?
     */
    @Modifying
    @Query(value = "UPDATE transaction SET payment_type = :paymentType WHERE transaction_id = :id",
           nativeQuery = true)
    void updatePaymentType(@Param("id")          Long id,
                           @Param("paymentType") String paymentType);

    /**
     * Update the amount on a transaction by ID.
     *
     * SQL: UPDATE transaction SET amount = ? WHERE transaction_id = ?
     */
    @Modifying
    @Query(value = "UPDATE transaction SET amount = :amount WHERE transaction_id = :id",
           nativeQuery = true)
    void updateAmount(@Param("id") Long id, @Param("amount") double amount);

    // ── DELETE queries ────────────────────────────────────────

    /**
     * Delete a transaction by ID.
     *
     * SQL: DELETE FROM transaction WHERE transaction_id = ?
     */
    @Modifying
    @Query(value = "DELETE FROM transaction WHERE transaction_id = :id", nativeQuery = true)
    void deleteTransactionById(@Param("id") Long id);

    /**
     * Delete all transactions belonging to a specific customer.
     * Called before deleting a customer to satisfy FK constraints.
     *
     * SQL: DELETE FROM transaction WHERE customer_id = ?
     */
    @Modifying
    @Query(value = "DELETE FROM transaction WHERE customer_id = :customerId",
           nativeQuery = true)
    void deleteByCustomerId(@Param("customerId") Long customerId);
}