document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const cadastroForm = document.getElementById('cadastroForm');
    const senhaInput = document.getElementById('senha');
    const confirmarSenhaInput = document.getElementById('confirmarSenha');
    const passwordStrength = document.getElementById('passwordStrength');
    const passwordMatchText = document.getElementById('passwordMatchText');
    const cadastroError = document.getElementById('cadastroError');
    
    // Verificar força da senha
    senhaInput.addEventListener('input', function() {
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
    confirmarSenhaInput.addEventListener('input', function() {
        if (senhaInput.value !== this.value) {
            passwordMatchText.textContent = 'As senhas não coincidem';
            passwordMatchText.style.color = '#e74c3c';
        } else {
            passwordMatchText.textContent = 'As senhas coincidem';
            passwordMatchText.style.color = '#2ecc71';
        }
    });
    
    // Submissão do formulário
    cadastroForm.addEventListener('submit', function(e) {
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
        
        // Exibir loading
        const cadastroText = document.getElementById('cadastroText');
        const cadastroSpinner = document.getElementById('cadastroSpinner');
        cadastroText.classList.add('d-none');
        cadastroSpinner.classList.remove('d-none');
        
        // Simular envio para o backend (substituir por chamada real à API)
        setTimeout(() => {
            // Simular resposta do servidor
            const success = Math.random() > 0.2; // 80% de chance de sucesso
            
            if (success) {
                // Redirecionar para página de sucesso
                window.location.href = 'cadastro-sucesso.html';
            } else {
                // Exibir erro
                cadastroError.textContent = 'Erro ao cadastrar. O e-mail pode já estar em uso.';
                cadastroError.classList.remove('d-none');
                
                // Resetar loading
                cadastroText.classList.remove('d-none');
                cadastroSpinner.classList.add('d-none');
            }
        }, 2000);
    });
    
    // Máscara para telefone
    document.getElementById('telefone')?.addEventListener('input', function(e) {
        const x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
        e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
    });
});