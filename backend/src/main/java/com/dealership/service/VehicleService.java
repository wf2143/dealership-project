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

    // ── READ ──────────────────────────────────────────────────

    public List<Vehicle> getAll() {
        return repo.findAll();
    }

    public Optional<Vehicle> getById(Long id) {
        return repo.findById(id);
    }

    public List<Vehicle> getAvailable() {
        return repo.findAvailableVehicles();
    }

    public List<Vehicle> getByMake(String make) {
        return repo.findByMake(make);
    }

    public List<Vehicle> getByPriceRange(double min, double max) {
        return repo.findByPriceRange(min, max);
    }

    public List<Vehicle> getByYear(int year) {
        return repo.findByYear(year);
    }

    public List<Vehicle> search(String term) {
        return repo.searchByMakeOrModel(term);
    }

    public List<Vehicle> getSold() {
        return repo.findSoldVehicles();
    }

    public List<Object[]> countAvailableByMake() {
        return repo.countAvailableByMake();
    }

    public Double averageAvailablePrice() {
        return repo.averagePriceOfAvailable();
    }

    // ── CREATE ────────────────────────────────────────────────

    @Transactional
    public Vehicle save(Vehicle v) {
        return repo.save(v);
    }

    // ── UPDATE ────────────────────────────────────────────────

    @Transactional
    public void updateStatus(Long id, String status) {
        repo.updateStatus(id, status);
    }

    @Transactional
    public void updatePrice(Long id, double price) {
        repo.updatePrice(id, price);
    }

    @Transactional
    public void updateMileageAndStatus(Long id, int mileage, String status) {
        repo.updateMileageAndStatus(id, mileage, status);
    }

    // Full object update (replaces all fields)
    @Transactional
    public Vehicle update(Long id, Vehicle updated) {
        updated.setId(id);
        return repo.save(updated);
    }

    // ── DELETE ────────────────────────────────────────────────

    @Transactional
    public void delete(Long id) {
        repo.deleteVehicleById(id);
    }
}