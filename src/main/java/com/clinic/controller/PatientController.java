package com.clinic.controller;

import com.clinic.dto.*;
import com.clinic.entity.*;
import com.clinic.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patient")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final DoctorService doctorService;
    private final AppointmentService appointmentService;
    private final PrescriptionService prescriptionService;
    private final UserService userService;

    private Users getCurrentUser(@AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        return userService.getByUsername(user.getUsername());
    }

    private Patients getCurrentPatient(Users user) {
        return patientService.getCurrentPatient(user);
    }

    @GetMapping("/me")
    public ResponseEntity<Patients> getMyProfile(@AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        return ResponseEntity.ok(getCurrentPatient(getCurrentUser(user)));
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctors>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors()); 
    }

    @PostMapping("/appointments")
    public ResponseEntity<Appointments> bookAppointment(
            @Valid @RequestBody AppointmentBookRequest req,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {

        Patients patient = getCurrentPatient(getCurrentUser(user));
        Appointments appointment = appointmentService.bookAppointment(
                req.doctorId(), patient, req.date(), req.time());
        return ResponseEntity.ok(appointment);
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointments>> getMyAppointments(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        Patients patient = getCurrentPatient(getCurrentUser(user));
        return ResponseEntity.ok(appointmentService.getAppointmentsByPatient(patient));
    }

    @GetMapping("/prescriptions")
    public ResponseEntity<List<Prescriptions>> getMyPrescriptions(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User user) {
        Patients patient = getCurrentPatient(getCurrentUser(user));
        return ResponseEntity.ok(prescriptionService.getByPatient(patient));
    }
}