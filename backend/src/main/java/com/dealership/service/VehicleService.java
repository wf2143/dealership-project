package com.dealership.service;

import com.dealership.model.Vehicle;
import com.dealership.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class VehicleService {

    private final VehicleRepository repo;

    public VehicleService(VehicleRepository repo) {
        this.repo = repo;
    }

    public List<Vehicle> getAll() {
        return repo.findAll();
    }

    public Optional<Vehicle> getById(Long id) {
        return repo.findById(id);
    }

    @Transactional
    public Vehicle insert(Vehicle v) {
        repo.insertVehicle(
            v.getVin(), v.getMake(), v.getModel(), v.getTrim(), v.getColor(),
            v.getYear(), v.getMileage(), v.getPrice(),
            v.getBodyType(), v.getFuelType(), v.getStatus(), v.getLot()
        );
        return repo.findByVin(v.getVin()).orElseThrow();
    }

    @Transactional
    public Vehicle update(Long id, Vehicle updated) {
        updated.setId(id);
        return repo.save(updated);
    }

    @Transactional
    public void delete(Long id) {
        repo.deleteVehicleById(id);
    }
}
