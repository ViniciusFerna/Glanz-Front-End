package br.com.glanz.eventmanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterDTO {
    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
    private String name;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres")
    private String password;

    @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
    private String phone;

    @Size(max = 50, message = "Gênero deve ter no máximo 50 caracteres")
    private String gender;

    // NOVO: Adicione os campos 'location' e 'bio' ao DTO
    @Size(max = 255, message = "Localização deve ter no máximo 255 caracteres")
    private String location;

    @Size(max = 500, message = "Biografia deve ter no máximo 500 caracteres")
    private String bio;

    // Role para registro (pode ser padrão ou configurável pelo frontend)
    private String role;
}