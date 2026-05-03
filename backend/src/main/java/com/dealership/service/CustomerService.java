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

    public List<Customer> getAll() {
        return repo.findAll();
    }

    public Optional<Customer> getById(Long id) {
        return repo.findById(id);
    }

    @Transactional
    public Customer save(Customer c) {
        return repo.save(c);
    }

    @Transactional
    public void delete(Long id) {
        transactionRepo.deleteByCustomerId(id);
        repo.deleteCustomerById(id);
    }
}
