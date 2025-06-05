// URL base da API (centralizada para facilitar a alteração)
window.API_BASE_URL = 'http://localhost:8080'; // Ensuring this is globally accessible

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

// Função para verificar e obter dados do token JWT
function parseJwt (token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Erro ao decodificar token JWT:", e);
        return null;
    }
}

// Função para obter o token armazenado
function getToken() {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
}

// Função para salvar o token
function saveToken(token, rememberMe) {
    // Lógica ajustada conforme sua solicitação:
    // Se "Lembrar de mim" (rememberMe) estiver marcado, salva no sessionStorage.
    // Caso contrário, salva no localStorage.
    if (rememberMe) {
        sessionStorage.setItem('token', token);
        localStorage.removeItem('token'); // Garante que não esteja em ambos
    } else {
        localStorage.setItem('token', token);
        sessionStorage.removeItem('token'); // Garante que não esteja em ambos
    }
}

// Função para remover o token
function removeToken() {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
}

// Função para verificar se o usuário está logado e qual sua role
function getUserRole() {
    const token = getToken();
    if (token) {
        const decodedToken = parseJwt(token);
        if (decodedToken && decodedToken.exp * 1000 > Date.now()) { // Verifica se o token não expirou
            return decodedToken.roles; // Usa 'roles' do JWT
        } else {
            removeToken(); // Remove token expirado
            return null;
        }
    }
    return null;
}

function getUserId() {
    const token = getToken();
    if (token) {
        const decodedToken = parseJwt(token);
        if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
            return decodedToken.sub; // Usa 'sub' do JWT (que é o ID do user)
        }
    }
    return null;
}

function getUserName() {
    const token = getToken();
    if (token) {
        const decodedToken = parseJwt(token);
        // Assumindo que 'userName' é um claim no token, caso contrário, ajuste
        if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
            return decodedToken.userName; // Certifique-se que o backend adicione esta claim
        }
    }
    return null;
}

function getUserEmail() {
    const token = getToken();
    if (token) {
        const decodedToken = parseJwt(token);
        if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
            return decodedToken.email; // Usa 'email' do JWT
        }
    }
    return null;
}

// Função para atualizar a interface de autenticação na Navbar
function updateAuthUI() {
    const authBtn = document.getElementById('authBtn'); // Pode ser null em certas páginas
    const navProfileItem = document.getElementById('navProfileItem'); // Pode ser null em certas páginas

    if (!authBtn || !navProfileItem) {
        return; 
    }

    const userRole = getUserRole();

    if (userRole) {
        // Usuário logado
        authBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
        authBtn.href = "#"; 
        authBtn.onclick = function(e) {
            e.preventDefault();
            removeToken();
            window.location.href = 'index.html'; 
        };

        navProfileItem.style.display = 'block';
        const profileLink = navProfileItem.querySelector('a');
        if (profileLink) { 
            profileLink.href = 'Perfil.html';
        }

    } else {
        // Usuário não logado
        authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        authBtn.href = "login.html";
        authBtn.onclick = null; 

        navProfileItem.style.display = 'none';
    }
}

// Função para ativar o link da navbar com base na URL
function highlightActiveNavLink() {
    const currentPath = window.location.pathname.split('/').pop(); 
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        link.classList.remove('active');

        const linkPath = link.getAttribute('href').split('/').pop();

        if (currentPath === linkPath || (currentPath === '' && linkPath === 'index.html')) {
            link.classList.add('active');
        }
    });

    const navProfileItem = document.getElementById('navProfileItem');
    if (navProfileItem && navProfileItem.style.display !== 'none') {
        const profileLink = navProfileItem.querySelector('a');
        if (profileLink && currentPath === profileLink.getAttribute('href').split('/').pop()) {
             profileLink.classList.add('active');
        } else {
            profileLink.classList.remove('active');
        }
    }
}

// Inicializa o AOS e as funções da navbar quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out'
    });

    // Atualiza a UI da navbar logo após o DOM carregar (botões de login/sair/perfil)
    updateAuthUI();
    
    // NOVO: Ativa o link correto da navbar
    highlightActiveNavLink();
});