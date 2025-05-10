document.addEventListener('DOMContentLoaded', function() {
    // Máscaras para formulário
    $('.cpf-mask').mask('000.000.000-00');
    $('.phone-mask').mask('(00) 00000-0000');

    // Validação de senha
    const senha = document.getElementById('senha');
    const confirmarSenha = document.getElementById('confirmar-senha');
    const senhaError = document.getElementById('senha-error');

    confirmarSenha.addEventListener('input', function() {
        if (senha.value !== confirmarSenha.value) {
            senhaError.textContent = "As senhas não coincidem!";
            senhaError.style.display = 'block';
            confirmarSenha.setCustomValidity("Senhas não coincidem");
        } else {
            senhaError.style.display = 'none';
            confirmarSenha.setCustomValidity("");
        }
    });

    // Validação de força da senha
    senha.addEventListener('input', function() {
        const strengthBar = document.querySelector('.password-strength');
        const strength = calculateStrength(senha.value);
        
        if (strength < 2) {
            strengthBar.style.backgroundColor = '#e74c3c';
        } else if (strength < 4) {
            strengthBar.style.backgroundColor = '#f39c12';
        } else {
            strengthBar.style.backgroundColor = '#2ecc71';
        }
    });

    // Envio do formulário
    document.getElementById('formCadastro').addEventListener('submit', function(e) {
        e.preventDefault();
        // Simulação de cadastro bem-sucedido
        alert('Cadastro realizado com sucesso! Redirecionando...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
});

function calculateStrength(password) {
    let strength = 0;
    
    // Contém números
    if (password.match(/[0-9]/)) strength++;
    
    // Contém letras minúsculas
    if (password.match(/[a-z]/)) strength++;
    
    // Contém letras maiúsculas
    if (password.match(/[A-Z]/)) strength++;
    
    // Contém caracteres especiais
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    // Tamanho mínimo
    if (password.length >= 8) strength++;
    
    return strength;
}