package br.com.glanz.eventmanager.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;
    private String location;

    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    private String status = "PLANNING"; // Valores: PLANNING, CONFIRMED, CANCELLED
}