package com.clinic.dto;

public record DoctorRegisterRequest(
		String username, 
		String password, 
		String name, 
		String specialization, 
		String phone,
		String email,
		String availabilityNotes
		) {
}