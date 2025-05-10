package br.com.glanz.eventmanager.repository;

import br.com.glanz.eventmanager.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<Event, Long> {
}