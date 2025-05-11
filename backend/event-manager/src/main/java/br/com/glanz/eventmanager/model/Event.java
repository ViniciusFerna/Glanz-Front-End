package br.com.glanz.eventmanager.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

@Entity
@Table(name = "event")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Título é obrigatório")
    @Size(max = 100, message = "Título deve ter no máximo 100 caracteres")
    private String title;

    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    private String description;

    @NotBlank(message = "Localização é obrigatória")
    @Size(max = 200, message = "Localização deve ter no máximo 200 caracteres")
    private String location;

    @Column(name = "event_date")
    private LocalDateTime eventDate;

    private String status; // Pode ser: "PLANEJADO", "EM_ANDAMENTO", "CONCLUIDO", "CANCELADO"

    // Construtor padrão necessário para o JPA
    public Event() {}

    // Construtor com parâmetros
    public Event(String title, String description, String location, LocalDateTime eventDate, String status) {
        this.title = title;
        this.description = description;
        this.location = location;
        this.eventDate = eventDate;
        this.status = status;
    }

    // Getters e Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public LocalDateTime getEventDate() { return eventDate; }
    public void setEventDate(LocalDateTime eventDate) { this.eventDate = eventDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}