package br.com.glanz.eventmanager.controller;

import br.com.glanz.eventmanager.dto.ChangePasswordDTO;
import br.com.glanz.eventmanager.dto.EventResponseDTO; // NOVO: Importar EventResponseDTO
import br.com.glanz.eventmanager.dto.UserProfileUpdateDTO;
import br.com.glanz.eventmanager.dto.UserResponseDTO;
import br.com.glanz.eventmanager.exception.ResourceNotFoundException;
import br.com.glanz.eventmanager.model.Event; // NOVO: Importar Event
import br.com.glanz.eventmanager.model.User;
import br.com.glanz.eventmanager.repository.UserRepository;
import br.com.glanz.eventmanager.service.EventService; // NOVO: Importar EventService
import br.com.glanz.eventmanager.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List; // NOVO: Importar List
import java.util.stream.Collectors; // NOVO: Importar Collectors

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private EventService eventService; // NOVO: Injetar EventService

    // Endpoint para obter o perfil do usuário logado
    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getMyProfile(@AuthenticationPrincipal User loggedUser) {
        User user = userService.findById(loggedUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
        return ResponseEntity.ok(new UserResponseDTO(user));
    }

    // Endpoint para atualizar o perfil do usuário logado
    @PutMapping("/me")
    public ResponseEntity<UserResponseDTO> updateMyProfile(@AuthenticationPrincipal User loggedUser,
                                                           @Valid @RequestBody UserProfileUpdateDTO updateDTO) {
        User updatedUser = userService.updateUserProfile(loggedUser.getId(), updateDTO);
        return ResponseEntity.ok(new UserResponseDTO(updatedUser));
    }

    // Endpoint para alterar a senha do usuário logado
    @PutMapping("/me/password")
    public ResponseEntity<String> changeMyPassword(@AuthenticationPrincipal User loggedUser,
                                                   @Valid @RequestBody ChangePasswordDTO changePasswordDTO) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loggedUser.getEmail(), changePasswordDTO.getCurrentPassword())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Senha atual incorreta.");
        }

        userService.changeUserPassword(loggedUser.getId(), changePasswordDTO.getNewPassword());
        return ResponseEntity.ok("Senha alterada com sucesso.");
    }

    // Endpoint para deletar a própria conta
    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyAccount(@AuthenticationPrincipal User loggedUser) {
        userService.deleteUser(loggedUser.getId());
        return ResponseEntity.noContent().build();
    }

    // Opcional: Endpoint para upload de avatar (implementação básica)
    @PostMapping("/me/avatar")
    public ResponseEntity<String> uploadAvatar(@AuthenticationPrincipal User loggedUser,
                                               @RequestParam("file") MultipartFile file) throws IOException {
        String dummyUrl = "http://example.com/avatars/" + loggedUser.getId() + "_avatar.png";
        userService.updateUserAvatarUrl(loggedUser.getId(), dummyUrl);
        return ResponseEntity.ok(dummyUrl);
    }

    // NOVO: Endpoint para obter eventos associados ao usuário logado (CLIENTE)
    // Acesso liberado no SecurityConfig para ROLE_CLIENTE e ROLE_ADMIN
    @GetMapping("/me/contracted-events")
    public ResponseEntity<List<EventResponseDTO>> getMyContractedEvents(@AuthenticationPrincipal User loggedUser) {
        // O eventService.getEventsByContractingClient() buscará os eventos onde este loggedUser é o cliente contratante
        List<Event> events = eventService.getEventsByContractingClient(loggedUser);
        List<EventResponseDTO> dtos = events.stream()
                .map(EventResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}