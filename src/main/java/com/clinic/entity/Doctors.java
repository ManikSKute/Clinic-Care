package com.clinic.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "doctors")
@Data
public class Doctors {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private Users user;

    @Column(nullable = false)
    private String name;

    private String specialization;
    private String phone;
    private String email;
    private String availabilityNotes;
}