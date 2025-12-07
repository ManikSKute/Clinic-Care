package com.clinic.repo;

import com.clinic.entity.Patients;
import com.clinic.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PatientRepo extends JpaRepository<Patients, Long> {
    Optional<Patients> findByUser(Users user);
}