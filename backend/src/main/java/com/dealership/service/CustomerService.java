package com.dealership.service;

import com.dealership.model.Customer;
import com.dealership.repository.CustomerRepository;
import com.dealership.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    private final CustomerRepository repo;
    private final TransactionRepository transactionRepo;

    public CustomerService(CustomerRepository repo,
                           TransactionRepository transactionRepo) {
        this.repo            = repo;
        this.transactionRepo = transactionRepo;
    }

    // ── READ ──────────────────────────────────────────────────

    public List<Customer> getAll() {
        return repo.findAll();
    }

    public Optional<Customer> getById(Long id) {
        return repo.findById(id);
    }

    public Optional<Customer> getByEmail(String email) {
        return repo.findByEmail(email);
    }

    public Optional<Customer> getByPhone(String phone) {
        return repo.findByPhone(phone);
    }

    public List<Customer> searchByName(String name) {
        return repo.searchByName(name);
    }

    public List<Customer> getCustomersWithTransactions() {
        return repo.findCustomersWithTransactions();
    }

    public List<Customer> getCustomersWithNoTransactions() {
        return repo.findCustomersWithNoTransactions();
    }

    // ── CREATE ────────────────────────────────────────────────

    @Transactional
    public Customer save(Customer c) {
        return repo.save(c);
    }

    // ── UPDATE ────────────────────────────────────────────────

    @Transactional
    public void updateContactInfo(Long id, String phone, String email) {
        repo.updateContactInfo(id, phone, email);
    }

    @Transactional
    public void updateName(Long id, String name) {
        repo.updateName(id, name);
    }

    // ── DELETE ────────────────────────────────────────────────

    /**
     * Deletes a customer and all their transactions first to satisfy
     * the foreign key constraint on transaction.customer_id.
     * Both deletions are wrapped in one transaction — if either fails,
     * neither is committed.
     */
    @Transactional
    public void delete(Long id) {
        transactionRepo.deleteByCustomerId(id);
        repo.deleteCustomerById(id);
    }
}