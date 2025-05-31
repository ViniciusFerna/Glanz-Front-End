document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const forgotPasswordModal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');
    
    // Alternar visibilidade da senha
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });
    
    // Abrir modal de esqueci a senha
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        forgotPasswordModal.show();
    });
    
    // Submissão do formulário de login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Exibir loading
        const loginText = document.getElementById('loginText');
        const loginSpinner = document.getElementById('loginSpinner');
        loginText.classList.add('d-none');
        loginSpinner.classList.remove('d-none');
        
        // Simular requisição AJAX (substituir por chamada real à API)
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        setTimeout(() => {
            // Simular resposta da API
            if (email === 'admin@glanz.com' && password === '123456') {
                // Login bem-sucedido - redirecionar para home
                window.location.href = 'index.html';
            } else {
                // Exibir erro
                loginError.textContent = 'E-mail ou senha incorretos. Tente novamente.';
                loginError.classList.remove('d-none');
                
                // Resetar loading
                loginText.classList.remove('d-none');
                loginSpinner.classList.add('d-none');
            }
        }, 1500);
    });
    
    // Submissão do formulário de recuperação de senha
    document.getElementById('forgotPasswordForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('recoveryEmail').value;
        
        // Simular envio de e-mail (substituir por chamada real à API)
        console.log('Solicitação de recuperação para:', email);
        
        // Feedback ao usuário
        alert(`Um link de recuperação foi enviado para ${email} (simulado)`);
        forgotPasswordModal.hide();
    });
    
    // Validação em tempo real
    document.getElementById('email').addEventListener('input', function() {
        if (this.validity.typeMismatch) {
            this.setCustomValidity('Por favor, insira um e-mail válido');
        } else {
            this.setCustomValidity('');
        }
    });
});