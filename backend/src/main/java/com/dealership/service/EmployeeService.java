package com.dealership.service;

import com.dealership.model.Employee;
import com.dealership.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {

    private final EmployeeRepository repo;

    public EmployeeService(EmployeeRepository repo) {
        this.repo = repo;
    }

    public List<Employee> getAll() {
        return repo.findAll();
    }

    public Optional<Employee> login(String username, String password) {
        return repo.findByUsername(username)
                .filter(e -> password.equals(e.getPassword()));
    }

    public Employee save(Employee e) {
        return repo.save(e);
    }

    public Optional<Employee> findById(Long id) {
        return repo.findById(id);
    }

    public Optional<Employee> update(Long id, Employee updated) {
        return repo.findById(id).map(existing -> {
            existing.setFirstName(updated.getFirstName());
            existing.setLastName(updated.getLastName());
            existing.setUsername(updated.getUsername());
            existing.setEmail(updated.getEmail());
            return repo.save(existing);
        });
    }
}