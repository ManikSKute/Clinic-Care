package com.clinic.service;

import com.clinic.entity.Users;
import com.clinic.exception.ResourceNotFoundException;
import com.clinic.repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    // auth controller
    @Transactional
    public Users createUser(Users user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepo.save(user);
    }

    // auth controller, doctor controller
    public Users getByUsername(String username) {
    	return userRepo.findByUsername(username)
    			.orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
    
    // doctor service
    public boolean existsByUsername(String username) {
    	return userRepo.existsByUsername(username);
    }
    
    // doctor service
    @Transactional
    public void deleteUser(Long id) {
    	if (!userRepo.existsById(id)) {
    		throw new ResourceNotFoundException("User not found: " + id);
    	}
    	userRepo.deleteById(id);
    }

}