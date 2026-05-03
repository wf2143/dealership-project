package com.dealership.repository;

import com.dealership.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    @Modifying
    @Query(value = "UPDATE vehicle SET status = :status WHERE id = :id", nativeQuery = true)
    void updateStatus(@Param("id") Long id, @Param("status") String status);

    @Modifying
    @Query(value = "DELETE FROM vehicle WHERE id = :id", nativeQuery = true)
    void deleteVehicleById(@Param("id") Long id);
}
