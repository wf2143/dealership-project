package com.dealership.service;

import com.dealership.model.Customer;
import com.dealership.model.Transaction;
import com.dealership.model.Vehicle;
import com.dealership.repository.CustomerRepository;
import com.dealership.repository.TransactionRepository;
import com.dealership.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    private final TransactionRepository repo;
    private final VehicleRepository     vehicleRepo;
    private final CustomerRepository    customerRepo;

    public TransactionService(TransactionRepository repo,
                              VehicleRepository vehicleRepo,
                              CustomerRepository customerRepo) {
        this.repo         = repo;
        this.vehicleRepo  = vehicleRepo;
        this.customerRepo = customerRepo;
    }

    // ── READ ──────────────────────────────────────────────────

    public List<Transaction> getAll() {
        return repo.findAll();
    }

    public Optional<Transaction> getById(Long id) {
        return repo.findById(id);
    }

    public List<Transaction> getByCustomerId(Long customerId) {
        return repo.findByCustomerId(customerId);
    }

    public List<Transaction> getByVehicleId(Long vehicleId) {
        return repo.findByVehicleId(vehicleId);
    }

    public List<Transaction> getByDateRange(LocalDate from, LocalDate to) {
        return repo.findByDateRange(from, to);
    }

    public List<Transaction> getByPaymentType(String paymentType) {
        return repo.findByPaymentType(paymentType);
    }

    public Double getTotalRevenue() {
        return repo.totalRevenue();
    }

    public Double getRevenueBetween(LocalDate from, LocalDate to) {
        return repo.totalRevenueBetween(from, to);
    }

    public List<Object[]> getMonthlySalesSummary() {
        return repo.monthlySalesSummary();
    }

    public List<Transaction> getByAmountGreaterThan(double min) {
        return repo.findByAmountGreaterThan(min);
    }

    // ── CREATE — the core sale transaction ────────────────────

    /**
     * Records a vehicle sale. This is a database transaction:
     * if any step fails, all changes are rolled back.
     *
     * Steps:
     *   1. Verify the vehicle exists and is 'available'.
     *   2. Insert a new row into transaction.
     *   3. Update vehicle.status to 'sold' and vehicle.change_date to today.
     *
     * This mirrors the assignment requirement for a transaction/view
     * that complements the goals of the scenario.
     */
    @Transactional
    public Transaction recordSale(Long customerId,
                                  Long vehicleId,
                                  double amount,
                                  String paymentType) {

        Vehicle vehicle = vehicleRepo.findById(vehicleId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Vehicle not found: " + vehicleId));

        if (!"available".equalsIgnoreCase(vehicle.getStatus())) {
            throw new IllegalStateException(
                    "Vehicle " + vehicleId + " is not available for sale. " +
                    "Current status: " + vehicle.getStatus());
        }

        Customer customer = customerRepo.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Customer not found: " + customerId));

        // Insert transaction row
        Transaction t = new Transaction();
        t.setCustomer(customer);
        t.setVehicle(vehicle);
        t.setAmount(amount);
        t.setPaymentType(paymentType);
        t.setDate(LocalDate.now());
        Transaction saved = repo.save(t);

        // Mark vehicle as sold
        vehicleRepo.updateStatus(vehicleId, "sold");

        return saved;
    }

    @Transactional
    public Transaction save(Transaction t) {
        return repo.save(t);
    }

    // ── UPDATE ────────────────────────────────────────────────

    @Transactional
    public void updatePaymentType(Long id, String paymentType) {
        repo.updatePaymentType(id, paymentType);
    }

    @Transactional
    public void updateAmount(Long id, double amount) {
        repo.updateAmount(id, amount);
    }

    // ── DELETE ────────────────────────────────────────────────

    @Transactional
    public void delete(Long id) {
        repo.deleteTransactionById(id);
    }
}