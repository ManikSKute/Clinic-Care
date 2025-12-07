package com.clinic.controller;

import com.clinic.dto.PrescriptionCreateRequest;
import com.clinic.entity.*;
import com.clinic.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctor")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;
    private final AppointmentService appointmentService;
    private final PrescriptionService prescriptionService;
    private final UserService userService;

    private Users getCurrentUser(@AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        return userService.getByUsername(user.getUsername());
    }

    private Doctors getCurrentDoctor(Users user) {
        return doctorService.getCurrentDoctor(user);
    }

    @GetMapping("/me")
    public ResponseEntity<Doctors> getMyProfile(@AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        return ResponseEntity.ok(getCurrentDoctor(getCurrentUser(user)));
    }

    @GetMapping("/appointments/today")
    public ResponseEntity<List<Appointments>> getTodayAppointments(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        Doctors doctor = getCurrentDoctor(getCurrentUser(user));
        return ResponseEntity.ok(appointmentService.getTodayAppointmentsForDoctor(doctor));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointments>> getAllMyAppointments(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        Doctors doctor = getCurrentDoctor(getCurrentUser(user));
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctor(doctor));
    }

    @PostMapping("/prescriptions")
    public ResponseEntity<Prescriptions> createPrescription(
            @RequestBody PrescriptionCreateRequest req,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        Prescriptions prescription = prescriptionService.createPrescription(
                req.appointmentId(), req.details(), getCurrentUser(user));
        return ResponseEntity.ok(prescription);
    }
    
    @PutMapping("/appointments/status/{id}")
    public ResponseEntity<Appointments> updateStatus(
            @PathVariable Long id,
            @RequestBody Status status,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        Appointments updated = appointmentService.updateStatus(id, status, userService.getByUsername(user.getUsername()));
        return ResponseEntity.ok(updated);
    }
}