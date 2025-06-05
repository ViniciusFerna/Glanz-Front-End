package br.com.glanz.eventmanager.config;

import br.com.glanz.eventmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthorizationService implements UserDetailsService {

    @Autowired
    UserRepository repository;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Este método é usado pelo Spring Security para carregar os detalhes do usuário
        // durante o processo de autenticação (antes do JWT ser gerado, no login).
        // Também é usado pelo SecurityFilter para carregar o usuário a partir do token.
        return repository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + username));
    }
}