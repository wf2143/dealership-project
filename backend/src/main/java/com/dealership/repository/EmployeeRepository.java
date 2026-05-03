package com.dealership.repository;

import com.dealership.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    @Query(value = "SELECT * FROM app_user WHERE username = :username", nativeQuery = true)
    Optional<Employee> findByUsername(@Param("username") String username);

    @Query(value = "SELECT * FROM app_user WHERE email = :email", nativeQuery = true)
    Optional<Employee> findByEmail(@Param("email") String email);

    @Query(value = "SELECT * FROM app_user WHERE role = :role ORDER BY last_name ASC", nativeQuery = true)
    List<Employee> findByRole(@Param("role") String role);

    @Modifying
    @Query(value = "UPDATE app_user SET role = :role WHERE id = :id", nativeQuery = true)
    void updateRole(@Param("id") Long id, @Param("role") String role);

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
