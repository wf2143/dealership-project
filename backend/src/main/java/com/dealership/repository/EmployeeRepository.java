package com.dealership.repository;

import com.dealership.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // ── SELECT queries ────────────────────────────────────────

    /**
     * Find all currently active employees.
     * Uses idx_employee_active index.
     *
     * SQL: SELECT * FROM employee WHERE active = TRUE
     */
    @Query(value = "SELECT * FROM employee WHERE active = TRUE", nativeQuery = true)
    List<Employee> findActiveEmployees();

    /**
     * Find an employee by their email address.
     *
     * SQL: SELECT * FROM employee WHERE email = ?
     */
    @Query(value = "SELECT * FROM employee WHERE email = :email", nativeQuery = true)
    Optional<Employee> findByEmail(@Param("email") String email);

    /**
     * Find all employees hired within a date range.
     *
     * SQL: SELECT * FROM employee
     *      WHERE hire_date BETWEEN ? AND ?
     *      ORDER BY hire_date ASC
     */
    @Query(value = """
            SELECT * FROM employee
            WHERE hire_date BETWEEN :from AND :to
            ORDER BY hire_date ASC
            """, nativeQuery = true)
    List<Employee> findHiredBetween(@Param("from") LocalDate from,
                                    @Param("to")   LocalDate to);

    /**
     * Find all employees whose salary is above a given threshold.
     *
     * SQL: SELECT * FROM employee WHERE salary > ? ORDER BY salary DESC
     */
    @Query(value = "SELECT * FROM employee WHERE salary > :min ORDER BY salary DESC",
           nativeQuery = true)
    List<Employee> findBySalaryGreaterThan(@Param("min") double min);

    /**
     * Get average salary of all active employees.
     *
     * SQL: SELECT AVG(salary) FROM employee WHERE active = TRUE
     */
    @Query(value = "SELECT AVG(salary) FROM employee WHERE active = TRUE",
           nativeQuery = true)
    Double averageActiveSalary();

    // ── UPDATE queries ────────────────────────────────────────

    /**
     * Update an employee's salary by ID.
     *
     * SQL: UPDATE employee SET salary = ? WHERE id = ?
     */
    @Modifying
    @Query(value = "UPDATE employee SET salary = :salary WHERE id = :id",
           nativeQuery = true)
    void updateSalary(@Param("id") Long id, @Param("salary") double salary);

    /**
     * Deactivate an employee (soft delete — sets active = FALSE and end_date).
     * This is preferred over hard delete to preserve transaction history.
     *
     * SQL: UPDATE employee SET active = FALSE, end_date = ? WHERE id = ?
     */
    @Modifying
    @Query(value = "UPDATE employee SET active = FALSE, end_date = :endDate WHERE id = :id",
           nativeQuery = true)
    void deactivateEmployee(@Param("id") Long id, @Param("endDate") LocalDate endDate);

    /**
     * Update an employee's contact details.
     *
     * SQL: UPDATE employee SET phone = ?, email = ? WHERE id = ?
     */
    @Modifying
    @Query(value = "UPDATE employee SET phone = :phone, email = :email WHERE id = :id",
           nativeQuery = true)
    void updateContact(@Param("id")    Long id,
                       @Param("phone") String phone,
                       @Param("email") String email);

    // ── DELETE queries ────────────────────────────────────────

    /**
     * Hard delete an employee by ID.
     * Use deactivateEmployee() instead when the employee has transaction history.
     *
     * SQL: DELETE FROM employee WHERE id = ?
     */
    @Modifying
    @Query(value = "DELETE FROM employee WHERE id = :id", nativeQuery = true)
    void deleteEmployeeById(@Param("id") Long id);
}