document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Dados de login simulados (substitua pela integração com seu backend)
        const users = [
            { email: "admin@glanz.com", password: "admin123", name: "Administrador" },
            { email: "usuario@glanz.com", password: "user123", name: "Usuário Teste" }
        ];
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Simulação de autenticação
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Simulação de token JWT (substitua pelo token real do seu backend)
            const fakeToken = btoa(JSON.stringify({
                email: user.email,
                name: user.name,
                exp: Date.now() + 3600000 // Expira em 1 hora
            }));
            
            localStorage.setItem('authToken', fakeToken);
            localStorage.setItem('userName', user.name);
            
            alert('Login bem-sucedido! Redirecionando...');
            window.location.href = 'eventos.html';
        } else {
            alert('E-mail ou senha incorretos!');
        }
    });
    
    // Verificar se já está logado
    if (localStorage.getItem('authToken')) {
        window.location.href = 'eventos.html';
    }
});