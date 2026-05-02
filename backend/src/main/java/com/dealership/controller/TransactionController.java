package com.dealership.controller;

import com.dealership.model.Transaction;
import com.dealership.service.TransactionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/transactions/customer/3
    @GetMapping("/customer/{customerId}")
    public List<Transaction> byCustomer(@PathVariable Long customerId) {
        return service.getByCustomerId(customerId);
    }

    // GET /api/transactions/vehicle/7
    @GetMapping("/vehicle/{vehicleId}")
    public List<Transaction> byVehicle(@PathVariable Long vehicleId) {
        return service.getByVehicleId(vehicleId);
    }

    // GET /api/transactions/range?from=2024-01-01&to=2024-12-31
    @GetMapping("/range")
    public List<Transaction> byDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return service.getByDateRange(from, to);
    }

    // GET /api/transactions/payment?type=cash
    @GetMapping("/payment")
    public List<Transaction> byPaymentType(@RequestParam String type) {
        return service.getByPaymentType(type);
    }

    @GetMapping("/stats/total-revenue")
    public Double totalRevenue() {
        return service.getTotalRevenue();
    }

    @GetMapping("/stats/monthly")
    public List<Object[]> monthlySummary() {
        return service.getMonthlySalesSummary();
    }

    // POST /api/transactions — raw insert
    @PostMapping
    public Transaction create(@RequestBody Transaction t) {
        return service.save(t);
    }

    /**
     * POST /api/transactions/sale
     * The main sale flow — creates the transaction AND marks the
     * vehicle as sold in one database transaction.
     *
     * Body params (request params for simplicity):
     *   customerId, vehicleId, amount, paymentType
     */
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

    @PatchMapping("/{id}/payment-type")
    public ResponseEntity<Void> updatePaymentType(@PathVariable Long id,
                                                  @RequestParam String value) {
        service.updatePaymentType(id, value);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}