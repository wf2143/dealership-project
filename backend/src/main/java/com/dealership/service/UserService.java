package com.dealership.service;

import com.dealership.model.User;
import com.dealership.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    // ── READ ──────────────────────────────────────────────────

    public List<User> getAll() {
        return repo.findAll();
    }

    public Optional<User> getById(Long id) {
        return repo.findById(id);
    }

    public Optional<User> getByUsername(String username) {
        return repo.findByUsername(username);
    }

    public Optional<User> getByEmail(String email) {
        return repo.findByEmail(email);
    }

    public List<User> getByRole(String role) {
        return repo.findByRole(role);
    }

    // ── CREATE ────────────────────────────────────────────────

    @Transactional
    public User save(User u) {
        return repo.save(u);
    }

    // ── UPDATE ────────────────────────────────────────────────

    @Transactional
    public void updateRole(Long id, String role) {
        repo.updateRole(id, role);
    }

    @Transactional
    public void updateCredentials(Long id, String username, String email) {
        repo.updateCredentials(id, username, email);
    }

    // ── DELETE ────────────────────────────────────────────────

    @Transactional
    public void delete(Long id) {
        repo.deleteUserById(id);
    }
}