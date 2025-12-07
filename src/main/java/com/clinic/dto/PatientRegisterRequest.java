package com.clinic.dto;

import com.clinic.entity.Gender;

public record PatientRegisterRequest(
		String username, 
		String password, 
		String name, 
		Integer age, 
		Gender gender,
		String phone, 
		String email, 
		String address, 
		String medicalHistory) {
}