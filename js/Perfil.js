document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const avatarInput = document.getElementById('avatarInput');
    const profileAvatar = document.getElementById('profileAvatar');
    const editProfileForm = document.getElementById('editProfileForm');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const darkModeSwitch = document.getElementById('darkModeSwitch');

    // Carregar dados do usuário
    loadUserData();
    loadUserEvents();

    // Upload de avatar
    if (avatarInput) {
        avatarInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    const response = await fetch('/api/usuarios/me/avatar', {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        body: formData
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        profileAvatar.src = data.avatarUrl || 'assets/images/profile-placeholder.jpg';
                        showToast('Avatar atualizado com sucesso!');
                    } else {
                        throw new Error('Falha ao atualizar avatar');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showToast('Erro ao atualizar avatar', true);
                }
            }
        });
    }

    // Editar perfil - Abrir modal com dados atuais
    const editProfileModal = document.getElementById('editProfileModal');
    if (editProfileModal) {
        editProfileModal.addEventListener('show.bs.modal', function() {
            document.getElementById('editNome').value = document.getElementById('profileName').textContent;
            document.getElementById('editTelefone').value = document.getElementById('infoTelefone').textContent;
            document.getElementById('editLocalizacao').value = document.getElementById('infoLocalizacao').textContent;
            document.getElementById('editBio').value = document.getElementById('infoBio').textContent;
        });
    }

    // Salvar perfil
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async function() {
            const formData = {
                nome: document.getElementById('editNome').value,
                telefone: document.getElementById('editTelefone').value,
                localizacao: document.getElementById('editLocalizacao').value,
                bio: document.getElementById('editBio').value
            };
            
            try {
                const response = await fetch('/api/usuarios/me', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    updateProfileUI(data);
                    showToast('Perfil atualizado com sucesso!');
                    
                    // Fechar modal
                    const modal = bootstrap.Modal.getInstance(editProfileModal);
                    modal.hide();
                } else {
                    throw new Error('Falha ao atualizar perfil');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Erro ao atualizar perfil', true);
            }
        });
    }

    // Alterar senha
    if (savePasswordBtn) {
        savePasswordBtn.addEventListener('click', async function() {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                showToast('As senhas não coincidem', true);
                return;
            }
            
            try {
                const response = await fetch('/api/usuarios/me/senha', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    },
                    body: JSON.stringify({
                        senhaAtual: currentPassword,
                        novaSenha: newPassword
                    })
                });
                
                if (response.ok) {
                    showToast('Senha alterada com sucesso!');
                    
                    // Fechar modal e limpar formulário
                    const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
                    modal.hide();
                    changePasswordForm.reset();
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Falha ao alterar senha');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast(error.message, true);
            }
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
        });
    }

    // Modo escuro
    if (darkModeSwitch) {
        // Verificar preferência salva
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'true') {
            document.body.classList.add('dark-mode');
            darkModeSwitch.checked = true;
        }
        
        darkModeSwitch.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
            }
        });
    }

    // Função para carregar dados do usuário
    async function loadUserData() {
        try {
            const response = await fetch('/api/usuarios/me', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            
            if (response.ok) {
                const userData = await response.json();
                updateProfileUI(userData);
            } else if (response.status === 401) {
                // Não autenticado - redirecionar para login
                window.location.href = 'login.html';
            } else {
                throw new Error('Falha ao carregar dados do usuário');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Erro ao carregar dados do usuário', true);
        }
    }

    // Função para carregar eventos do usuário
    async function loadUserEvents() {
        try {
            const response = await fetch('/api/eventos/meus-eventos', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });
            
            if (response.ok) {
                const eventos = await response.json();
                renderUserEvents(eventos);
            } else {
                throw new Error('Falha ao carregar eventos');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Erro ao carregar eventos', true);
        }
    }

    // Atualizar UI com dados do usuário
    function updateProfileUI(userData) {
        // Cabeçalho do perfil
        document.getElementById('profileName').textContent = userData.nome;
        document.getElementById('profileUsername').textContent = `@${userData.username || 'usuario'}`;
        document.getElementById('profileBio').textContent = userData.bio || 'Sem biografia';
        
        // Avatar
        if (userData.avatarUrl) {
            profileAvatar.src = userData.avatarUrl;
        }
        
        // Estatísticas
        document.getElementById('eventCount').textContent = userData.totalEventos || 0;
        document.getElementById('participantCount').textContent = userData.totalParticipantes || 0;
        
        // Informações
        document.getElementById('infoNome').textContent = userData.nome;
        document.getElementById('infoEmail').textContent = userData.email;
        document.getElementById('infoTelefone').textContent = userData.telefone || '--';
        document.getElementById('infoLocalizacao').textContent = userData.localizacao || '--';
        document.getElementById('infoBio').textContent = userData.bio || '--';
        document.getElementById('infoMembroDesde').textContent = formatDate(userData.dataCriacao) || '--';
    }

    // Renderizar eventos do usuário
    function renderUserEvents(eventos) {
        const proximosEventosContainer = document.getElementById('proximosEventos');
        const eventosAnterioresContainer = document.getElementById('eventosAnteriores');
        
        const agora = new Date();
        
        const proximos = eventos.filter(evento => new Date(evento.data) > agora);
        const anteriores = eventos.filter(evento => new Date(evento.data) <= agora);
        
        // Renderizar próximos eventos
        if (proximos.length > 0) {
            proximosEventosContainer.innerHTML = proximos.map(evento => `
                <div class="event-item">
                    <div class="event-date">
                        <span class="day">${new Date(evento.data).getDate()}</span>
                        <span class="month">${new Date(evento.data).toLocaleString('pt-BR', { month: 'short' }).toUpperCase()}</span>
                    </div>
                    <div class="event-info">
                        <h5>${evento.titulo}</h5>
                        <p><i class="fas fa-map-marker-alt"></i> ${evento.localizacao}</p>
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-outline-verde btn-sm" onclick="location.href='eventos.html?editar=${evento.id}'">Gerenciar</button>
                    </div>
                </div>
            `).join('');
        } else {
            proximosEventosContainer.innerHTML = `
                <div class="text-center py-3">
                    <i class="fas fa-calendar-times fa-2x mb-2" style="color: var(--verde);"></i>
                    <p>Nenhum evento agendado</p>
                </div>
            `;
        }
        
        // Renderizar eventos anteriores
        if (anteriores.length > 0) {
            eventosAnterioresContainer.innerHTML = anteriores.map(evento => `
                <div class="event-item past-event">
                    <div class="event-date">
                        <span class="day">${new Date(evento.data).getDate()}</span>
                        <span class="month">${new Date(evento.data).toLocaleString('pt-BR', { month: 'short' }).toUpperCase()}</span>
                    </div>
                    <div class="event-info">
                        <h5>${evento.titulo}</h5>
                        <p><i class="fas fa-map-marker-alt"></i> ${evento.localizacao}</p>
                    </div>
                    <div class="event-actions">
                        <button class="btn btn-outline-secondary btn-sm" onclick="location.href='eventos.html?detalhes=${evento.id}'">Detalhes</button>
                    </div>
                </div>
            `).join('');
        } else {
            eventosAnterioresContainer.innerHTML = `
                <div class="text-center py-3">
                    <i class="fas fa-history fa-2x mb-2" style="color: var(--verde);"></i>
                    <p>Nenhum evento realizado</p>
                </div>
            `;
        }
    }

    // Funções auxiliares
    function formatDate(dateString) {
        if (!dateString) return null;
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }

    function showToast(message, isError = false) {
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
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
});