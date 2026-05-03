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

    public List<Employee> getAll() {
        return repo.findAll();
    }

    public Optional<Employee> getById(Long id) {
        return repo.findById(id);
    }

    @Transactional
    public Employee save(Employee e) {
        return repo.save(e);
    }

    public Optional<Employee> login(String username, String password) {
        return repo.findByUsername(username)
                .filter(emp -> password.equals(emp.getPassword()));
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

    @Transactional
    public void delete(Long id) {
        repo.deleteEmployeeById(id);
    }
}
