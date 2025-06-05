package br.com.glanz.eventmanager.dto;

import br.com.glanz.eventmanager.model.Role;
import br.com.glanz.eventmanager.model.User; // Importar a entidade User
import lombok.AllArgsConstructor; // Manter
import lombok.Data; // Manter
import lombok.NoArgsConstructor; // Manter

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors; // Necessário para o .stream().collect() das roles

@Data
@NoArgsConstructor
@AllArgsConstructor // Esta anotação do Lombok gera um construtor com todos os campos do DTO
public class UserResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String gender;
    private String location;
    private String bio;
    private String avatarUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt; // Adicione este campo se quiser retornar a data de atualização
    private Set<Role> roles; // Inclui as roles do usuário

    // NOVO: Construtor para mapear de entidade User para UserResponseDTO
    // Este construtor é essencial para resolver o erro no UserController
    public UserResponseDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.phone = user.getPhone();
        this.gender = user.getGender();
        this.location = user.getLocation();
        this.bio = user.getBio();
        this.avatarUrl = user.getAvatarUrl();
        this.createdAt = user.getCreatedAt();
        this.updatedAt = user.getUpdatedAt(); // Popula o campo updatedAt, se existir no DTO

        // Mapeia as roles do User para o DTO
        if (user.getRoles() != null) {
            this.roles = user.getRoles().stream().collect(Collectors.toSet());
        }
    }
}