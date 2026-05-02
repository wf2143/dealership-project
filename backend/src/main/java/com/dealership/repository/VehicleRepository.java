package com.dealership.repository;

import com.dealership.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    // ── SELECT queries ────────────────────────────────────────

    /**
     * Get all vehicles that are currently available on the lot.
     * Uses idx_vehicle_status index.
     *
     * SQL: SELECT * FROM vehicle WHERE status = 'available'
     */
    @Query(value = "SELECT * FROM vehicle WHERE status = 'available'", nativeQuery = true)
    List<Vehicle> findAvailableVehicles();

    /**
     * Find vehicles by make (case-insensitive).
     * Uses idx_vehicle_make index.
     *
     * SQL: SELECT * FROM vehicle WHERE LOWER(make) = LOWER(?)
     */
    @Query(value = "SELECT * FROM vehicle WHERE LOWER(make) = LOWER(:make)",
           nativeQuery = true)
    List<Vehicle> findByMake(@Param("make") String make);

    /**
     * Find vehicles within a price range.
     *
     * SQL: SELECT * FROM vehicle WHERE price BETWEEN ? AND ?
     *      ORDER BY price ASC
     */
    @Query(value = "SELECT * FROM vehicle WHERE price BETWEEN :min AND :max ORDER BY price ASC",
           nativeQuery = true)
    List<Vehicle> findByPriceRange(@Param("min") double min, @Param("max") double max);

    /**
     * Find vehicles by year.
     *
     * SQL: SELECT * FROM vehicle WHERE year = ?
     */
    @Query(value = "SELECT * FROM vehicle WHERE year = :year", nativeQuery = true)
    List<Vehicle> findByYear(@Param("year") int year);

    /**
     * Search vehicles by make OR model (partial, case-insensitive).
     * Uses idx_vehicle_make index for make portion.
     *
     * SQL: SELECT * FROM vehicle
     *      WHERE LOWER(make) LIKE ? OR LOWER(model) LIKE ?
     */
    @Query(value = """
            SELECT * FROM vehicle
            WHERE LOWER(make)  LIKE CONCAT('%', LOWER(:term), '%')
               OR LOWER(model) LIKE CONCAT('%', LOWER(:term), '%')
            """, nativeQuery = true)
    List<Vehicle> searchByMakeOrModel(@Param("term") String term);

    /**
     * Find all vehicles that have been sold.
     *
     * SQL: SELECT * FROM vehicle WHERE status = 'sold'
     */
    @Query(value = "SELECT * FROM vehicle WHERE status = 'sold'", nativeQuery = true)
    List<Vehicle> findSoldVehicles();

    /**
     * Count how many vehicles are available per make.
     * Returns Object[] rows: [make, count].
     *
     * SQL: SELECT make, COUNT(*) AS count
     *      FROM vehicle WHERE status = 'available'
     *      GROUP BY make ORDER BY count DESC
     */
    @Query(value = """
            SELECT make, COUNT(*) AS count
            FROM vehicle
            WHERE status = 'available'
            GROUP BY make
            ORDER BY count DESC
            """, nativeQuery = true)
    List<Object[]> countAvailableByMake();

    /**
     * Get average price of available vehicles.
     *
     * SQL: SELECT AVG(price) FROM vehicle WHERE status = 'available'
     */
    @Query(value = "SELECT AVG(price) FROM vehicle WHERE status = 'available'",
           nativeQuery = true)
    Double averagePriceOfAvailable();

    // ── UPDATE queries ────────────────────────────────────────

    /**
     * Update a vehicle's status by ID.
     * Called when a vehicle is put on hold, sold, etc.
     *
     * SQL: UPDATE vehicle SET status = ?, change_date = CURDATE() WHERE id = ?
     */
    @Modifying
    @Query(value = "UPDATE vehicle SET status = :status, change_date = CURDATE() WHERE id = :id",
           nativeQuery = true)
    void updateStatus(@Param("id") Long id, @Param("status") String status);

    /**
     * Update a vehicle's price by ID.
     *
     * SQL: UPDATE vehicle SET price = ?, change_date = CURDATE() WHERE id = ?
     */
    @Modifying
    @Query(value = "UPDATE vehicle SET price = :price, change_date = CURDATE() WHERE id = :id",
           nativeQuery = true)
    void updatePrice(@Param("id") Long id, @Param("price") double price);

    /**
     * Update mileage and status together (e.g. after a test drive or trade-in).
     *
     * SQL: UPDATE vehicle SET mileage = ?, status = ?, change_date = CURDATE()
     *      WHERE id = ?
     */
    @Modifying
    @Query(value = """
            UPDATE vehicle
            SET mileage = :mileage, status = :status, change_date = CURDATE()
            WHERE id = :id
            """, nativeQuery = true)
    void updateMileageAndStatus(@Param("id")      Long id,
                                @Param("mileage") int mileage,
                                @Param("status")  String status);

    // ── DELETE queries ────────────────────────────────────────

    /**
     * Delete a vehicle by ID.
     *
     * SQL: DELETE FROM vehicle WHERE id = ?
     */
    @Modifying
    @Query(value = "DELETE FROM vehicle WHERE id = :id", nativeQuery = true)
    void deleteVehicleById(@Param("id") Long id);
}