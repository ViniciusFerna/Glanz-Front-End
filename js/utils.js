// Variável de ambiente global para a URL base da API do backend
// Mantenha esta URL consistente com a porta que seu Spring Boot está usando (8080 por padrão)
window.API_BASE_URL = 'http://localhost:8080'; 

// Função showToast global para exibir notificações na tela
// Esta função cria um elemento de toast e o exibe por um tempo determinado
window.showToast = function(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast-message ${isError ? 'error' : ''}`; // Adiciona classe 'error' para toasts de erro
    toast.innerHTML = `
        <i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    // Adiciona a classe 'show' após um pequeno delay para ativar a transição CSS
    setTimeout(() => { 
        toast.classList.add('show'); 
    }, 10);

    // Remove o toast após 3 segundos
    setTimeout(() => { 
        toast.classList.remove('show'); 
        // Espera a transição de saída terminar antes de remover o elemento do DOM
        setTimeout(() => { 
            if (toast.parentNode) { // Verifica se o elemento ainda está no DOM antes de tentar remover
                document.body.removeChild(toast); 
            }
        }, 300); // Tempo da transição de saída no CSS
    }, 3000); // Tempo total que o toast fica visível
};