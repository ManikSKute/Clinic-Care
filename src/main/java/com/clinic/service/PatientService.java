package com.clinic.service;

import com.clinic.entity.Patients;
import com.clinic.entity.Role;
import com.clinic.entity.Users;
import com.clinic.exception.ResourceNotFoundException;
import com.clinic.repo.PatientRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PatientService {

    private final PatientRepo patientRepo;
    private final UserService userService;

    // auth controller
    @Transactional
    public Patients registerPatient(Users user, Patients patient) {
        if (userService.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        user.setRole(Role.ROLE_PATIENT);
        Users savedUser = userService.createUser(user);
        patient.setUser(savedUser);
        return patientRepo.save(patient);
    }

    // patient controller
    public Patients getCurrentPatient(Users currentUser) {
        return patientRepo.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
    }
}