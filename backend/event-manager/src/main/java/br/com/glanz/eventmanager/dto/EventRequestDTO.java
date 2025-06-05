package br.com.glanz.eventmanager.dto;

import br.com.glanz.eventmanager.model.enums.EventStatus;
import jakarta.validation.constraints.Email; // Importar Email
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventRequestDTO {
    @NotBlank(message = "Título é obrigatório")
    @Size(max = 100, message = "Título deve ter no máximo 100 caracteres")
    private String title;

    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    private String description;

    @NotBlank(message = "Localização é obrigatória")
    @Size(max = 200, message = "Localização deve ter no máximo 200 caracteres")
    private String location;

    @NotNull(message = "Data do evento é obrigatória")
    private LocalDateTime eventDate;

    @NotNull(message = "Status do evento é obrigatório")
    private EventStatus status;

    private String imageUrl;

    // NOVO CAMPO: Email do cliente contratante (opcional no DTO de requisição)
    @Email(message = "Email do cliente contratante inválido")
    @Size(max = 100, message = "Email do cliente contratante deve ter no máximo 100 caracteres")
    private String contractingClientEmail; // Para o ADMIN enviar o email do cliente
}