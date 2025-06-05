package br.com.glanz.eventmanager.controller;

import br.com.glanz.eventmanager.dto.EventRequestDTO;
import br.com.glanz.eventmanager.dto.EventResponseDTO;
import br.com.glanz.eventmanager.exception.ResourceNotFoundException;
import br.com.glanz.eventmanager.model.Event;
import br.com.glanz.eventmanager.model.User;
import br.com.glanz.eventmanager.service.EventService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventService eventService;

    @Autowired
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // Retorna todos os eventos (acessível por qualquer um)
    @GetMapping
    public ResponseEntity<List<EventResponseDTO>> getAllEvents() {
        List<Event> events = eventService.getAllEvents();
        List<EventResponseDTO> dtos = events.stream()
                .map(EventResponseDTO::new) // Converte Event para EventResponseDTO
                .collect(Collectors.toList());
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    // Retorna um evento específico por ID (acessível por qualquer um)
    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDTO> getEventById(@PathVariable Long id) {
        // Usa orElseThrow para lançar ResourceNotFoundException se o evento não for encontrado
        return eventService.getEventById(id)
                .map(event -> new ResponseEntity<>(new EventResponseDTO(event), HttpStatus.OK))
                .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado com ID: " + id));
    }

    // Cria um novo evento (APENAS ADMIN)
    // O @AuthenticationPrincipal injeta o objeto User do usuário logado
    @PostMapping
    public ResponseEntity<EventResponseDTO> createEvent(@Valid @RequestBody EventRequestDTO eventDTO,
                                                        @AuthenticationPrincipal User loggedUser) {
        // Validações de permissão já estão no SecurityConfig, mas podemos adicionar aqui também.
        // Aqui, garantimos que o criador do evento seja o usuário logado
        // A lógica do service foi atualizada para receber o loggedUser
        Event createdEvent = eventService.createEvent(eventDTO, loggedUser);
        return new ResponseEntity<>(new EventResponseDTO(createdEvent), HttpStatus.CREATED);
    }

    // Atualiza um evento existente (APENAS ADMIN)
    @PutMapping("/{id}")
    public ResponseEntity<EventResponseDTO> updateEvent(@PathVariable Long id,
                                                        @Valid @RequestBody EventRequestDTO eventDetailsDTO,
                                                        @AuthenticationPrincipal User loggedUser) {
        // Aqui, além da role ADMIN, você pode adicionar uma lógica para verificar se o loggedUser
        // é o criador do evento se quiser que apenas criadores editem seus próprios eventos.
        // Para este cenário, como você disse que ADMIN edita TUDO, a regra no SecurityConfig basta.
        Event updatedEvent = eventService.updateEvent(id, eventDetailsDTO);
        return new ResponseEntity<>(new EventResponseDTO(updatedEvent), HttpStatus.OK);
    }

    // Remove um evento (APENAS ADMIN)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        // A lógica do service foi atualizada para lançar ResourceNotFoundException
        eventService.deleteEvent(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // Novo endpoint para eventos de um usuário específico (se necessário no futuro)
    // @GetMapping("/my-events")
    // public ResponseEntity<List<EventResponseDTO>> getMyEvents(@AuthenticationPrincipal User loggedUser) {
    //     List<Event> myEvents = eventService.getEventsByCreator(loggedUser);
    //     List<EventResponseDTO> dtos = myEvents.stream()
    //             .map(EventResponseDTO::new)
    //             .collect(Collectors.toList());
    //     return new ResponseEntity<>(dtos, HttpStatus.OK);
    // }
}