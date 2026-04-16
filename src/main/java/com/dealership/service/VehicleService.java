package com.dealership.service;

import com.dealership.model.Vehicle;
import com.dealership.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import java.util.List;

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
}