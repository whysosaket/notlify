package com.saket.cnbank.Config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.saket.cnbank.Services.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        // Skip authentication for login and signup endpoints
        if (request.getRequestURI().contains("/user/login") || 
            request.getRequestURI().contains("/user/signup") ||
            request.getRequestURI().contains("/user/")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Missing or invalid Authorization header");
            return;
        }

        String jwt = authHeader.substring(7);
        if (!jwtService.validateToken(jwt)) {
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired JWT token");
            return;
        }

        // Add username to request attributes for use in controllers
        request.setAttribute("username", jwtService.extractUsername(jwt));
        filterChain.doFilter(request, response);
    }

    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write(objectMapper.writeValueAsString(
            new ErrorResponse(status, message)
        ));
    }

    private static class ErrorResponse {
        private final int status;
        private final String error;

        public ErrorResponse(int status, String message) {
            this.status = status;
            this.error = message;
        }

        public int getStatus() {
            return status;
        }
        
        public String getError() {
            return error;
        }
    }
} 