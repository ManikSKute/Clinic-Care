package com.clinic.repo;

import com.clinic.entity.Prescriptions;
import com.clinic.entity.Patients;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrescriptionRepo extends JpaRepository<Prescriptions, Long> {

    List<Prescriptions> findByPatient(Patients patient);
}