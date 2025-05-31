document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const cadastroForm = document.getElementById('cadastroForm');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const passwordStrength = document.getElementById('passwordStrength');
    const passwordMatchText = document.getElementById('passwordMatchText');
    const cadastroError = document.getElementById('cadastroError');

    const baseUrl = 'http://10.92.199.75:8080'; // URL base da API

    // Verificar força da senha
    senhaInput.addEventListener('input', function () {
        const password = this.value;
        let strength = 0;

        // Verificar comprimento
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 25;

        // Verificar complexidade
        if (/[A-Z]/.test(password)) strength += 15;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^A-Za-z0-9]/.test(password)) strength += 20;

        // Atualizar barra de progresso
        passwordStrength.style.width = strength + '%';

        // Atualizar cor baseada na força
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

        // Validar senhas
        if (senhaInput.value !== confirmarSenhaInput.value) {
            cadastroError.textContent = 'As senhas não coincidem';
            cadastroError.classList.remove('d-none');
            return;
        }

        // Validar termos
        if (!document.getElementById('termos').checked) {
            cadastroError.textContent = 'Você deve aceitar os termos de serviço';
            cadastroError.classList.remove('d-none');
            return;
        }

        // Exibir loading (se existir)
        const cadastroText = document.getElementById('cadastroText');
        const cadastroSpinner = document.getElementById('cadastroSpinner');
        if (cadastroText && cadastroSpinner) {
            cadastroText.classList.add('d-none');
            cadastroSpinner.classList.remove('d-none');
        }

        // Coletar dados do formulário
        const name = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('telefone').value;
        const gender = document.getElementById('genero').value;
        const password = senhaInput.value;

        try {
            const response = await fetch(`${baseUrl}/user/registrar`, {
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

            if (!response.ok) {
                const errorData = await response.text(); // Tente text() primeiro para ver o erro bruto
                console.error('Erro detalhado:', errorData);
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            if (response.ok) {
                alert('Cadastro realizado com sucesso! Você será redirecionado para a página de login.');
                window.location.href = 'login.html';
            } else {
                const error = await response.json();
                cadastroError.textContent = error.message || 'Erro ao cadastrar. O e-mail pode já estar em uso.';
                cadastroError.classList.remove('d-none');
                if (cadastroText && cadastroSpinner) {
                    cadastroText.classList.remove('d-none');
                    cadastroSpinner.classList.add('d-none');
                }
            }
        } catch (err) {
            console.error('Erro completo:', err);
            cadastroError.textContent = `Erro: ${err.message}`;
            cadastroError.textContent = 'Erro de conexão com o servidor.';
            cadastroError.classList.remove('d-none');
            if (cadastroText && cadastroSpinner) {
                cadastroText.classList.remove('d-none');
                cadastroSpinner.classList.add('d-none');
            }
        }
    });

    // Máscara para telefone
    document.getElementById('telefone')?.addEventListener('input', function (e) {
        const x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
});