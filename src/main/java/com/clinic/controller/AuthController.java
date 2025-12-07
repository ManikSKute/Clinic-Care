package com.clinic.controller;

import com.clinic.dto.*;
import com.clinic.entity.Patients;
import com.clinic.entity.Role;
import com.clinic.entity.Users;
import com.clinic.security.JwtUtil;
import com.clinic.service.PatientService;
import com.clinic.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final PatientService patientService;

    // Only for first admin! Remove or protect after first use
    @PostMapping("/register/admin")
    public ResponseEntity<AuthResponse> registerAdmin(@Valid @RequestBody RegisterRequest req) {
        Users user = new Users();
        user.setUsername(req.username());
        user.setPassword(req.password());
        user.setRole(Role.ROLE_ADMIN);
        
        Users saved = userService.createUser(user);
        String token = jwtUtil.generateToken(saved.getId(), saved.getUsername(), saved.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, "ADMIN", saved.getId()));
    }

    @PostMapping("/register/patient")
    public ResponseEntity<AuthResponse> registerPatient(@Valid @RequestBody PatientRegisterRequest req) {
        Users user = new Users();
        user.setUsername(req.username());
        user.setPassword(req.password());
        user.setRole(Role.ROLE_PATIENT);

        Patients patient = new Patients();
        patient.setName(req.name());
        patient.setAge(req.age());
        patient.setGender(req.gender());
        patient.setPhone(req.phone());
        patient.setEmail(req.email());
        patient.setAddress(req.address());
        patient.setMedicalHistory(req.medicalHistory());
        patient.setUser(user);

        Patients savedPatient = patientService.registerPatient(user, patient);
        String token = jwtUtil.generateToken(savedPatient.getUser().getId(), user.getUsername(), "ROLE_PATIENT");
        return ResponseEntity.ok(new AuthResponse(token, "PATIENT", savedPatient.getId()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.username(), req.password())
        );
        Users user = userService.getByUsername(req.username());
        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, user.getRole().name(), user.getId()));
    }
}