package br.com.glanz.eventmanager.controller;

import br.com.glanz.eventmanager.config.TokenService;
import br.com.glanz.eventmanager.dto.AuthenticationDTO;
import br.com.glanz.eventmanager.dto.LoginResponseDTO;
import br.com.glanz.eventmanager.dto.RegisterDTO;
import br.com.glanz.eventmanager.model.Role;
import br.com.glanz.eventmanager.model.User;
import br.com.glanz.eventmanager.model.enums.UserRole; // Importar UserRole
import br.com.glanz.eventmanager.repository.RoleRepository;
import br.com.glanz.eventmanager.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid AuthenticationDTO data){
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.getEmail(), data.getPassword());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        User user = (User) auth.getPrincipal();
        String token = tokenService.generateToken(user);

        String userRoleName = user.getRoles().stream()
                .findFirst()
                .map(Role::getName)
                .orElse("UNKNOWN");

        return ResponseEntity.ok(new LoginResponseDTO(token, userRoleName, user.getId(), user.getName(), user.getEmail()));
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody @Valid RegisterDTO data){
        if(this.userRepository.findByEmail(data.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email já cadastrado.");
        }

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.getPassword());

        // AQUI: Usamos UserRole.CLIENTE.name() para buscar/criar a role.
        // O .name() do enum retorna o nome da constante (ADMIN, CLIENTE).
        // Se você quer o valor da string do construtor ("ROLE_ADMIN", "ROLE_CLIENTE"), use .getRole().
        // Recomendo usar .getRole() aqui para maior clareza, pois é o valor que o Spring Security espera.
        Optional<Role> clienteRoleOptional = roleRepository.findByName(UserRole.CLIENTE.getRole()); // <--- MUDANÇA RECOMENDADA AQUI
        Role clienteRole = clienteRoleOptional.orElseGet(() -> {
            // Se a role não existir, cria ela com o nome correto
            Role newRole = new Role(null, UserRole.CLIENTE.getRole()); // <--- MUDANÇA RECOMENDADA AQUI
            return roleRepository.save(newRole);
        });

        User newUser = new User();
        newUser.setName(data.getName());
        newUser.setEmail(data.getEmail());
        newUser.setPassword(encryptedPassword);
        newUser.setPhone(data.getPhone());
        newUser.setGender(data.getGender());
        newUser.setLocation(data.getLocation());
        newUser.setBio(data.getBio());

        // Garante que o novo usuário tenha a role ROLE_CLIENTE
        newUser.setRoles(Collections.singleton(clienteRole));

        // @PrePersist já cuida disso, mas mantido para clareza
        newUser.setCreatedAt(LocalDateTime.now());
        newUser.setUpdatedAt(LocalDateTime.now());

        this.userRepository.save(newUser);

        return ResponseEntity.status(HttpStatus.CREATED).body("Usuário registrado com sucesso!");
    }
}