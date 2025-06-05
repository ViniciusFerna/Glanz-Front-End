package br.com.glanz.eventmanager.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer; // Importar Customizer
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    SecurityFilter securityFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        return httpSecurity
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        // Permitir todas as requisições OPTIONS (para CORS preflight)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Permite acesso a endpoints de autenticação e registro sem autenticação
                        .requestMatchers(HttpMethod.POST, "/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/register").permitAll()

                        // Endpoints de Usuários (protegidos):
                        // GET /api/users/me exige autenticação (CLIENTE ou ADMIN)
                        .requestMatchers(HttpMethod.GET, "/api/users/me").hasAnyRole("ADMIN", "CLIENTE")
                        // Atualizar informações do próprio perfil (exceto senha)
                        .requestMatchers(HttpMethod.PUT, "/api/users/me").hasAnyRole("ADMIN", "CLIENTE")
                        // Alterar a própria senha
                        .requestMatchers(HttpMethod.PUT, "/api/users/me/password").hasAnyRole("ADMIN", "CLIENTE")
                        // Deletar a própria conta
                        .requestMatchers(HttpMethod.DELETE, "/api/users/me").hasAnyRole("ADMIN", "CLIENTE")

                        // Endpoints de Eventos:
                        // GET de todos os eventos e por ID podem ser acessados por qualquer um (incluindo não autenticados)
                        .requestMatchers(HttpMethod.GET, "/api/events").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/events/{id}").permitAll()

                        // POST, PUT, DELETE de eventos exigem ROLE_ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/events").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/events/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/events/{id}").hasRole("ADMIN")


                        // Qualquer outra requisição exige autenticação
                        .anyRequest().authenticated()
                )
                .addFilterBefore(securityFilter, UsernamePasswordAuthenticationFilter.class)
                .cors(Customizer.withDefaults()) // <--- ADICIONE ESTA LINHA para habilitar o CORS com a sua configuração
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}