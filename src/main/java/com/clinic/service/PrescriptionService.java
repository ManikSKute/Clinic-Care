package com.clinic.service;

import com.clinic.entity.*;
import com.clinic.repo.PrescriptionRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PrescriptionService {

	private final PrescriptionRepo prescriptionRepo;
	private final AppointmentService appointmentService;

	// doctor controller
	@Transactional
	public Prescriptions createPrescription(Long appointmentId, String details, Users currentDoctorUser) {
		Appointments appointment = appointmentService.getAppointmentById(appointmentId);

		Prescriptions prescription = new Prescriptions();
		prescription.setAppointment(appointment);
		prescription.setDoctor(appointment.getDoctor());
		prescription.setPatient(appointment.getPatient());
		prescription.setDetails(details);

		return prescriptionRepo.save(prescription);
	}

	// patient controller
	public List<Prescriptions> getByPatient(Patients patient) {
		return prescriptionRepo.findByPatient(patient);
	}
}