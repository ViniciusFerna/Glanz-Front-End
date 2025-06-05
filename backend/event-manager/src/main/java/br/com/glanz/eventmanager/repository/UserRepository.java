package br.com.glanz.eventmanager.repository;

import br.com.glanz.eventmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email); // Método para buscar usuário por e-mail
}