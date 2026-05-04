package com.dealership.service;

import com.dealership.model.Vehicle;
import com.dealership.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class VehicleService {

    private final VehicleRepository repo;

    public VehicleService(VehicleRepository repo) {
        this.repo = repo;
    }

    public List<Vehicle> getAll() {
        return repo.findAllVehicles();
    }

    public Optional<Vehicle> getById(Long id) {
        return repo.findVehicleById(id);
    }

    public List<Map<String, Object>> getSummary() {
        return repo.getInventorySummary().stream().map(row -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("status",       row[0]);
            m.put("vehicleCount", row[1]);
            m.put("avgPrice",     row[2]);
            m.put("minPrice",     row[3]);
            m.put("maxPrice",     row[4]);
            m.put("totalValue",   row[5]);
            return m;
        }).toList();
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
    public Vehicle update(Long id, Vehicle v) {
        repo.updateVehicle(
            id,
            v.getVin(), v.getMake(), v.getModel(), v.getTrim(), v.getColor(),
            v.getYear(), v.getMileage(), v.getPrice(),
            v.getBodyType(), v.getFuelType(), v.getStatus(), v.getLot()
        );
        return repo.findVehicleById(id).orElseThrow();
    }

    @Transactional
    public void delete(Long id) {
        repo.deleteVehicleById(id);
    }
}
