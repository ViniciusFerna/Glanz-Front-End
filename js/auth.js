// URL base da API (centralizada para facilitar a alteração)
const API_BASE_URL = 'http://localhost:8080';

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
    if (rememberMe) {
        localStorage.setItem('token', token);
    } else {
        sessionStorage.setItem('token', token);
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
            return decodedToken.role;
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
            return decodedToken.userId;
        }
    }
    return null;
}

function getUserName() {
    const token = getToken();
    if (token) {
        const decodedToken = parseJwt(token);
        if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
            return decodedToken.userName;
        }
    }
    return null;
}

function getUserEmail() {
    const token = getToken();
    if (token) {
        const decodedToken = parseJwt(token);
        if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
            return decodedToken.sub; // 'sub' é o subject (email) no JWT
        }
    }
    return null;
}

// Função para atualizar a interface de autenticação na Navbar
function updateAuthUI() {
    const authBtn = document.getElementById('authBtn'); // Pode ser null em certas páginas
    const navProfileItem = document.getElementById('navProfileItem'); // Pode ser null em certas páginas

    // Se os elementos da navbar de autenticação não existirem, não faça nada.
    // Isso é útil para páginas como login.html e cadastro.html que têm navbars diferentes.
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
        if (profileLink) { // Verificação adicional para garantir que o link existe
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
    const currentPath = window.location.pathname.split('/').pop(); // Obtém o nome do arquivo (ex: "index.html", "eventos.html")
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        // Remove a classe 'active' de todos os links primeiro
        link.classList.remove('active');

        // Obtém o nome do arquivo do href do link
        const linkPath = link.getAttribute('href').split('/').pop();

        // Compara o nome do arquivo atual com o nome do arquivo do link
        // Se a página for a home (index.html ou apenas "/"), ative a home
        if (currentPath === linkPath || (currentPath === '' && linkPath === 'index.html')) {
            link.classList.add('active');
        }
    });

    // Ajuste específico para o link "Perfil" se ele estiver ativo
    // O auth.js já gerencia a visibilidade, mas podemos reforçar a ativação aqui
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