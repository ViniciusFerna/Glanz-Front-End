// js/detalhes-evento.js

document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = "http://localhost:8080"; // <-- CORRIGIDO!
    const getToken = window.getToken;
    const getUserRole = window.getUserRole;
    const getUserEmail = window.getUserEmail; 
    const removeToken = window.removeToken;
    const showToast = window.showToast;

    // Elementos do DOM para popular
    const eventDetailsTitle = document.getElementById('event-details-title');
    const eventDetailsLocation = document.getElementById('event-details-location');
    const eventDetailsDate = document.getElementById('event-details-date');
    const eventDetailsStatus = document.getElementById('event-details-status');
    const eventDetailsDescription = document.getElementById('event-details-description');
    
    const assignCreatorBtn = document.getElementById('assignCreatorBtn');
    const assignCreatorModal = new bootstrap.Modal(document.getElementById('assignCreatorModal'));
    const saveCreatorBtn = document.getElementById('saveCreatorBtn');
    const creatorEmailInput = document.getElementById('creatorEmail');

    // Elementos para Gerenciar Convidados
    const manageGuestsButtonWrapper = document.getElementById('manageGuestsButtonWrapper'); 
    const manageGuestsBtn = document.getElementById('manageGuestsBtn'); 
    const guestManagementModal = new bootstrap.Modal(document.getElementById('guestManagementModal')); 
    const addGuestForm = document.getElementById('addGuestForm'); 
    const guestNameInput = document.getElementById('guestName'); 
    const guestEmailInput = document.getElementById('guestEmail'); 
    const addGuestBtn = document.getElementById('addGuestBtn'); 
    const guestsList = document.getElementById('guestsList'); 

    let currentEventId = null; 
    let currentEventOwnerEmail = null; 

    // Funções auxiliares (reusadas)
    function formatDate(dateString) {
        if (!dateString) return 'Data não definida';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatStatus(status) {
        const statusMap = {
            'PLANEJADO': 'Planejado',
            'EM_ANDAMENTO': 'Em Andamento',
            'CONCLUIDO': 'Concluído',
            'CANCELADO': 'Cancelado'
        };
        return statusMap[status] || status;
    }

    function applyStatusColors(statusElement, status) {
        statusElement.className = 'event-details-status'; 
        statusElement.textContent = formatStatus(status);
        switch (status) {
            case 'PLANEJADO':
                statusElement.classList.add('status-PLANEJADO');
                break;
            case 'EM_ANDAMENTO':
                statusElement.classList.add('status-EM_ANDAMENTO');
                break;
            case 'CONCLUIDO':
                statusElement.classList.add('status-CONCLUIDO');
                break;
            case 'CANCELADO':
                statusElement.classList.add('status-CANCELADO');
                break;
            default:
                statusElement.classList.add('status-DEFAULT'); 
                break;
        }
    }
    
    async function loadEventDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('id');
        currentEventId = eventId; 

        if (!eventId) {
            showToast('ID do evento não encontrado na URL.', true);
            eventDetailsTitle.textContent = 'Evento não encontrado';
            return;
        }

        const token = getToken();
        
        try {
            const response = await fetch(`${API_BASE_URL}/eventos/${eventId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? 'Bearer ' + token : '' 
                }
            });

            if (response.ok) {
                const event = await response.json(); 
                eventDetailsTitle.textContent = event.title || 'Título Indisponível';
                eventDetailsLocation.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${event.location || 'Local Indisponível'}`;
                eventDetailsDate.innerHTML = `<i class="far fa-calendar-alt"></i> ${formatDate(event.eventDate)}`;
                eventDetailsDescription.textContent = event.description || 'Nenhuma descrição disponível.';
                
                applyStatusColors(eventDetailsStatus, event.status); 
                
                // Lógica de visibilidade do botão 'Adicionar Criador'
                const userRole = getUserRole(); 
                if (userRole === 'ADMIN' && !event.hasOwner) { 
                    assignCreatorBtn.style.display = 'block'; 
                } else {
                    assignCreatorBtn.style.display = 'none'; 
                }

                // --- CORREÇÃO AQUI: Lógica de visibilidade do botão 'Gerenciar Convidados' ---
                // Agora, manipulamos o display da DIV wrapper
                // (Removi currentEventOwnerEmail da condição, pois não é usado para permissão de convidado)
                if (userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') {
                    manageGuestsButtonWrapper.style.display = 'block'; 
                } else {
                    manageGuestsButtonWrapper.style.display = 'none';
                }
                // --- Fim da correção ---

                AOS.refresh(); 
            } else if (response.status === 401 || response.status === 403) {
                showToast('Acesso negado. Você precisa estar logado para ver detalhes de alguns eventos.', true);
                removeToken();
                window.location.href = 'login.html';
            } else if (response.status === 404) {
                eventDetailsTitle.textContent = 'Evento não encontrado';
                eventDetailsLocation.textContent = '';
                eventDetailsDate.textContent = '';
                eventDetailsDescription.textContent = 'O evento que você procura não existe ou foi removido.';
                showToast('Evento não encontrado.', true);
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                throw new Error(errorData.message || 'Falha ao carregar detalhes do evento');
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes do evento:', error);
            eventDetailsTitle.textContent = 'Erro ao carregar evento';
            eventDetailsLocation.textContent = '';
            eventDetailsDate.textContent = '';
            eventDetailsDescription.textContent = 'Não foi possível carregar os detalhes do evento. Tente novamente mais tarde.';
            showToast('Erro ao carregar detalhes do evento: ' + error.message, true);
        }
    }

    // Listener para o botão "Adicionar Criador do Evento" (sem mudanças)
    if (assignCreatorBtn) {
        assignCreatorBtn.addEventListener('click', () => {
            creatorEmailInput.value = ''; 
            assignCreatorModal.show(); 
        });
    }

    // Listener para o botão "Vincular Cliente" dentro do modal (sem mudanças)
    if (saveCreatorBtn) {
        saveCreatorBtn.addEventListener('click', async () => {
            const email = creatorEmailInput.value;

            if (!email) {
                showToast('Por favor, insira o email do cliente.', true);
                return;
            }

            const token = getToken();
            const userRole = getUserRole(); 
            if (!token || (userRole !== 'ADMIN' && userRole !== 'ROLE_ADMIN')) { 
                showToast('Você não tem permissão para realizar esta ação.', true);
                assignCreatorModal.hide();
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/admin/placeEvent/${currentEventId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token 
                    },
                    body: JSON.stringify({ email: email }) 
                });

                if (response.ok) {
                    showToast('Evento vinculado ao cliente com sucesso!', false);
                    assignCreatorModal.hide();
                    await loadEventDetails(); // Recarrega os detalhes para atualizar a visibilidade do botão
                } else if (response.status === 403) {
                    showToast('Acesso negado. Você não é um ADMIN.', true);
                    removeToken();
                    window.location.href = 'login.html';
                } else if (response.status === 404) { 
                    const errorMsg = await response.text(); 
                    showToast(errorMsg || 'Usuário ou evento não encontrado.', true);
                } else {
                    const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                    showToast('Erro ao vincular evento: ' + (errorData.message || 'Erro no servidor.'), true);
                }
            } catch (error) {
                console.error('Erro ao vincular criador:', error);
                showToast('Erro de conexão ao vincular criador.', true);
            }
        });
    }

    // --- Lógica para Gerenciar Convidados ---

    // Listener para o botão "Gerenciar Convidados"
    if (manageGuestsBtn) {
        manageGuestsBtn.addEventListener('click', () => {
            addGuestForm.reset(); 
            guestManagementModal.show(); 
            loadGuestsForEvent(currentEventId); // NOVO: Carrega a lista de convidados ao abrir o modal
        });
    }

    // Listener para o formulário de adicionar convidado (no modal)
    if (addGuestForm) {
        addGuestForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const guestName = guestNameInput.value;
            const guestEmail = guestEmailInput.value;

            if (!guestName || !guestEmail) {
                showToast('Por favor, preencha nome e email do convidado.', true);
                return;
            }

            const token = getToken();
            const userRole = getUserRole();
            // Permissão APENAS para ADMINS (conforme solicitado na interação anterior)
            if (!token || userRole !== 'ADMIN') { 
                showToast('Você não tem permissão para adicionar convidados.', true);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/convidado/addConvidado`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token 
                    },
                    body: JSON.stringify({
                        name: guestName,
                        email: guestEmail,
                        eventId: currentEventId 
                    })
                });

                if (response.ok) { 
                    showToast('Convidado adicionado com sucesso e convite enviado!', false);
                    addGuestForm.reset(); 
                    loadGuestsForEvent(currentEventId); // NOVO: Recarrega a lista após adicionar um novo
                } else if (response.status === 204) { 
                     const errorMsg = await response.text(); 
                     showToast(errorMsg || 'Erro: Nome, email ou evento não podem ser vazios.', true);
                } else if (response.status === 401 || response.status === 403) {
                    showToast('Sessão expirada ou acesso negado.', true);
                    removeToken();
                    window.location.href = 'login.html';
                } else {
                    const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                    showToast('Erro ao adicionar convidado: ' + (errorData.message || 'Erro no servidor.'), true);
                }
            } catch (error) {
                console.error('Erro ao adicionar convidado:', error);
                showToast('Erro de conexão ao adicionar convidado.', true);
            }
        });
    }

    // --- NOVO: Função para carregar e exibir convidados ---
    async function loadGuestsForEvent(eventId) {
        guestsList.innerHTML = `<li class="list-group-item bg-dark text-white-50"><div class="spinner-border text-light" role="status"><span class="visually-hidden">Carregando...</span></div> Carregando convidados...</li>`;
        const token = getToken();

        if (!token) {
            guestsList.innerHTML = `<li class="list-group-item bg-dark text-danger">Erro: Você precisa estar logado para ver os convidados.</li>`;
            return;
        }

        try {
            // Requisição para o novo endpoint de listar convidados
            const response = await fetch(`${API_BASE_URL}/convidado/evento/${eventId}/guests`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (response.ok) {
                const guests = await response.json();
                renderGuestsList(guests);
            } else if (response.status === 204 || response.status === 404) { 
                guestsList.innerHTML = `<li class="list-group-item bg-dark text-white-50">Nenhum convidado adicionado ainda.</li>`;
            } else if (response.status === 401 || response.status === 403) {
                guestsList.innerHTML = `<li class="list-group-item bg-dark text-danger">Acesso negado ou sessão expirada.</li>`;
                showToast('Acesso negado para listar convidados.', true);
                removeToken();
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                guestsList.innerHTML = `<li class="list-group-item bg-dark text-danger">Erro ao carregar convidados: ${errorData.message || 'Erro no servidor'}.</li>`;
                showToast('Erro ao carregar convidados: ' + (errorData.message || 'Erro no servidor.'), true);
            }
        } catch (error) {
            console.error('Erro ao carregar convidados:', error);
            guestsList.innerHTML = `<li class="list-group-item bg-dark text-danger">Erro de conexão ao carregar convidados.</li>`;
            showToast('Erro de conexão ao carregar convidados.', true);
        }
    }

    // Função para renderizar a lista de convidados
    function renderGuestsList(guests) {
        guestsList.innerHTML = ''; // Limpa a lista
        if (guests.length === 0) {
            guestsList.innerHTML = `<li class="list-group-item bg-dark text-white-50">Nenhum convidado adicionado ainda.</li>`;
            return;
        }

        guests.forEach(guest => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center bg-dark text-white';
            
            const confirmedIcon = guest.confirmed
? '<i class="fas fa-check-circle text-success me-2"></i> Confirmado'
: '<i class="fas fa-times-circle text-warning me-2"></i> Pendente';

            li.innerHTML = `
<div>
 <strong>${guest.name}</strong> (${guest.email})
 </div>
<div>
${confirmedIcon}
 </div>
`;
            guestsList.appendChild(li);
        });
    }

    loadEventDetails();
});