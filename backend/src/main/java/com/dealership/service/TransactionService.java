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

    public List<Transaction> getAll() {
        return repo.findAll();
    }

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

        Transaction t = new Transaction();
        t.setCustomer(customer);
        t.setVehicle(vehicle);
        t.setAmount(amount);
        t.setPaymentType(paymentType);
        t.setDate(LocalDate.now());
        Transaction saved = repo.save(t);

        vehicleRepo.updateStatus(vehicleId, "sold");

        return saved;
    }

    @Transactional
    public void delete(Long id) {
        repo.deleteTransactionById(id);
    }
}
