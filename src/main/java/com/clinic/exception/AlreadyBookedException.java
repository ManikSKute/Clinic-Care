package com.clinic.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class AlreadyBookedException extends RuntimeException {
	private static final long serialVersionUID = 1L;

	public AlreadyBookedException(String message) {
        super(message);
    }
}
