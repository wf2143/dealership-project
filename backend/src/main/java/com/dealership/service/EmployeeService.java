package com.dealership.service;

import com.dealership.model.Employee;
import com.dealership.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {

    private final EmployeeRepository repo;

    public EmployeeService(EmployeeRepository repo) {
        this.repo = repo;
    }

    // ── READ ──────────────────────────────────────────────────

    public List<Employee> getAll() {
        return repo.findAll();
    }

    public Optional<Employee> getById(Long id) {
        return repo.findById(id);
    }

    public Optional<Employee> getByUsername(String username) {
        return repo.findByUsername(username);
    }

    public Optional<Employee> getByEmail(String email) {
        return repo.findByEmail(email);
    }

    public List<Employee> getByRole(String role) {
        return repo.findByRole(role);
    }

    // ── CREATE ────────────────────────────────────────────────

    @Transactional
    public Employee save(Employee e) {
        return repo.save(e);
    }

    public Optional<Employee> login(String username, String password) {
        return repo.findByUsername(username)
                .filter(emp -> password.equals(emp.getPassword()));
    }

    // ── UPDATE ────────────────────────────────────────────────

    @Transactional
    public void updateRole(Long id, String role) {
        repo.updateRole(id, role);
    }

    @Transactional
    public Optional<Employee> updateProfile(Long id, String firstName, String lastName, String username, String email) {
        repo.updateProfile(id, firstName, lastName, username, email);
        return repo.findById(id);
    }

    @Transactional
    public boolean updatePassword(Long id, String currentPassword, String newPassword) {
        Optional<Employee> opt = repo.findById(id);
        if (opt.isEmpty() || !currentPassword.equals(opt.get().getPassword())) return false;
        repo.updatePassword(id, newPassword);
        return true;
    }

    // ── DELETE ────────────────────────────────────────────────

    @Transactional
    public void delete(Long id) {
        repo.deleteEmployeeById(id);
    }
}
