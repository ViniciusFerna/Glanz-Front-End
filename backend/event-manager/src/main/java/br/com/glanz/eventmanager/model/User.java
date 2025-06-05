package br.com.glanz.eventmanager.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "users") // Renomeado para evitar conflito com palavra reservada 'user'
@Data // Gerencia getters, setters, equals, hashCode, toString (do Lombok)
@NoArgsConstructor // Construtor sem argumentos (do Lombok)
@AllArgsConstructor // Construtor com todos os argumentos (do Lombok)
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    @Size(max = 100, message = "Nome deve ter no máximo 100 caracteres")
    private String name;

    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail inválido")
    @Column(unique = true) // Garante que o e-mail seja único
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    private String password; // A senha será armazenada HASHADA

    @Size(max = 20, message = "Telefone deve ter no máximo 20 caracteres")
    private String phone;

    @Size(max = 50, message = "Gênero deve ter no máximo 50 caracteres")
    private String gender;

    @Size(max = 255, message = "Localização deve ter no máximo 255 caracteres")
    private String location; // Novo campo para localização do usuário

    @Column(columnDefinition = "TEXT") // TEXT para biografia mais longa
    private String bio; // Novo campo para biografia do usuário

    private String avatarUrl; // URL da imagem do perfil

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // Data de criação do usuário

    @Column(name = "updated_at")
    private LocalDateTime updatedAt; // Data da última atualização do usuário

    @ManyToMany(fetch = FetchType.EAGER) // Carrega as roles junto com o usuário
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles;

    // Métodos do UserDetails (necessários para o Spring Security)
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Converte as roles do usuário para GrantedAuthority
        return this.roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toList());
    }

    @Override
    public String getUsername() {
        return this.email; // Usamos o e-mail como username para autenticação
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Conta nunca expira
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Conta nunca é bloqueada
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Credenciais nunca expiram
    }

    @Override
    public boolean isEnabled() {
        return true; // Conta está sempre habilitada
    }

    // Callbacks JPA para gerenciar datas
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now(); // Definido automaticamente na criação
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now(); // Definido automaticamente na atualização
    }
}