package br.com.glanz.eventmanager.repository;

import br.com.glanz.eventmanager.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name); // Método para buscar role por nome
}