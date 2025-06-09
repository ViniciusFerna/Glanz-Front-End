document.addEventListener('DOMContentLoaded', function() {
    
    const API_BASE_URL = 'http://localhost:8080'; // MANTENHA LOCALHOST SE FOR RODAR LOCAL!
    const getToken = window.getToken; 
    const getUserId = window.getUserId; 
    const removeToken = window.removeToken; 
    const showToast = window.showToast; 

    const profileAvatar = document.getElementById('profileAvatar');
    const editProfileForm = document.getElementById('editProfileForm');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn'); 
    // Elementos do modal de mudança de senha
    const changePasswordForm = document.getElementById('changePasswordForm');
    const savePasswordBtn = document.getElementById('savePasswordBtn');


    loadUserData();

    function formatDate(dateString) {
        if (!dateString) return '--';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }

    const editProfileModal = document.getElementById('editProfileModal');
    if (editProfileModal) {
        editProfileModal.addEventListener('show.bs.modal', function() {
            document.getElementById('editNome').value = document.getElementById('infoNome').textContent === 'Carregando...' ? '' : document.getElementById('infoNome').textContent;
            document.getElementById('editTelefone').value = document.getElementById('infoTelefone').textContent === '--' ? '' : document.getElementById('infoTelefone').textContent;
            document.getElementById('editEmail').value = document.getElementById('infoEmail').textContent === 'carregando@email.com' ? '' : document.getElementById('infoEmail').textContent.split(' ')[0]; 
            // Populando o campo de gênero no modal (assumindo que editGender existe no HTML do modal)
            const infoGenderElement = document.getElementById('infoGender'); // Adicionei infoGender no HTML
            if(infoGenderElement) { 
                const infoGenderText = infoGenderElement.textContent;
                const editGenderSelect = document.getElementById('editGender'); // editGender existe no HTML
                if (editGenderSelect) {
                    editGenderSelect.value = infoGenderText === '--' ? '' : infoGenderText;
                }
            }
        });
    }

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
                password: null, // Senha não é atualizada neste modal
                phone: document.getElementById('editTelefone').value,
                gender: document.getElementById('editGender')?.value || null 
            };
            
            try {
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

    // Listener para o botão de Alterar Senha
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
            const userId = getUserId(); 
            if (!token || !userId) {
                showToast('Você precisa estar logado para alterar sua senha.', true);
                window.location.href = 'login.html';
                return;
            }
            
            try {
                // Usa o endpoint PUT /user/{id} para alterar senha
                const response = await fetch(`${API_BASE_URL}/user/${userId}`, { 
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        password: newPassword // Apenas a nova senha será enviada
                    })
                });
                
                if (response.ok) {
                    showToast('Senha alterada com sucesso!', false);
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
            profileAvatar.src = 'assets/images/profile-placeholder.jpg'; // Força a imagem padrão
        }
        
        // Biografia removida
        // document.getElementById('profileBio').textContent = 'Sem biografia'; // Esta linha não é mais necessária se a div foi removida
        
        document.getElementById('eventCount').textContent = 0; 
        document.getElementById('participantCount').textContent = 0;
        
        document.getElementById('infoNome').textContent = userData.name || '--'; 
        document.getElementById('infoEmail').textContent = userData.email || '--';
        document.getElementById('infoTelefone').textContent = userData.phone || '--'; 
        // Localização e Biografia removidas
        document.getElementById('infoLocalizacao').textContent = '--'; // Esta linha não é mais necessária se a div foi removida
        document.getElementById('infoBio').textContent = '--'; // Esta linha não é mais necessária se a div foi removida
        
        document.getElementById('infoMembroDesde').textContent = '--'; 
        document.getElementById('senhaUltimaAlteracao').textContent = '--'; 
        
        const infoGender = document.getElementById('infoGender'); // Este elemento precisa ser adicionado no HTML
        if (infoGender) {
            infoGender.textContent = userData.gender || '--';
        }
    }

    if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async function() {
        const token = getToken();
        const userId = getUserId(); 
        
        if (!token || !userId) {
            showToast('Você precisa estar logado para atualizar seu perfil.', true);
            window.location.href = 'login.html';
            return;
        }

        // NOVO: Coletando dados existentes (email, gênero) da exibição, pois não são editáveis no modal.
        // Garanta que os IDs 'infoEmail' e 'infoGender' existam no seu Perfil.html e contenham os valores
        const currentEmail = document.getElementById('infoEmail')?.textContent.split(' ')[0]; // Pega apenas o email antes de "Verificado"
        const infoGenderElement = document.getElementById('infoGender');
        const currentGender = infoGenderElement ? infoGenderElement.textContent : null;
        
        const formData = {
            name: document.getElementById('editNome').value, 
            email: currentEmail, // Usa o email atual
            phone: document.getElementById('editTelefone').value,
        };
        
        // NOVO: Logs para depuração
        console.log("DEBUG - Perfil: Dados do formulário para PUT /user/{id}:", formData); 
        console.log("DEBUG - Perfil: URL da requisição:", `${API_BASE_URL}/user/${userId}`);
        console.log("DEBUG - Perfil: Token presente?", !!token);
        console.log("DEBUG - Perfil: User ID presente?", !!userId);
        
        try {
            const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(formData)
            });

            console.log("DEBUG - Perfil: Resposta da API de atualização de perfil. Status:", response.status, response.statusText);
            
            if (response.ok) {
                await loadUserData(); // Recarrega os dados para mostrar as mudanças
                showToast('Perfil atualizado com sucesso!', false);
                
                const modal = bootstrap.Modal.getInstance(editProfileModal);
                modal.hide();
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                console.error("DEBUG - Perfil: Erro detalhado da API:", errorData);
                throw new Error(errorData.message || 'Falha ao atualizar perfil');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Erro ao atualizar perfil: ' + error.message, true);
        }
    });
}

});