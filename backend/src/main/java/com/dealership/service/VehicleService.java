package com.dealership.service;

import com.dealership.model.Vehicle;
import com.dealership.repository.VehicleRepository;
import org.springframework.stereotype.Service;
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

    public Vehicle save(Vehicle v) {
        return repo.save(v);
    }

    public Optional<Vehicle> findById(Long id) {
        return repo.findById(id);
    }

    public Optional<Vehicle> update(Long id, Vehicle updated) {
        return repo.findById(id).map(existing -> {
            existing.setVin(updated.getVin());
            existing.setMake(updated.getMake());
            existing.setModel(updated.getModel());
            existing.setTrim(updated.getTrim());
            existing.setColor(updated.getColor());
            existing.setYear(updated.getYear());
            existing.setMileage(updated.getMileage());
            existing.setPrice(updated.getPrice());
            existing.setStatus(updated.getStatus());
            existing.setLot(updated.getLot());
            existing.setDaysOnLot(updated.getDaysOnLot());
            existing.setBodyType(updated.getBodyType());
            existing.setFuelType(updated.getFuelType());
            return repo.save(existing);
        });
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}