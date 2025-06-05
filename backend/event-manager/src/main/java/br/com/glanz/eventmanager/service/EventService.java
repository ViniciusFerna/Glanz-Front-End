package br.com.glanz.eventmanager.service;

import br.com.glanz.eventmanager.dto.EventRequestDTO;
import br.com.glanz.eventmanager.exception.ResourceNotFoundException;
import br.com.glanz.eventmanager.model.Event;
import br.com.glanz.eventmanager.model.User;
import br.com.glanz.eventmanager.repository.EventRepository;
import br.com.glanz.eventmanager.repository.UserRepository; // NOVO: Importar UserRepository
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventService {
    private final EventRepository eventRepository;
    private final UserRepository userRepository; // NOVO: Injetar UserRepository

    @Autowired
    public EventService(EventRepository eventRepository, UserRepository userRepository) { // NOVO: Adicionar UserRepository ao construtor
        this.eventRepository = eventRepository;
        this.userRepository = userRepository; // Atribuir
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }

    // Criar evento - agora recebe DTO e o usuário logado
    public Event createEvent(EventRequestDTO eventDTO, User creator) {
        Event event = new Event();
        // Copia as propriedades básicas do DTO para a entidade.
        // CUIDADO: BeanUtils.copyProperties copia todos os campos com o mesmo nome.
        // Se houver um campo 'id' no DTO, ele tentará sobrescrever o ID da entidade, o que não é desejável.
        // A melhor prática é mapear manualmente ou usar uma lib de mapeamento com exclusão de campos.
        BeanUtils.copyProperties(eventDTO, event);
        event.setCreator(creator); // Define o criador do evento como o usuário logado

        // NOVO: Associar o cliente contratante se o email for fornecido
        if (eventDTO.getContractingClientEmail() != null && !eventDTO.getContractingClientEmail().isEmpty()) {
            User contractingClient = userRepository.findByEmail(eventDTO.getContractingClientEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente com o email " + eventDTO.getContractingClientEmail() + " não encontrado."));
            event.setContractingClient(contractingClient);
        }

        return eventRepository.save(event);
    }

    // Atualizar evento - agora recebe DTO
    public Event updateEvent(Long id, EventRequestDTO eventDetailsDTO) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado com ID: " + id));

        // Copia as propriedades atualizáveis do DTO para a entidade existente.
        // EXCLUI 'id' e 'creator' da cópia para que não sejam alterados inadvertidamente.
        BeanUtils.copyProperties(eventDetailsDTO, event, "id", "creator");

        // NOVO: Atualizar o cliente contratante se o email for fornecido
        if (eventDetailsDTO.getContractingClientEmail() != null && !eventDetailsDTO.getContractingClientEmail().isEmpty()) {
            User contractingClient = userRepository.findByEmail(eventDetailsDTO.getContractingClientEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente com o email " + eventDetailsDTO.getContractingClientEmail() + " não encontrado."));
            event.setContractingClient(contractingClient);
        } else {
            // Se o email for passado como vazio ou nulo, desassocia o cliente
            event.setContractingClient(null);
        }

        return eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evento não encontrado com ID: " + id));
        eventRepository.delete(event);
    }

    // NOVO: Método para buscar eventos associados a um cliente contratante específico
    public List<Event> getEventsByContractingClient(User client) {
        // Isso exigirá um método no EventRepository: List<Event> findByContractingClient(User contractingClient);
        return eventRepository.findByContractingClient(client);
    }
}