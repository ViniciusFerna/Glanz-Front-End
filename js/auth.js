// URL base da API (centralizada para facilitar a alteração)
window.API_BASE_URL = 'http://localhost:8080'; // <-- CORRIGIDO!

// Função showToast global para exibir notificações na tela
// Esta função cria um elemento de toast e o exibe por um tempo determinado
window.showToast = function(message, isError = false) {
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
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
};

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

function getToken() {
    return sessionStorage.getItem('token') || localStorage.getItem('token');
}

function saveToken(token, rememberMe) {
    if (rememberMe) {
        sessionStorage.setItem('token', token);
        localStorage.removeItem('token');
    } else {
        localStorage.setItem('token', token);
        sessionStorage.removeItem('token');
    }
}

function removeToken() {
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
}

function getUserRole() {
    const token = getToken();
    if (token) {
        const decodedToken = parseJwt(token);
        if (decodedToken && decodedToken.exp * 1000 > Date.now()) {
            return decodedToken.roles;
        } else {
            removeToken();
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
            return decodedToken.sub;
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
            return decodedToken.email;
        }
    }
    return null;
}

function updateAuthUI() {
    const authBtn = document.getElementById('authBtn');
    const navProfileItem = document.getElementById('navProfileItem');

    if (!authBtn || !navProfileItem) {
        return;
    }

    const userRole = getUserRole();

    if (userRole) {
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
        authBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        authBtn.href = "login.html";
        authBtn.onclick = null;

        navProfileItem.style.display = 'none';
    }
}

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

document.addEventListener('DOMContentLoaded', function() {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out'
    });

    updateAuthUI();
    
    highlightActiveNavLink();
});