package com.saket.cnbank.Controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.saket.cnbank.Models.User;
import com.saket.cnbank.Requests.UserCreationRequest;
import com.saket.cnbank.Services.UserService;

@RestController()
@RequestMapping("/user")
public class UserController {
    @Autowired
    private UserService userService;

    @CrossOrigin(origins = "*")
    @GetMapping("/")
    public String index() {
        return "<h1>Welcome to the User Controller!</h1>";
    }

    @CrossOrigin(origins = "*")
    @GetMapping("/getjson")
    public Map<String, Object> getUser() {
        Map<String, Object> response = new HashMap<>();
        response.put("name", "Saket");
        response.put("email", "saket@gmail.com");
        response.put("username", "saket");
        response.put("password", "123456");
        response.put("success", true);
        return response;
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/signup")
    public Map<String, Object> createUser(@RequestBody UserCreationRequest request) {
        User existingUser = userService.getUserByUsername(request.getUsername());
        if (existingUser != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User already exists");
            response.put("success", false);
            return response;
        }
        User user = userService.createUser(request.getName(), request.getEmail(), request.getUsername(), request.getPassword());
        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("message", "User created successfully");
        response.put("success", true);
        return response;
    }

    @CrossOrigin(origins = "*")
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody UserCreationRequest request) {
        String token = userService.loginUser(request.getUsername(), request.getPassword());
        Map<String, Object> response = new HashMap<>();
        
        if (token != null) {
            response.put("username", request.getUsername());
            response.put("token", token);
            response.put("message", "Login successful");
            response.put("success", true);
        } else {
            response.put("message", "Invalid credentials");
            response.put("success", false);
        }
        return response;
    }

    
}
