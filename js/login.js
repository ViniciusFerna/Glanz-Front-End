// js/login.js

document.addEventListener('DOMContentLoaded', function() {
    // API_BASE_URL e showToast são assumidos como globais via js/utils.js
    const API_BASE_URL = 'http://localhost:8080'; // <-- CORRIGIDO!
    const showToast = window.showToast;
    const saveToken = window.saveToken;
    
    // Elementos do DOM
    const loginForm = document.getElementById('loginForm');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const forgotPasswordModal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
    const togglePassword = document.querySelector('.toggle-password');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');
    const rememberMeCheckbox = document.getElementById('rememberMe'); 

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
    
    // Submissão do formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const loginText = document.getElementById('loginText');
            const loginSpinner = document.getElementById('loginSpinner');
            loginText.classList.add('d-none');
            loginSpinner.classList.remove('d-none');
            loginError.classList.add('d-none'); 
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = rememberMeCheckbox.checked; 

            try {
                const response = await fetch(`${API_BASE_URL}/user/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    saveToken(data.token, rememberMe); 
                    
                    showToast('Login realizado com sucesso!');
                    window.location.href = 'index.html'; 
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
    
    // Submissão do formulário de recuperação de senha (simulado)
    document.getElementById('forgotPasswordForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('recoveryEmail').value;
        
        console.log('Solicitação de recuperação para:', email);
        
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