// js/cadastro.js

document.addEventListener('DOMContentLoaded', function () {
    // API_BASE_URL e showToast são assumidos como globais via js/utils.js
    // const API_BASE_URL = 'http://localhost:8080'; 
    // function showToast(message, isError = false) { /* ... implementação ... */ }

    // Elementos do DOM
    const cadastroForm = document.getElementById('cadastroForm');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const passwordStrength = document.getElementById('passwordStrength');
    const passwordMatchText = document.getElementById('passwordMatchText');
    const cadastroError = document.getElementById('cadastroError');
    const generoSelect = document.getElementById('genero');

    // Verificar força da senha
    senhaInput.addEventListener('input', function () {
        const password = this.value;
        let strength = 0;

        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 25;
        if (/[A-Z]/.test(password)) strength += 15;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^A-Za-z0-9]/.test(password)) strength += 20;

        passwordStrength.style.width = strength + '%';

        if (strength < 50) {
            passwordStrength.style.backgroundColor = '#e74c3c'; // Vermelho (fraca)
        } else if (strength < 75) {
            passwordStrength.style.backgroundColor = '#f39c12'; // Laranja (média)
        } else {
            passwordStrength.style.backgroundColor = '#2ecc71'; // Verde (forte)
        }
    });

    // Verificar correspondência de senhas
    confirmarSenhaInput.addEventListener('input', function () {
        if (senhaInput.value !== this.value) {
            passwordMatchText.textContent = 'As senhas não coincidem';
            passwordMatchText.style.color = '#e74c3c';
        } else {
            passwordMatchText.textContent = 'As senhas coincidem';
            passwordMatchText.style.color = '#2ecc71';
        }
    });

    // Submissão do formulário
    cadastroForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        cadastroError.classList.add('d-none');

        // Validação de senhas
        if (senhaInput.value !== confirmarSenhaInput.value) {
            cadastroError.textContent = 'As senhas não coincidem.';
            cadastroError.classList.remove('d-none');
            return;
        }

        // Validação dos termos de serviço
        const termosCheckbox = document.getElementById('termos');
        if (!termosCheckbox || !termosCheckbox.checked) { // Adicionada verificação de existência do elemento
            cadastroError.textContent = 'Você deve aceitar os termos de serviço.';
            cadastroError.classList.remove('d-none');
            return;
        }

        // Exibir loading
        const cadastroText = document.getElementById('cadastroText');
        const cadastroSpinner = document.getElementById('cadastroSpinner');
        if (cadastroText) cadastroText.classList.add('d-none');
        if (cadastroSpinner) cadastroSpinner.classList.remove('d-none');

        // Coletar dados do formulário
        const name = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('telefone').value;
        const gender = generoSelect.value;
        const password = senhaInput.value;
        const location = document.getElementById('localizacao') ? document.getElementById('localizacao').value : ''; // Garante que não falha se campo não existir
        const bio = document.getElementById('bio') ? document.getElementById('bio').value : ''; // Garante que não falha se campo não existir

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    phone,
                    email,
                    password,
                    gender,
                    location,
                    bio,      
                    role: "CLIENTE" 
                })
            });

            if (response.ok) {
                // Mensagem de sucesso visível para o usuário
                if (typeof showToast === 'function') { // Verifica se showToast é uma função global
                    showToast('Conta criada com sucesso! Redirecionando para o login...', false); 
                } else {
                    alert('Conta criada com sucesso! Você será redirecionado para o login.'); // Fallback se showToast não for global
                }
                
                cadastroForm.reset(); 
                setTimeout(() => {
                    window.location.href = 'login.html'; 
                }, 2000); 
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido ao cadastrar.' }));
                console.error('Erro na resposta do backend:', errorData);
                cadastroError.textContent = errorData.message || 'Erro ao cadastrar. Verifique os dados e tente novamente.';
                cadastroError.classList.remove('d-none');
            }
        } catch (err) {
            console.error('Erro na requisição de cadastro:', err);
            cadastroError.textContent = 'Erro de conexão com o servidor. Verifique sua conexão e tente novamente.';
            cadastroError.classList.remove('d-none');
        } finally {
            if (cadastroText) cadastroText.classList.remove('d-none');
            if (cadastroSpinner) cadastroSpinner.classList.add('d-none');
        }
    });

    // Máscara para telefone
    document.getElementById('telefone')?.addEventListener('input', function (e) {
        const x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
});