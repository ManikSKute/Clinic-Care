package com.clinic.repo;

import com.clinic.entity.Appointments;
import com.clinic.entity.Doctors;
import com.clinic.entity.Patients;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepo extends JpaRepository<Appointments, Long> {

    List<Appointments> findByPatient(Patients patient);
    List<Appointments> findByDoctor(Doctors doctor);

    // For doctor's daily schedule
    List<Appointments> findByDoctorAndAppointmentDate(Doctors doctor, LocalDate date);

    // Check for double booking (critical!)
    boolean existsByDoctorAndAppointmentDateAndAppointmentTime(
            Doctors doctor, LocalDate date, LocalTime time);
}