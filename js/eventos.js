// js/eventos.js

document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = window.API_BASE_URL; 
    const getToken = window.getToken; 
    const getUserRole = window.getUserRole;
    const getUserId = window.getUserId; 
    const removeToken = window.removeToken; 
    const showToast = window.showToast; 

    const eventsContainer = document.getElementById('events-container');
    const eventForm = document.getElementById('eventForm');
    const eventModal = new bootstrap.Modal(document.getElementById('eventModal'));
    const modalTitle = document.getElementById('modalTitle');
    const saveEventBtn = document.getElementById('saveEventBtn');
    const addEventBtn = document.getElementById('add-event-btn');
    
    let currentFilter = 'all';
    let events = []; 
    
    const userRole = getUserRole(); 
    const userId = getUserId(); 
    
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

    loadEvents(); 
    setupEventListeners(); 
    
    if (addEventBtn) { 
        if (userRole === 'ADMIN') { 
            addEventBtn.style.display = 'block'; 
        } else {
            addEventBtn.style.display = 'none'; 
        }
    }

    async function loadEvents() {
        try {
            eventsContainer.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-light" role="status">
                        <span class="visually-hidden">Carregando...</span>
                    </div>
                </div>
            `;
            
            let fetchUrl;
            let headers = {
                'Content-Type': 'application/json',
                'Authorization': getToken() ? 'Bearer ' + getToken() : '' 
            };

            if (userRole === 'ADMIN') { 
                fetchUrl = `${API_BASE_URL}/eventos/all`; 
            } else {
                fetchUrl = `${API_BASE_URL}/eventos/`; 
            }

            const response = await fetch(fetchUrl, { headers });

            if (response.ok) { 
                events = await response.json(); 
            } else if (response.status === 204) { 
                events = [];
            } else if (response.status === 401 || response.status === 403) {
                console.warn("Sessão expirada ou não autorizada. Limpando token e redirecionando.");
                removeToken(); 
                window.location.href = 'login.html';
                return; 
            } else { 
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                throw new Error(errorData.message || 'Erro ao carregar eventos');
            }
            
            renderEvents(events); 
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
            eventsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-danger">Erro ao carregar eventos. Tente recarregar a página.</p>
                    <button class="btn btn-primary" onclick="location.reload()">Recarregar</button>
                </div>
            `;
            showToast('Erro ao carregar eventos: ' + error.message, true);
        }
    }
    
    function renderEvents(eventsToRender) {
        if (eventsToRender.length === 0) {
            let noEventsMessage = 'Nenhum evento encontrado no momento.';
            if (userRole === 'USER') { 
                noEventsMessage = 'Você ainda não possui eventos contratados ou associados à sua conta.';
            } else if (userRole === 'ADMIN') { 
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
            
            // Adiciona um listener de clique no card para redirecionar
            eventElement.addEventListener('click', () => {
                window.location.href = `detalhes-evento.html?id=${event.id}`;
            });

            let actionButtonsHtml = '';
            if (userRole === 'ADMIN') { 
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
                <div class="event-image" style="background: var(--cinza-escuro); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-calendar-alt fa-3x" style="color: var(--verde);"></i>
                </div>
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
                    ${event.contractingClientName ? `<p class="event-client"><i class="fas fa-user-tie"></i> Cliente: ${event.contractingClientName}</p>` : ''} 
                    <div class="event-actions">
                        ${actionButtonsHtml}
                    </div>
                </div>
            `;
            
            eventsContainer.appendChild(eventElement);
        });
        
        if (userRole === 'ADMIN') { 
            // Os event listeners para editar e deletar devem ser adicionados APÓS o card ter sido adicionado ao DOM,
            // e eles devem impedir a propagação do clique para o card principal.
            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Impede que o clique no botão ative o redirecionamento do card
                    handleEdit(e);
                });
            });
            
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Impede que o clique no botão ative o redirecionamento do card
                    handleDelete(e);
                });
            });
        }
        
        AOS.refresh(); 
    }
    
    function setupEventListeners() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.getAttribute('data-filter');
                applyFilter();
            });
        });
        
        if (userRole === 'ADMIN' && addEventBtn) { 
            addEventBtn.addEventListener('click', function() {
                eventForm.reset();
                document.getElementById('eventId').value = ''; 
                modalTitle.textContent = 'Adicionar Novo Evento';
                saveEventBtn.textContent = 'Salvar Evento';
                eventModal.show();
            });
        }
        
        if (saveEventBtn) { 
            saveEventBtn.addEventListener('click', async function() {
                if (!eventForm.checkValidity()) {
                    eventForm.classList.add('was-validated');
                    return;
                }
                
                const token = getToken(); 
                if (!token) {
                    showToast('Você precisa estar logado para salvar eventos.', true);
                    removeToken(); 
                    window.location.href = 'login.html'; 
                    return;
                }
                if (userRole !== 'ADMIN') { 
                    showToast('Acesso negado. Você não tem permissão para criar/editar eventos.', true);
                    return;
                }

                const eventData = {
                    title: document.getElementById('eventTitle').value,
                    description: document.getElementById('eventDescription').value,
                    location: document.getElementById('eventLocation').value,
                    eventDate: document.getElementById('eventDate').value,
                    status: document.getElementById('eventStatus').value,
                };
                
                const eventId = document.getElementById('eventId').value;
                const isEdit = !!eventId; 
                
                try {
                    const response = await fetch(
                        isEdit 
                            ? `${API_BASE_URL}/eventos/${eventId}` 
                            : `${API_BASE_URL}/eventos/criarEvento`, 
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
                        showToast(isEdit ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
                    } else if (response.status === 401 || response.status === 403) {
                         showToast('Acesso negado. Você não tem permissão para realizar esta ação.', true);
                         removeToken();
                         window.location.href = 'login.html';
                    } else { 
                        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                        throw new Error(errorData.message || 'Erro ao salvar evento');
                    }
                } catch (error) {
                    console.error('Erro ao salvar evento:', error);
                    showToast('Erro ao salvar evento: ' + error.message, true);
                }
            });
        }
    }
    
    function applyFilter() {
        if (currentFilter === 'all') {
            loadEvents(); 
        } else {
            const filteredEvents = events.filter(event => event.status === currentFilter);
            renderEvents(filteredEvents);
        }
    }
    
    async function handleEdit(e) {
        const eventId = e.currentTarget.getAttribute('data-id');
        const token = getToken();
        if (!token) { 
            showToast('Você precisa estar logado para editar eventos.', true);
            window.location.href = 'login.html';
            return;
        }
        if (getUserRole() !== 'ADMIN') { 
            showToast('Acesso negado. Você não tem permissão para editar eventos.', true);
             return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/eventos/${eventId}`, {
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
                document.getElementById('eventStatus').value = event.status;
                
                modalTitle.textContent = 'Editar Evento';
                saveEventBtn.textContent = 'Atualizar Evento';
                eventModal.show(); 
            } else if (response.status === 401 || response.status === 403) {
                 showToast('Acesso negado ou token inválido. Faça login novamente.', true);
                 removeToken();
                 window.location.href = 'login.html';
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                throw new Error(errorData.message || 'Erro ao carregar evento para edição');
            }
        } catch (error) {
            console.error('Erro ao carregar evento para edição:', error);
            showToast('Erro ao carregar evento para edição: ' + error.message, true);
        }
    }
    
    async function handleDelete(e) {
        if (!confirm('Tem certeza que deseja excluir este evento? Esta ação é irreversível.')) return; 
        
        const eventId = e.currentTarget.getAttribute('data-id');
        const token = getToken();
        if (!token) {
            showToast('Você precisa estar logado para excluir eventos.', true);
            window.location.href = 'login.html';
            return;
        }
        if (getUserRole() !== 'ADMIN') { 
            showToast('Acesso negado. Você não tem permissão para excluir eventos.', true);
             return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/eventos/${eventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + token 
                }
            });
            
            if (response.ok) {
                loadEvents(); 
                showToast('Evento excluído com sucesso!');
            } else if (response.status === 401 || response.status === 403) {
                 showToast('Acesso negado ou token inválido. Faça login novamente.', true);
                 removeToken();
                 window.location.href = 'login.html';
            } else {
                const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
                throw new Error(errorData.message || 'Erro ao excluir evento');
            }
        } catch (error) {
            console.error('Erro ao excluir evento:', error);
            showToast('Erro ao excluir evento: ' + error.message, true);
        }
    }
});