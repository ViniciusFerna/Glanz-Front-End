package br.com.glanz.eventmanager.repository;

import br.com.glanz.eventmanager.model.Event;
import br.com.glanz.eventmanager.model.User; // Importar User
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    // Custom queries can be added here
    List<Event> findByContractingClient(User contractingClient); // NOVO MÉTODO: Encontra eventos por cliente contratante
}