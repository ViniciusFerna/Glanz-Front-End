package br.com.glanz.eventmanager.service;

import br.com.glanz.eventmanager.dto.UserProfileUpdateDTO;
import br.com.glanz.eventmanager.exception.ResourceNotFoundException;
import br.com.glanz.eventmanager.model.User;
import br.com.glanz.eventmanager.repository.UserRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder; // Importar PasswordEncoder
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder; // Injetar PasswordEncoder

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User updateUserProfile(Long userId, UserProfileUpdateDTO updateDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + userId));

        // Copia apenas os campos permitidos do DTO para a entidade
        BeanUtils.copyProperties(updateDTO, user, "id", "email", "password", "createdAt", "updatedAt", "roles");
        user.setUpdatedAt(LocalDateTime.now()); // Atualiza a data de modificação

        return userRepository.save(user);
    }

    public void changeUserPassword(Long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + userId));

        // Hashear a nova senha antes de salvar
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now()); // Atualiza a data de modificação
        userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + userId));

        // Importante: Antes de deletar o usuário, você pode precisar remover suas associações
        // na tabela user_roles para evitar erros de chave estrangeira, ou configurar
        // o relacionamento JPA para CascadeType.ALL ou OrphanRemoval = true (com cuidado).
        // Por simplicidade aqui, vamos deletar as roles manualmente primeiro se não configurado com CASCADE.
        user.getRoles().clear(); // Limpa as roles associadas para evitar problemas de integridade
        userRepository.save(user); // Salva para desassociar
        userRepository.delete(user);
    }

    // Método de placeholder para upload de avatar
    public void updateUserAvatarUrl(Long userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + userId));
        user.setAvatarUrl(avatarUrl);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}