package br.com.glanz.eventmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
    private String token;
    private String role; // Role do usuário logado
    private Long userId; // ID do usuário logado
    private String username; // Nome do usuário logado
    private String email; // Email do usuário logado
}