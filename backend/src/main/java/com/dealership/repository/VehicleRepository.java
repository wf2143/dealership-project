package com.dealership.repository;

import com.dealership.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    @Modifying
    @Query(value = """
        INSERT INTO vehicle
          (vin, make, model, trim, color, year, mileage, price,
           body_type, fuel_type, status, lot, add_date, change_date)
        VALUES
          (:vin, :make, :model, :trim, :color, :year, :mileage, :price,
           :bodyType, :fuelType, :status, :lot, CURDATE(), CURDATE())
        """, nativeQuery = true)
    void insertVehicle(
        @Param("vin")      String vin,
        @Param("make")     String make,
        @Param("model")    String model,
        @Param("trim")     String trim,
        @Param("color")    String color,
        @Param("year")     int    year,
        @Param("mileage")  int    mileage,
        @Param("price")    double price,
        @Param("bodyType") String bodyType,
        @Param("fuelType") String fuelType,
        @Param("status")   String status,
        @Param("lot")      String lot
    );

    @Query("SELECT v FROM Vehicle v WHERE v.vin = :vin")
    Optional<Vehicle> findByVin(@Param("vin") String vin);

    @Modifying
    @Query(value = "UPDATE vehicle SET status = :status WHERE id = :id", nativeQuery = true)
    void updateStatus(@Param("id") Long id, @Param("status") String status);

    @Modifying
    @Query(value = "DELETE FROM vehicle WHERE id = :id", nativeQuery = true)
    void deleteVehicleById(@Param("id") Long id);
}
