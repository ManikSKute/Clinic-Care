package com.clinic.service;

import com.clinic.entity.*;
import com.clinic.exception.AccessDeniedException;
import com.clinic.exception.AlreadyBookedException;
import com.clinic.exception.ResourceNotFoundException;
import com.clinic.repo.AppointmentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AppointmentService {

    private final AppointmentRepo appointmentRepo;
    private final DoctorService doctorService;

    // patient controller
    @Transactional
    public Appointments bookAppointment(Long doctorId, Patients currentPatient, LocalDate date, LocalTime time) {
        Doctors doctor = doctorService.getDoctorById(doctorId);

        // Prevent double booking
        boolean alreadyBooked = appointmentRepo.existsByDoctorAndAppointmentDateAndAppointmentTime(doctor, date, time);
        if (alreadyBooked) {
            throw new AlreadyBookedException("This time slot is already booked");
        }

        Appointments appointment = new Appointments();
        appointment.setPatient(currentPatient);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(date);
        appointment.setAppointmentTime(time);
        appointment.setStatus(Status.PENDING);

        return appointmentRepo.save(appointment);
    }

    // prescription service
    public Appointments getAppointmentById(Long id) {
        return appointmentRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    }

    // patient controller
    public List<Appointments> getAppointmentsByPatient(Patients patient) {
        return appointmentRepo.findByPatient(patient);
    }

    // doctor controller 
    public List<Appointments> getAppointmentsByDoctor(Doctors doctor) {
        return appointmentRepo.findByDoctor(doctor);
    }

    // doctor controller
    public List<Appointments> getTodayAppointmentsForDoctor(Doctors doctor) {
        return appointmentRepo.findByDoctorAndAppointmentDate(doctor, LocalDate.now());
    }

    // doctor controller
    @Transactional
    public Appointments updateStatus(Long appointmentId, Status status, Users currentUser) {
        Appointments appointment = appointmentRepo.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        // Only doctor can update status
        boolean isDoctor = currentUser.getRole() == Role.ROLE_DOCTOR && appointment.getDoctor().getUser().equals(currentUser);

        if (!isDoctor) {
            throw new AccessDeniedException("You don't have permission to update this appointment");
        }

        appointment.setStatus(status);
        return appointmentRepo.save(appointment);
    }
}