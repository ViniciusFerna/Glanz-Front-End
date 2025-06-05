package br.com.glanz.eventmanager.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileUpdateDTO {
    @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
    private String name;

    @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
    private String phone;

    @Size(max = 255, message = "Localização deve ter no máximo 255 caracteres")
    private String location;

    @Size(max = 500, message = "Biografia deve ter no máximo 500 caracteres")
    private String bio;
}