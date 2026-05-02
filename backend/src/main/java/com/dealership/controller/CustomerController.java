package com.dealership.controller;

import com.dealership.model.Customer;
import com.dealership.service.CustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService service;

    public CustomerController(CustomerService service) {
        this.service = service;
    }

    @GetMapping
    public List<Customer> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/customers/search?name=smith
    @GetMapping("/search")
    public List<Customer> search(@RequestParam String name) {
        return service.searchByName(name);
    }

    @GetMapping("/with-transactions")
    public List<Customer> withTransactions() {
        return service.getCustomersWithTransactions();
    }

    @GetMapping("/no-transactions")
    public List<Customer> noTransactions() {
        return service.getCustomersWithNoTransactions();
    }

    @PostMapping
    public Customer create(@RequestBody Customer c) {
        return service.save(c);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable Long id,
                                           @RequestBody Customer c) {
        return service.getById(id)
                .map(existing -> {
                    c.setCustomerId(id);
                    return ResponseEntity.ok(service.save(c));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // PATCH /api/customers/5/contact?phone=555-1234&email=a@b.com
    @PatchMapping("/{id}/contact")
    public ResponseEntity<Void> updateContact(@PathVariable Long id,
                                              @RequestParam String phone,
                                              @RequestParam String email) {
        service.updateContactInfo(id, phone, email);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}