// js/eventos.js

document.addEventListener('DOMContentLoaded', function() {
    // API_BASE_URL e showToast são assumidos como globais via js/utils.js
    // Referências a funções de auth.js (assumidas como globais)
    const getToken = window.getToken; 
    const getUserRole = window.getUserRole;
    const getUserId = window.getUserId; // Obter o ID do usuário
    const removeToken = window.removeToken; 

    // Elementos do DOM
    const eventsContainer = document.getElementById('events-container');
    const eventForm = document.getElementById('eventForm');
    const eventModal = new bootstrap.Modal(document.getElementById('eventModal'));
    const modalTitle = document.getElementById('modalTitle');
    const saveEventBtn = document.getElementById('saveEventBtn');
    const addEventBtn = document.getElementById('add-event-btn');
    
    let currentFilter = 'all';
    let events = []; // Armazenará os eventos carregados do backend
    
    // Role e ID do usuário logado
    const userRole = getUserRole(); 
    const userId = getUserId(); 
    
    // Funções auxiliares (showToast, formatDate, formatDateTimeForInput, formatStatus)
    // Assume que showToast está em utils.js. Se não, adicione a função aqui ou globalmente.
    function formatDate(dateString) { /* ... */ }
    function formatDateTimeForInput(dateString) { /* ... */ }
    function formatStatus(status) { /* ... */ }

    // Inicialização
    loadEvents(); 
    setupEventListeners(); 
    
    // Controla a visibilidade do botão "Novo Evento"
    if (addEventBtn) { 
        if (userRole === 'ROLE_ADMIN') {
            addEventBtn.style.display = 'block'; 
        } else {
            addEventBtn.style.display = 'none'; 
        }
    }

    // Carregar eventos do backend
    async function loadEvents() {
        try {
            eventsContainer.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-light" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                </div>
            `;
            
            let fetchUrl = `${API_BASE_URL}/api/events`; // URL padrão para todos os eventos (ADMIN e não logados)
            let headers = {
                'Content-Type': 'application/json',
                'Authorization': getToken() ? 'Bearer ' + getToken() : '' // Envia token se existir
            };

            // NOVO: SE O USUÁRIO FOR CLIENTE, BUSCAR APENAS SEUS EVENTOS CONTRATADOS
            if (userRole === 'ROLE_CLIENTE' && userId) {
                fetchUrl = `${API_BASE_URL}/api/users/me/contracted-events`; // Endpoint para eventos do cliente
                // O Authorization header já está configurado
            }

            const response = await fetch(fetchUrl, { headers });

            if (!response.ok && response.status !== 401 && response.status !== 403) {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido ao carregar eventos' }));
                throw new Error(errorData.message || 'Erro ao carregar eventos');
            }

            events = await response.json();
            
            renderEvents(events); 
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
            eventsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-danger">Erro ao carregar eventos. Tente recarregar a página.</p>
                    <button class="btn btn-primary" onclick="location.reload()">Recarregar</button>
                </div>
            `;
            // showToast assume que está globalmente disponível
            if (typeof showToast === 'function') {
                showToast('Erro ao carregar eventos: ' + error.message, true);
            } else {
                alert('Erro ao carregar eventos: ' + error.message);
            }
        }
    }
    
    // Renderizar eventos na tela
    function renderEvents(eventsToRender) {
        if (eventsToRender.length === 0) {
            let noEventsMessage = 'Nenhum evento encontrado no momento.';
            if (userRole === 'ROLE_CLIENTE') {
                noEventsMessage = 'Você ainda não possui eventos contratados ou associados à sua conta.';
            } else if (userRole === 'ROLE_ADMIN') {
                noEventsMessage = 'Nenhum evento cadastrado no sistema.';
            }

            eventsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-calendar-times fa-3x mb-3" style="color: var(--verde);"></i>
                    <h4>${noEventsMessage}</h4>
                    <p>Crie um novo evento ou aguarde ser associado a um.</p>
                </div>
            `;
            return;
        }
        
        eventsContainer.innerHTML = ''; 
        
        eventsToRender.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-card';
            eventElement.setAttribute('data-status', event.status);
            eventElement.setAttribute('data-aos', 'fade-up'); 
            
            let actionButtonsHtml = '';
            // Apenas usuários com a role 'ROLE_ADMIN' podem ver os botões de Editar/Excluir
            if (userRole === 'ROLE_ADMIN') { 
                actionButtonsHtml = `
                    <button class="btn btn-outline-verde btn-edit" data-id="${event.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-outline-danger btn-delete" data-id="${event.id}">
                        <i class="fas fa-trash-alt"></i> Excluir
                    </button>
                `;
            }

            eventElement.innerHTML = `
                ${event.imageUrl ? `
                <img src="${event.imageUrl}" alt="${event.title}" class="event-image" onerror="this.src='assets/images/event-placeholder.jpg'">
                ` : `
                <div class="event-image" style="background: var(--cinza-escuro); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-calendar-alt fa-3x" style="color: var(--verde);"></i>
                </div>
                `}
                <div class="event-content">
                    <span class="event-status status-${event.status}">${formatStatus(event.status)}</span>
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-date">
                        <i class="far fa-calendar-alt"></i>
                        ${formatDate(event.eventDate)}
                    </p>
                    <p class="event-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${event.location}
                    </p>
                    ${event.description ? `<p class="event-description">${event.description}</p>` : ''}
                    ${event.contractingClientName ? `<p class="event-client"><i class="fas fa-user-tie"></i> Cliente: ${event.contractingClientName}</p>` : ''} <div class="event-actions">
                        ${actionButtonsHtml}
                    </div>
                </div>
            `;
            
            eventsContainer.appendChild(eventElement);
        });
        
        // Adicionar listeners aos botões de ação (apenas se eles foram adicionados ao DOM)
        if (userRole === 'ROLE_ADMIN') { 
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', handleEdit);
            });
            
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', handleDelete);
            });
        }
        
        AOS.refresh(); 
    }
    
    // Configurar listeners de eventos para filtros e modais
    function setupEventListeners() {
        // Filtros (manter)
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.getAttribute('data-filter');
                applyFilter();
            });
        });
        
        // Adicionar novo evento (o listener só é configurado se o botão for visível para ADMIN)
        if (userRole === 'ROLE_ADMIN' && addEventBtn) { 
            addEventBtn.addEventListener('click', function() {
                eventForm.reset();
                document.getElementById('eventId').value = ''; 
                // Limpa o campo de email do cliente ao abrir para novo evento
                if (document.getElementById('contractingClientEmail')) {
                    document.getElementById('contractingClientEmail').value = '';
                }
                modalTitle.textContent = 'Adicionar Novo Evento';
                saveEventBtn.textContent = 'Salvar Evento';
                eventModal.show();
            });
        }
        
        // Salvar evento (criar/atualizar)
        if (saveEventBtn) { 
            saveEventBtn.addEventListener('click', async function() {
                if (!eventForm.checkValidity()) {
                    eventForm.classList.add('was-validated');
                    return;
                }
                
                const token = getToken(); 
                if (!token) {
                    if (typeof showToast === 'function') showToast('Você precisa estar logado para salvar eventos.', true);
                    removeToken(); 
                    window.location.href = 'login.html'; 
                    return;
                }

                const eventData = {
                    title: document.getElementById('eventTitle').value,
                    description: document.getElementById('eventDescription').value,
                    location: document.getElementById('eventLocation').value,
                    eventDate: document.getElementById('eventDate').value,
                    status: document.getElementById('eventStatus').value,
                    imageUrl: document.getElementById('eventImage').value || null,
                    // NOVO: Adiciona o email do cliente contratante
                    contractingClientEmail: document.getElementById('contractingClientEmail') ? document.getElementById('contractingClientEmail').value : null
                };
                
                const eventId = document.getElementById('eventId').value;
                const isEdit = !!eventId; 
                
                try {
                    const response = await fetch(
                        isEdit 
                            ? `${API_BASE_URL}/api/events/${eventId}` 
                            : `${API_BASE_URL}/api/events`, 
                        {
                            method: isEdit ? 'PUT' : 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token 
                            },
                            body: JSON.stringify(eventData) 
                        }
                    );
                    
                    if (response.ok) { 
                        eventModal.hide(); 
                        loadEvents(); 
                        if (typeof showToast === 'function') showToast(isEdit ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
                    } else if (response.status === 401 || response.status === 403) {
                         if (typeof showToast === 'function') showToast('Acesso negado. Você não tem permissão para realizar esta ação.', true);
                         removeToken();
                         window.location.href = 'login.html';
                    } else { 
                        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                        throw new Error(errorData.message || 'Erro ao salvar evento');
                    }
                } catch (error) {
                    console.error('Erro ao salvar evento:', error);
                    if (typeof showToast === 'function') showToast('Erro ao salvar evento: ' + error.message, true);
                }
            });
        }
    }
    
    // Aplicar filtro selecionado
    function applyFilter() {
        if (currentFilter === 'all') {
            loadEvents(); // Sempre recarrega para aplicar filtro e pegar novos eventos
        } else {
            const filteredEvents = events.filter(event => event.status === currentFilter);
            renderEvents(filteredEvents);
        }
    }
    
    // Manipulador de edição
    async function handleEdit(e) {
        const eventId = e.currentTarget.getAttribute('data-id');
        const token = getToken();
        if (!token) { 
            if (typeof showToast === 'function') showToast('Você precisa estar logado para editar eventos.', true);
            window.location.href = 'login.html';
            return;
        }
        if (userRole !== 'ROLE_ADMIN') { 
            if (typeof showToast === 'function') showToast('Acesso negado. Você não tem permissão para editar eventos.', true);
             return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token 
                }
            });
            
            if (response.ok) {
                const event = await response.json();
                
                document.getElementById('eventId').value = event.id;
                document.getElementById('eventTitle').value = event.title;
                document.getElementById('eventDescription').value = event.description || '';
                document.getElementById('eventLocation').value = event.location;
                document.getElementById('eventDate').value = formatDateTimeForInput(event.eventDate);
                document.getElementById('eventImage').value = event.imageUrl || '';
                document.getElementById('eventStatus').value = event.status;
                // NOVO: Preenche o campo de email do cliente contratante
                if (document.getElementById('contractingClientEmail')) {
                    document.getElementById('contractingClientEmail').value = event.contractingClientEmail || '';
                }
                
                modalTitle.textContent = 'Editar Evento';
                saveEventBtn.textContent = 'Atualizar Evento';
                eventModal.show(); 
            } else if (response.status === 401 || response.status === 403) {
                 if (typeof showToast === 'function') showToast('Acesso negado ou token inválido. Faça login novamente.', true);
                 removeToken();
                 window.location.href = 'login.html';
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                throw new Error(errorData.message || 'Erro ao carregar evento para edição');
            }
        } catch (error) {
            console.error('Erro ao carregar evento para edição:', error);
            if (typeof showToast === 'function') showToast('Erro ao carregar evento para edição: ' + error.message, true);
        }
    }
    
    // Manipulador de exclusão
    async function handleDelete(e) {
        if (!confirm('Tem certeza que deseja excluir este evento? Esta ação é irreversível.')) return; 
        
        const eventId = e.currentTarget.getAttribute('data-id');
        const token = getToken();
        if (!token) {
            if (typeof showToast === 'function') showToast('Você precisa estar logado para excluir eventos.', true);
            window.location.href = 'login.html';
            return;
        }
        if (userRole !== 'ROLE_ADMIN') { 
            if (typeof showToast === 'function') showToast('Acesso negado. Você não tem permissão para excluir eventos.', true);
             return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + token 
                }
            });
            
            if (response.ok) {
                loadEvents(); 
                if (typeof showToast === 'function') showToast('Evento excluído com sucesso!');
            } else if (response.status === 401 || response.status === 403) {
                 if (typeof showToast === 'function') showToast('Acesso negado ou token inválido. Faça login novamente.', true);
                 removeToken();
                 window.location.href = 'login.html';
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                throw new Error(errorData.message || 'Erro ao excluir evento');
            }
        } catch (error) {
            console.error('Erro ao excluir evento:', error);
            if (typeof showToast === 'function') showToast('Erro ao excluir evento: ' + error.message, true);
        }
    }
    
    // Funções auxiliares de formatação de data e status
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
    
    function formatDateTimeForInput(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
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
});