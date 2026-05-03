package com.dealership.repository;

import com.dealership.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @Query(value = "SELECT * FROM app_user WHERE username = :username", nativeQuery = true)
    Optional<Employee> findByUsername(@Param("username") String username);

    @Modifying
    @Query(value = "UPDATE app_user SET first_name = :firstName, last_name = :lastName, username = :username, email = :email WHERE id = :id",
           nativeQuery = true)
    void updateProfile(@Param("id")        Long id,
                       @Param("firstName") String firstName,
                       @Param("lastName")  String lastName,
                       @Param("username")  String username,
                       @Param("email")     String email);

    @Modifying
    @Query(value = "UPDATE app_user SET password = :password WHERE id = :id", nativeQuery = true)
    void updatePassword(@Param("id") Long id, @Param("password") String password);

    @Modifying
    @Query(value = "DELETE FROM app_user WHERE id = :id", nativeQuery = true)
    void deleteEmployeeById(@Param("id") Long id);
}
