package br.com.glanz.eventmanager.dto;

import br.com.glanz.eventmanager.model.Event;
import br.com.glanz.eventmanager.model.enums.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String location;
    private LocalDateTime eventDate;
    private EventStatus status;
    private String imageUrl;
    private Long creatorId;
    private String creatorName;

    // NOVO CAMPO: Dados do cliente contratante
    private Long contractingClientId;
    private String contractingClientName;
    private String contractingClientEmail;


    public EventResponseDTO(Event event) {
        this.id = event.getId();
        this.title = event.getTitle();
        this.description = event.getDescription();
        this.location = event.getLocation();
        this.eventDate = event.getEventDate();
        this.status = event.getStatus();
        this.imageUrl = event.getImageUrl();

        if (event.getCreator() != null) {
            this.creatorId = event.getCreator().getId();
            this.creatorName = event.getCreator().getName();
        }

        // POPULAR NOVOS CAMPOS DO CLIENTE CONTRATANTE
        if (event.getContractingClient() != null) {
            this.contractingClientId = event.getContractingClient().getId();
            this.contractingClientName = event.getContractingClient().getName();
            this.contractingClientEmail = event.getContractingClient().getEmail();
        }
    }
}