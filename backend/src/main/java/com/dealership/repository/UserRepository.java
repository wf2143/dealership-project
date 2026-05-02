package com.dealership.repository;

import com.dealership.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // ── SELECT queries ────────────────────────────────────────

    /**
     * Find a user by their username (used for login).
     * Uses idx_user_username index.
     *
     * SQL: SELECT * FROM app_user WHERE username = ?
     */
    @Query(value = "SELECT * FROM app_user WHERE username = :username", nativeQuery = true)
    Optional<User> findByUsername(@Param("username") String username);

    /**
     * Find a user by their email address.
     *
     * SQL: SELECT * FROM app_user WHERE email = ?
     */
    @Query(value = "SELECT * FROM app_user WHERE email = :email", nativeQuery = true)
    Optional<User> findByEmail(@Param("email") String email);

    /**
     * Find all users who hold a specific role.
     *
     * SQL: SELECT * FROM app_user WHERE role = ? ORDER BY last_name ASC
     */
    @Query(value = "SELECT * FROM app_user WHERE role = :role ORDER BY last_name ASC",
           nativeQuery = true)
    List<User> findByRole(@Param("role") String role);

    // ── UPDATE queries ────────────────────────────────────────

    /**
     * Update a user's role by ID.
     * Only callable by a General Manager.
     *
     * SQL: UPDATE app_user SET role = ? WHERE id = ?
     */
    @Modifying
    @Query(value = "UPDATE app_user SET role = :role WHERE id = :id", nativeQuery = true)
    void updateRole(@Param("id") Long id, @Param("role") String role);

    /**
     * Update a user's email and username.
     *
     * SQL: UPDATE app_user SET username = ?, email = ? WHERE id = ?
     */
    @Modifying
    @Query(value = "UPDATE app_user SET username = :username, email = :email WHERE id = :id",
           nativeQuery = true)
    void updateCredentials(@Param("id")       Long id,
                           @Param("username") String username,
                           @Param("email")    String email);

    // ── DELETE queries ────────────────────────────────────────

    /**
     * Delete a user account by ID.
     *
     * SQL: DELETE FROM app_user WHERE id = ?
     */
    @Modifying
    @Query(value = "DELETE FROM app_user WHERE id = :id", nativeQuery = true)
    void deleteUserById(@Param("id") Long id);
}