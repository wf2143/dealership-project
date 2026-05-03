package com.dealership.controller;

import com.dealership.model.Employee;
import com.dealership.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService service;

    public EmployeeController(EmployeeService service) {
        this.service = service;
    }

    @GetMapping
    public List<Employee> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/register")
    public ResponseEntity<Employee> register(@RequestBody Employee employee) {
        return ResponseEntity.ok(service.save(employee));
    }

    @PostMapping("/login")
    public ResponseEntity<Employee> login(@RequestBody Map<String, String> body) {
        return service.login(body.get("username"), body.get("password"))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateProfile(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return service.updateProfile(id, body.get("firstName"), body.get("lastName"), body.get("username"), body.get("email"))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Void> updatePassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        boolean ok = service.updatePassword(id, body.get("currentPassword"), body.get("newPassword"));
        return ok ? ResponseEntity.ok().build() : ResponseEntity.status(401).build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
