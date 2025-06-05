document.addEventListener('DOMContentLoaded', function() {
    
    const API_BASE_URL = window.API_BASE_URL; // Usando a variável global
    // Referências a funções de auth.js, agora globais
    const getToken = window.getToken; 
    const getUserId = window.getUserId; 
    const removeToken = window.removeToken; 
    const showToast = window.showToast; 

    // Elementos do DOM
    const profileAvatar = document.getElementById('profileAvatar');
    const editProfileForm = document.getElementById('editProfileForm');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn'); 

    // Chamada inicial para carregar os dados do usuário ao carregar a página
    loadUserData();

    // Funções auxiliares de formatação de data (mantidas)
    function formatDate(dateString) {
        if (!dateString) return '--';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }

    // --- FUNCIONALIDADES REMOVIDAS OU COM AVISOS (Reafirmando) ---
    // Upload de avatar: O backend não possui o endpoint para isso. Removido.
    // Alterar senha (com currentPassword): O backend não possui o endpoint específico para isso. Removido.

    // Editar perfil - Abrir modal com dados atuais
    const editProfileModal = document.getElementById('editProfileModal');
    if (editProfileModal) {
        editProfileModal.addEventListener('show.bs.modal', function() {
            document.getElementById('editNome').value = document.getElementById('infoNome').textContent === 'Carregando...' ? '' : document.getElementById('infoNome').textContent;
            document.getElementById('editTelefone').value = document.getElementById('infoTelefone').textContent === '--' ? '' : document.getElementById('infoTelefone').textContent;
            document.getElementById('editEmail').value = document.getElementById('infoEmail').textContent === '--' ? '' : document.getElementById('infoEmail').textContent;
            // Para 'gender', assuma que você tem um campo 'editGender' no HTML (select, radio).
            // document.getElementById('editGender').value = document.getElementById('infoGender').textContent === '--' ? '' : document.getElementById('infoGender').textContent;
        });
    }

    // Salvar perfil
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', async function() {
            const token = getToken();
            const userId = getUserId(); 
            
            if (!token || !userId) {
                showToast('Você precisa estar logado para atualizar seu perfil.', true);
                window.location.href = 'login.html';
                return;
            }

            const formData = {
                name: document.getElementById('editNome').value, 
                email: document.getElementById('editEmail').value,
                password: null, // Deixando null, pois a alteração de senha deve ser separada ou tratada de outra forma
                phone: document.getElementById('editTelefone').value,
                // Assumindo que 'editGender' é um campo no seu HTML
                gender: document.getElementById('editGender')?.value || null 
            };
            
            try {
                // CORREÇÃO AQUI: URL ajustada para /user/{id}
                const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    await loadUserData(); 
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
                // CORREÇÃO AQUI: URL ajustada para /user/deletarUser
                const response = await fetch(`${API_BASE_URL}/user/deletarUser`, {
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
            } catch (error) {
                console.error('Erro ao excluir conta:', error);
                showToast('Erro ao excluir conta: ' + error.message, true);
            }
        });
    }

    // Modo escuro (mantido)
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
        const userId = getUserId(); 

        if (!token || !userId) {
            console.warn("Token ou ID do usuário não encontrado. Redirecionando para login.");
            window.location.href = 'login.html'; 
            return;
        }

        try {
            // CORREÇÃO AQUI: URL ajustada para /user/{id}
            const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            
            if (response.ok) {
                const userData = await response.json(); 
                console.log("Dados do usuário recebidos para perfil:", userData); 
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
        
        document.getElementById('profileName').textContent = userData.name || 'Nome Indisponível';
        document.getElementById('profileUsername').textContent = `@${userData.email ? userData.email.split('@')[0] : 'usuario'}`; 
        
        if (profileAvatar) { 
            profileAvatar.src = 'assets/images/profile-placeholder.jpg'; 
        }
        
        document.getElementById('profileBio').textContent = 'Sem biografia'; 
        
        document.getElementById('eventCount').textContent = 0; 
        document.getElementById('participantCount').textContent = 0;
        
        document.getElementById('infoNome').textContent = userData.name || '--'; 
        document.getElementById('infoEmail').textContent = userData.email || '--';
        document.getElementById('infoTelefone').textContent = userData.phone || '--'; 
        document.getElementById('infoLocalizacao').textContent = '--'; 
        document.getElementById('infoBio').textContent = '--'; 
        document.getElementById('infoMembroDesde').textContent = '--'; 
        document.getElementById('senhaUltimaAlteracao').textContent = '--'; 
        
        const infoGender = document.getElementById('infoGender'); 
        if (infoGender) {
            infoGender.textContent = userData.gender || '--';
        }
    }
});