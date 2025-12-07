package com.clinic.repo;

import com.clinic.entity.Doctors;
import com.clinic.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DoctorRepo extends JpaRepository<Doctors, Long> {
    Optional<Doctors> findByUser(Users user);
}