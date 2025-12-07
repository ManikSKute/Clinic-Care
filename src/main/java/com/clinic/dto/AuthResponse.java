package com.clinic.dto;

public record AuthResponse(String token, String role, Long userId) {}