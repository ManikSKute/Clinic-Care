package com.clinic.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentBookRequest(Long doctorId, LocalDate date, LocalTime time) {}