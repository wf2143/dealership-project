package com.dealership.controller;

import com.dealership.model.Transaction;
import com.dealership.service.TransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    @GetMapping
    public List<Transaction> getAll() {
        return service.getAll();
    }

    @PostMapping("/sale")
    public ResponseEntity<Transaction> recordSale(
            @RequestParam Long   customerId,
            @RequestParam Long   vehicleId,
            @RequestParam double amount,
            @RequestParam String paymentType) {
        try {
            Transaction t = service.recordSale(customerId, vehicleId, amount, paymentType);
            return ResponseEntity.ok(t);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
