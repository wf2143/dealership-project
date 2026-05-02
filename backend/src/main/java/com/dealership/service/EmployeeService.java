package com.dealership.service;

import com.dealership.model.Employee;
import com.dealership.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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

    public List<Employee> getActive() {
        return repo.findActiveEmployees();
    }

    public Optional<Employee> getByEmail(String email) {
        return repo.findByEmail(email);
    }

    public List<Employee> getHiredBetween(LocalDate from, LocalDate to) {
        return repo.findHiredBetween(from, to);
    }

    public List<Employee> getBySalaryAbove(double min) {
        return repo.findBySalaryGreaterThan(min);
    }

    public Double getAverageActiveSalary() {
        return repo.averageActiveSalary();
    }

    // ── CREATE ────────────────────────────────────────────────

    @Transactional
    public Employee save(Employee e) {
        return repo.save(e);
    }

    public Optional<Employee> login(String username, String password) {
        // Authentication is currently based on email/username lookup only.
        return repo.findByEmail(username);
    }

    public Optional<Employee> findById(Long id) {
        return getById(id);
    }

    @Transactional
    public Optional<Employee> update(Long id, Employee employee) {
        return repo.findById(id)
                .map(existing -> {
                    employee.setId(id);
                    return repo.save(employee);
                });
    }

    // ── UPDATE ────────────────────────────────────────────────

    @Transactional
    public void updateSalary(Long id, double salary) {
        repo.updateSalary(id, salary);
    }

    @Transactional
    public void updateContact(Long id, String phone, String email) {
        repo.updateContact(id, phone, email);
    }

    /**
     * Soft-deletes an employee: sets active = FALSE and records end_date.
     * Transaction history and employee record are preserved.
     */
    @Transactional
    public void deactivate(Long id) {
        repo.deactivateEmployee(id, LocalDate.now());
    }

    // ── DELETE ────────────────────────────────────────────────

    @Transactional
    public void delete(Long id) {
        repo.deleteEmployeeById(id);
    }
}