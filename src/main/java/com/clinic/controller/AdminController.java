package com.clinic.controller;

import com.clinic.dto.DoctorRegisterRequest;
import com.clinic.entity.*;
import com.clinic.service.*;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final DoctorService doctorService;

    // View Doctors
    @GetMapping("/doctors")
    public ResponseEntity<List<Doctors>> viewDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    // Add Doctor
    @PostMapping("/doctor")
    public ResponseEntity<Doctors> addDoctor(@RequestBody DoctorRegisterRequest req) {
        Users user = new Users();
        user.setUsername(req.username());
        user.setPassword(req.password());

        Doctors doctor = new Doctors();
        doctor.setName(req.name());
        doctor.setSpecialization(req.specialization());
        doctor.setEmail(req.email());
        doctor.setPhone(req.phone());
        doctor.setAvailabilityNotes(req.availabilityNotes());

        return ResponseEntity.ok(doctorService.registerDoctor(user, doctor));
    }

    // Delete Doctor
    @DeleteMapping("/doctor/{id}")
    public ResponseEntity<String> deleteDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(doctorService.deleteDoctor(id));
    }
}
