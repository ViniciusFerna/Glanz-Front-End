document.addEventListener('DOMContentLoaded', function() {
    
    const API_BASE_URL = 'http://localhost:8080'; 

    // Referências a funções de auth.js. Se auth.js globaliza, 'window.' é opcional mas claro.
    const getToken = window.getToken; 
    const getUserRole = window.getUserRole;
    const removeToken = window.removeToken; // Para logout e erros de autenticação
    
    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = `toast-message ${isError ? 'error' : ''}`;
        toast.innerHTML = `
            <i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        setTimeout(() => { toast.classList.add('show'); }, 10);
        setTimeout(() => { 
            toast.classList.remove('show'); 
            setTimeout(() => { document.body.removeChild(toast); }, 300);
        }, 3000);
    }

    // Elementos do DOM
    const avatarInput = document.getElementById('avatarInput');
    const profileAvatar = document.getElementById('profileAvatar');
    const editProfileForm = document.getElementById('editProfileForm');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn'); 

    // Chamada inicial para carregar os dados do usuário ao carregar a página
    loadUserData(); // <--- VERIFIQUE SE ESTA LINHA ESTÁ PRESENTE E É CHAMADA NO INÍCIO DO DOMContentLoaded


    // Funções auxiliares de formatação de data
    function formatDate(dateString) {
        if (!dateString) return '--';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }

    // Upload de avatar
    if (avatarInput) {
        avatarInput.addEventListener('change', async function(e) {
            const file = e.target.files[0];
            if (file) {
                const token = getToken();
                if (!token) {
                    showToast('Você precisa estar logado para atualizar seu avatar.', true);
                    window.location.href = 'login.html';
                    return;
                }

                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    
                    const response = await fetch(`${API_BASE_URL}/api/users/me/avatar`, {
                        method: 'POST', 
                        headers: {
                            'Authorization': 'Bearer ' + token
                        },
                        body: formData
                    });
                    
                    if (response.ok) {
                        const data = await response.json(); 
                        profileAvatar.src = data.avatarUrl || 'assets/images/profile-placeholder.jpg';
                        showToast('Avatar atualizado com sucesso!');
                    } else {
                        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                        throw new Error(errorData.message || 'Falha ao atualizar avatar');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showToast('Erro ao atualizar avatar: ' + error.message, true);
                }
            }
        });
    }

    // Editar perfil - Abrir modal com dados atuais
    const editProfileModal = document.getElementById('editProfileModal');
    if (editProfileModal) {
        editProfileModal.addEventListener('show.bs.modal', function() {
            document.getElementById('editNome').value = document.getElementById('infoNome').textContent === 'Carregando...' ? '' : document.getElementById('infoNome').textContent;
            document.getElementById('editTelefone').value = document.getElementById('infoTelefone').textContent === '--' ? '' : document.getElementById('infoTelefone').textContent;
            document.getElementById('editLocalizacao').value = document.getElementById('infoLocalizacao').textContent === '--' ? '' : document.getElementById('infoLocalizacao').textContent;
            document.getElementById('editBio').value = document.getElementById('infoBio').textContent === '--' ? '' : document.getElementById('infoBio').textContent;
        });
    }

    // Salvar perfil
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async function() {
            const token = getToken();
            if (!token) {
                showToast('Você precisa estar logado para atualizar seu perfil.', true);
                window.location.href = 'login.html';
                return;
            }

            const formData = {
                name: document.getElementById('editNome').value, 
                phone: document.getElementById('editTelefone').value,
                location: document.getElementById('editLocalizacao').value,
                bio: document.getElementById('editBio').value
            };
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    const data = await response.json(); 
                    updateProfileUI(data); 
                    showToast('Perfil atualizado com sucesso!');
                    
                    const modal = bootstrap.Modal.getInstance(editProfileModal);
                    modal.hide();
                } else {
                    const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                    throw new Error(errorData.message || 'Falha ao atualizar perfil');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Erro ao atualizar perfil: ' + error.message, true);
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
            if (newPassword.length < 8) {
                showToast('A nova senha deve ter no mínimo 8 caracteres.', true);
                return;
            }

            const token = getToken();
            if (!token) {
                showToast('Você precisa estar logado para alterar sua senha.', true);
                window.location.href = 'login.html';
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/api/users/me/password`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        currentPassword: currentPassword,
                        newPassword: newPassword
                    })
                });
                
                if (response.ok) {
                    showToast('Senha alterada com sucesso!');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
                    modal.hide();
                    changePasswordForm.reset();
                } else {
                    const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                    throw new Error(errorData.message || 'Falha ao alterar senha');
                }
            } catch (error) {
                console.error('Error:', error);
                showToast('Erro ao alterar senha: ' + error.message, true);
            }
        });
    }

    // Excluir conta
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async function() {
            if (!confirm('ATENÇÃO: Esta ação é irreversível e excluirá sua conta permanentemente. Tem certeza que deseja continuar?')) {
                return;
            }

            const token = getToken();
            if (!token) {
                showToast('Você precisa estar logado para excluir sua conta.', true);
                window.location.href = 'login.html';
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });

                if (response.ok) {
                    removeToken();
                    showToast('Sua conta foi excluída com sucesso.', false);
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                    throw new Error(errorData.message || 'Falha ao excluir conta');
                }
                // Opcional: Se a exclusão falhar, o usuário ainda está logado, então pode-se tentar carregar o perfil novamente.
            } catch (error) {
                console.error('Erro ao excluir conta:', error);
                showToast('Erro ao excluir conta: ' + error.message, true);
            }
        });
    }

    // Modo escuro (manter se quiser um switch, mas você pediu para remover preferências)
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    if (darkModeSwitch) { 
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
        const token = getToken();
        if (!token) {
            console.warn("Token não encontrado, redirecionando para login.");
            window.location.href = 'login.html'; // Redireciona se não houver token
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/me`, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            
            if (response.ok) {
                const userData = await response.json(); 
                console.log("Dados do usuário recebidos para perfil:", userData); // Log para inspecionar os dados
                updateProfileUI(userData);
            } else if (response.status === 401 || response.status === 403) {
                console.warn("Sessão expirada ou não autorizada. Limpando token e redirecionando.");
                removeToken(); 
                window.location.href = 'login.html';
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                throw new Error(errorData.message || 'Falha ao carregar dados do usuário');
            }
        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            showToast('Erro ao carregar dados do usuário: ' + error.message, true);
        }
    }

    // Função para atualizar UI com dados do usuário
    function updateProfileUI(userData) {
        if (!userData) {
            console.error("userData é nulo ou indefinido para atualização da UI.");
            return;
        }
        
        // Populando o cabeçalho do perfil
        document.getElementById('profileName').textContent = userData.name || 'Nome Indisponível';
        document.getElementById('profileUsername').textContent = `@${userData.email ? userData.email.split('@')[0] : 'usuario'}`; 
        
        if (profileAvatar) { // Verifica se o elemento profileAvatar existe
            if (userData.avatarUrl) {
                profileAvatar.src = userData.avatarUrl;
            } else {
                profileAvatar.src = 'assets/images/profile-placeholder.jpg'; // Imagem padrão
            }
        }
        
        document.getElementById('profileBio').textContent = userData.bio || 'Sem biografia';
        
        // Estatísticas (assumindo que o backend pode fornecer. Se não, ficarão em 0)
        document.getElementById('eventCount').textContent = userData.totalEventos || 0; 
        document.getElementById('participantCount').textContent = userData.totalParticipantes || 0;
        
        // Informações Detalhadas
        document.getElementById('infoNome').textContent = userData.name || '--'; 
        document.getElementById('infoEmail').textContent = userData.email || '--';
        document.getElementById('infoTelefone').textContent = userData.phone || '--'; 
        document.getElementById('infoLocalizacao').textContent = userData.location || '--'; 
        document.getElementById('infoBio').textContent = userData.bio || '--'; 
        document.getElementById('infoMembroDesde').textContent = formatDate(userData.createdAt) || '--'; 
        document.getElementById('senhaUltimaAlteracao').textContent = '--'; // Este campo geralmente não vem no DTO de perfil, deve ser atualizado separadamente se houver API
    }
});