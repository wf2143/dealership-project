package com.dealership.controller;

import com.dealership.model.User;
import com.dealership.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping
    public List<User> getAll() {
        return service.getAll();
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        return ResponseEntity.ok(service.save(user));
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody Map<String, String> body) {
        return service.login(body.get("username"), body.get("password"))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(401).build());
    }

}