document.addEventListener('DOMContentLoaded', function() {
    // Importa as funções do auth.js (ou assume que auth.js já foi carregado globalmente)
    // const { API_BASE_URL, saveToken, getToken } = window; // Assumindo que auth.js exporta
    
    // Elementos do DOM
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const forgotPasswordModal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');
    const rememberMeCheckbox = document.getElementById('rememberMe'); // Captura o checkbox

    // URLs da API (usando a constante global de auth.js)
    const API_BASE_URL = 'http://localhost:8080'; // Certifique-se de que esta linha exista em auth.js

    // Função para exibir toast (copie da sua função global ou de eventos.js/perfil.js)
    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = `toast-message ${isError ? 'error' : ''}`;
        toast.innerHTML = `
            <i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // Alternar visibilidade da senha
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }
    
    // Abrir modal de esqueci a senha
    if (forgotPasswordLink && forgotPasswordModal) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            forgotPasswordModal.show();
        });
    }
    
    // Submissão do formulário de login (AGORA COM REQUISIÇÃO REAL AO BACKEND)
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const loginText = document.getElementById('loginText');
            const loginSpinner = document.getElementById('loginSpinner');
            loginText.classList.add('d-none');
            loginSpinner.classList.remove('d-none');
            loginError.classList.add('d-none'); // Oculta erros anteriores
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = rememberMeCheckbox.checked; // Pega o estado do checkbox

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    saveToken(data.token, rememberMe); // Salva o token
                    showToast('Login realizado com sucesso!');
                    window.location.href = 'index.html'; // Redireciona para home
                } else {
                    const errorData = await response.json().catch(() => ({ message: 'Credenciais inválidas.' }));
                    loginError.textContent = errorData.message || 'E-mail ou senha incorretos.';
                    loginError.classList.remove('d-none');
                }
            } catch (err) {
                console.error('Erro na requisição de login:', err);
                loginError.textContent = 'Erro de conexão com o servidor. Tente novamente mais tarde.';
                loginError.classList.remove('d-none');
            } finally {
                loginText.classList.remove('d-none');
                loginSpinner.classList.add('d-none');
            }
        });
    }
    
    // Submissão do formulário de recuperação de senha (simulado, como antes)
    document.getElementById('forgotPasswordForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('recoveryEmail').value;
        
        console.log('Solicitação de recuperação para:', email);
        
        alert(`Um link de recuperação foi enviado para ${email} (simulado)`);
        forgotPasswordModal.hide();
    });
    
    // Validação em tempo real (manter)
    document.getElementById('email').addEventListener('input', function() {
        if (this.validity.typeMismatch) {
            this.setCustomValidity('Por favor, insira um e-mail válido');
        } else {
            this.setCustomValidity('');
        }
    });
});