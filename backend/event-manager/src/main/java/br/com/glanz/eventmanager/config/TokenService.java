package br.com.glanz.eventmanager.config;

import br.com.glanz.eventmanager.model.User;
import io.jsonwebtoken.Jwts; // Importação correta para o JWT Builder/Parser
import io.jsonwebtoken.SignatureAlgorithm; // Importação correta para algoritmos de assinatura
import io.jsonwebtoken.security.Keys; // Importação para geração segura de chaves
import io.jsonwebtoken.JwtException; // Importação para exceções gerais do JWT
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey; // Importa SecretKey

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date; // Usaremos Date para `withExpiration`

@Service
public class TokenService {

    @Value("${api.security.token.secret}")
    private String secret; // Este é o SECRET em formato String do application.properties

    // Chave segura gerada a partir do secret para uso com JJWT
    private SecretKey key;

    // Construtor ou método @PostConstruct para inicializar a chave
    public TokenService(@Value("${api.security.token.secret}") String secret) {
        this.secret = secret;
        // Garante que a chave tenha pelo menos 256 bits (32 bytes) para HMACSHA256
        if (secret.length() < 32) {
            throw new IllegalArgumentException("JWT Secret key must be at least 32 characters long for HS256.");
        }
        // Converte a String secret para um SecretKey seguro
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(User user){
        try{
            // Tempo de expiração em milissegundos
            long expirationTimeMillis = LocalDateTime.now().plusHours(2).toInstant(ZoneOffset.of("-03:00")).toEpochMilli();
            Date expirationDate = new Date(expirationTimeMillis);

            String token = Jwts.builder()
                    .issuer("glanz-event-manager") // Emissor do token
                    .subject(user.getEmail()) // Assunto: o email do usuário
                    .claim("role", user.getRoles().iterator().next().getName()) // Adiciona a role como claim (supondo 1 role por enquanto)
                    .claim("userId", user.getId()) // Adiciona o ID do usuário como claim
                    .claim("userName", user.getName()) // Adiciona o nome do usuário como claim
                    .issuedAt(Date.from(Instant.now())) // Data de emissão
                    .expiration(expirationDate) // Define o tempo de expiração
                    .signWith(key, SignatureAlgorithm.HS256) // Assina com a chave e algoritmo HS256
                    .compact(); // Compacta o token em uma string JWT

            return token;
        } catch (JwtException | IllegalArgumentException e) { // Pega as exceções específicas do JJWT e IllegalArgumentException
            throw new RuntimeException("Erro ao gerar token: " + e.getMessage(), e);
        }
    }

    public String validateToken(String token){
        try {
            // Cria um parser que confia na nossa chave de assinatura
            return Jwts.parser()
                    .setSigningKey(key) // Define a chave de assinatura para validação
                    .build() // Constrói o parser
                    .parseClaimsJws(token) // Analisa e valida o token JWT
                    .getBody() // Obtém o corpo (claims) do token
                    .getSubject(); // Retorna o subject (email do usuário) se válido
        } catch (JwtException e){ // Captura qualquer exceção do JJWT (incluindo expiração e inválido)
            // Se o token for inválido ou expirado, retorna null ou uma string vazia
            System.err.println("Token validation error: " + e.getMessage()); // Para depuração
            return "";
        }
    }
}