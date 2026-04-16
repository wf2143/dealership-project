package com.dealership.controller;

import com.dealership.model.Vehicle;
import com.dealership.service.VehicleService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService service;

    public VehicleController(VehicleService service) {
        this.service = service;
    }

    @GetMapping
    public List<Vehicle> getAll() {
        return service.getAll();
    }

    @PostMapping
    public Vehicle create(@RequestBody Vehicle v) {
        return service.save(v);
    }
}