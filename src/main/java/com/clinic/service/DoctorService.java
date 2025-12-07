package com.clinic.service;

import com.clinic.entity.Doctors;
import com.clinic.entity.Role;
import com.clinic.entity.Users;
import com.clinic.exception.ResourceNotFoundException;
import com.clinic.repo.DoctorRepo;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DoctorService {

    private final DoctorRepo doctorRepo;
    private final UserService userService;

    // admin controller
    @Transactional
    public Doctors registerDoctor(Users user, Doctors doctor) {
        if (userService.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        user.setRole(Role.ROLE_DOCTOR);
        Users savedUser = userService.createUser(user);
        doctor.setUser(savedUser);
        return doctorRepo.save(doctor);
    }

    // doctor controller
    public Doctors getCurrentDoctor(Users currentUser) {
        return doctorRepo.findByUser(currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
    }

    // admin controller, patient controller
	public List<Doctors> getAllDoctors() {
		return doctorRepo.findAll();
	}
	
	// admin controller
	@Transactional
	public String deleteDoctor(Long id) {
	    Doctors doctor = getDoctorById(id);
	    userService.deleteUser(doctor.getUser().getId());
	    doctorRepo.delete(doctor);
	    return "Doctor deleted successfully";
	}

    public Doctors getDoctorById(Long id) {
        return doctorRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found: " + id));
    }
}