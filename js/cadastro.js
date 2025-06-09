// js/cadastro.js

document.addEventListener('DOMContentLoaded', function () {
    // MANTENHA ESTA URL COMO LOCALHOST:8080 se estiver rodando localmente!
    const API_BASE_URL = 'http://localhost:8080'; 
    const showToast = window.showToast;       

    // Elementos do DOM
    const cadastroForm = document.getElementById('cadastroForm');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const passwordStrength = document.getElementById('passwordStrength');
    const passwordMatchText = document.getElementById('passwordMatchText');
    const cadastroError = document.getElementById('cadastroError'); 
    const generoSelect = document.getElementById('genero');

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
            passwordStrength.style.backgroundColor = '#e74c3c';
        } else if (strength < 75) {
            passwordStrength.style.backgroundColor = '#f39c12';
        } else {
            passwordStrength.style.backgroundColor = '#2ecc71';
        }
    });

    confirmarSenhaInput.addEventListener('input', function () {
        if (senhaInput.value !== this.value) {
            passwordMatchText.textContent = 'As senhas não coincidem';
            passwordMatchText.style.color = '#e74c3c';
        } else {
            passwordMatchText.textContent = 'As senhas coincidem';
            passwordMatchText.style.color = '#2ecc71';
        }
    });

    cadastroForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        cadastroError.classList.add('d-none'); 

        if (senhaInput.value !== confirmarSenhaInput.value) {
            cadastroError.textContent = 'As senhas não coincidem.';
            cadastroError.classList.remove('d-none');
            return;
        }

        const termosCheckbox = document.getElementById('termos');
        if (!termosCheckbox || !termosCheckbox.checked) {
            cadastroError.textContent = 'Você deve aceitar os termos de serviço.';
            cadastroError.classList.remove('d-none');
            return;
        }

        const cadastroText = document.getElementById('cadastroText');
        const cadastroSpinner = document.getElementById('cadastroSpinner');
        if (cadastroText) cadastroText.classList.add('d-none');
        if (cadastroSpinner) cadastroSpinner.classList.remove('d-none');

        const name = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('telefone').value;
        const gender = generoSelect.value;
        const password = senhaInput.value;

        try {
            const response = await fetch(`${API_BASE_URL}/user/registrar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    phone,
                    email,
                    password,
                    gender
                })
            });

            if (response.ok) { // Status 200 OK (ou 201 Created)
                showToast('Conta criada com sucesso! Redirecionando para o login...', false);
                cadastroForm.reset();
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else if (response.status === 409) { // Trata status 409 CONFLICT (Email já cadastrado)
                const errorMessage = await response.text(); 
                console.log("DEBUG 409 Response Text:", errorMessage); 
                cadastroError.textContent = errorMessage || 'Email já cadastrado. Por favor, tente outro.'; 
                cadastroError.classList.remove('d-none');
            } else if (response.status === 400) { // Trata status 400 BAD_REQUEST (Nome/Senha vazios)
                const errorMessage = await response.text();
                console.log("DEBUG 400 Response Text:", errorMessage); 
                cadastroError.textContent = errorMessage || 'Dados inválidos. Por favor, preencha todos os campos obrigatórios.';
                cadastroError.classList.remove('d-none');
            } else { // Outros erros (500, etc.)
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

    document.getElementById('telefone')?.addEventListener('input', function (e) {
        const x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
});