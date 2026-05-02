package com.dealership.controller;

import com.dealership.model.Vehicle;
import com.dealership.service.VehicleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService service;

    public VehicleController(VehicleService service) {
        this.service = service;
    }

    // ── GET all ──────────────────────────────────────────────
    @GetMapping
    public List<Vehicle> getAll() {
        return service.getAll();
    }

    // ── GET by ID ─────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<Vehicle> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── GET available only ────────────────────────────────────
    @GetMapping("/available")
    public List<Vehicle> getAvailable() {
        return service.getAvailable();
    }

    // ── GET sold only ─────────────────────────────────────────
    @GetMapping("/sold")
    public List<Vehicle> getSold() {
        return service.getSold();
    }

    // ── GET by make ───────────────────────────────────────────
    // Example: GET /api/vehicles/make/Toyota
    @GetMapping("/make/{make}")
    public List<Vehicle> getByMake(@PathVariable String make) {
        return service.getByMake(make);
    }

    // ── GET by year ───────────────────────────────────────────
    // Example: GET /api/vehicles/year/2022
    @GetMapping("/year/{year}")
    public List<Vehicle> getByYear(@PathVariable int year) {
        return service.getByYear(year);
    }

    // ── GET by price range ────────────────────────────────────
    // Example: GET /api/vehicles/price?min=10000&max=50000
    @GetMapping("/price")
    public List<Vehicle> getByPrice(@RequestParam double min,
                                    @RequestParam double max) {
        return service.getByPriceRange(min, max);
    }

    // ── GET search ────────────────────────────────────────────
    // Example: GET /api/vehicles/search?term=camry
    @GetMapping("/search")
    public List<Vehicle> search(@RequestParam String term) {
        return service.search(term);
    }

    // ── GET count available by make ───────────────────────────
    @GetMapping("/stats/by-make")
    public List<Object[]> countByMake() {
        return service.countAvailableByMake();
    }

    // ── GET average price of available ────────────────────────
    @GetMapping("/stats/avg-price")
    public Double avgPrice() {
        return service.averageAvailablePrice();
    }

    // ── POST create ───────────────────────────────────────────
    @PostMapping
    public Vehicle create(@RequestBody Vehicle v) {
        return service.save(v);
    }

    // ── PUT full update ───────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> update(@PathVariable Long id,
                                          @RequestBody Vehicle v) {
        return service.getById(id)
                .map(existing -> ResponseEntity.ok(service.update(id, v)))
                .orElse(ResponseEntity.notFound().build());
    }

    // ── PATCH status only ─────────────────────────────────────
    // Example: PATCH /api/vehicles/5/status?value=hold
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long id,
                                             @RequestParam String value) {
        service.updateStatus(id, value);
        return ResponseEntity.ok().build();
    }

    // ── PATCH price only ──────────────────────────────────────
    @PatchMapping("/{id}/price")
    public ResponseEntity<Void> updatePrice(@PathVariable Long id,
                                            @RequestParam double value) {
        service.updatePrice(id, value);
        return ResponseEntity.ok().build();
    }

    // ── DELETE ────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}