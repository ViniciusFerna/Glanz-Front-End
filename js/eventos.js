document.addEventListener('DOMContentLoaded', function() {
    // Configurações
    const apiUrl = 'http://localhost:8080/api/events';
    const token = localStorage.getItem('authToken');

    // Verificação de segurança - Elementos do DOM
    const elements = {
        form: document.getElementById('eventForm'),
        list: document.getElementById('eventsList'),
        modal: document.getElementById('eventModal'),
        newBtn: document.getElementById('newEventBtn'),
        closeBtn: document.querySelector('.close')
    };

    // Verificar se todos elementos existem
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Elemento crítico não encontrado: ${key}`);
            return;
        }
    }

    // Verificar autenticação
    if (!token) {
        alert('Acesso não autorizado. Redirecionando para login...');
        window.location.href = 'login.html';
        return;
    }

    // Headers para requisições
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // Event Listeners (com verificação)
    elements.newBtn.addEventListener('click', () => openEventModal());
    elements.closeBtn.addEventListener('click', closeEventModal);
    elements.form.addEventListener('submit', handleFormSubmit);
    window.addEventListener('click', outsideModalClick);

    // Carregar eventos iniciais
    loadEvents();

    // --- Funções Principais ---
    function openEventModal(event = null) {
        if (event) {
            document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Editar Evento';
            document.getElementById('eventId').value = event.id;
            document.getElementById('title').value = event.title;
            document.getElementById('description').value = event.description || '';
            document.getElementById('location').value = event.location;
            
            const eventDate = new Date(event.eventDate);
            const timezoneOffset = eventDate.getTimezoneOffset() * 60000;
            const localDate = new Date(eventDate.getTime() - timezoneOffset);
            document.getElementById('eventDate').value = localDate.toISOString().slice(0, 16);
            
            document.getElementById('status').value = event.status;
        } else {
            document.getElementById('modalTitle').innerHTML = '<i class="fas fa-calendar-plus"></i> Novo Evento';
            elements.form.reset();
            document.getElementById('eventId').value = '';
        }
        elements.modal.style.display = 'block';
    }

    function closeEventModal() {
        elements.modal.style.display = 'none';
    }

    function outsideModalClick(e) {
        if (e.target === elements.modal) {
            closeEventModal();
        }
    }

    async function loadEvents() {
        try {
            elements.list.innerHTML = '<div class="loading-events"><i class="fas fa-spinner fa-spin"></i> Carregando eventos...</div>';
            
            const response = await fetch(apiUrl, { 
                headers,
                signal: AbortSignal.timeout(5000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} - ${response.statusText}`);
            }
            
            const events = await response.json();
            renderEvents(events);
        } catch (error) {
            console.error("Falha ao carregar eventos:", error);
            elements.list.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${getErrorMessage(error)}</p>
                    <button onclick="location.reload()" class="btn">
                        <i class="fas fa-sync-alt"></i> Recarregar
                    </button>
                </div>
            `;
        }
    }

    function renderEvents(events) {
        if (!events || !Array.isArray(events)) {
            console.error('Dados de eventos inválidos:', events);
            return;
        }

        if (events.length === 0) {
            elements.list.innerHTML = '<div class="no-events"><i class="fas fa-calendar-plus"></i> Nenhum evento encontrado</div>';
            return;
        }

        elements.list.innerHTML = '';
        events.forEach(event => {
            const eventCard = createEventCard(event);
            elements.list.appendChild(eventCard);
        });
    }

    function createEventCard(event) {
        const eventDate = new Date(event.eventDate);
        const formattedDate = eventDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <h3>${event.title}</h3>
            ${event.description ? `<p>${event.description}</p>` : ''}
            <p><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
            <p class="event-date"><i class="far fa-clock"></i> ${formattedDate}</p>
            <span class="event-status status-${event.status}">${formatStatus(event.status)}</span>
            <div class="event-actions">
                <button class="edit-btn">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="delete-btn">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        `;

        // Event Delegation (mais seguro que addEventListener individual)
        card.querySelector('.edit-btn').onclick = () => fetchEventDetails(event.id);
        card.querySelector('.delete-btn').onclick = () => confirmDelete(event.id);

        return card;
    }

    async function fetchEventDetails(id) {
        try {
            const response = await fetch(`${apiUrl}/${id}`, { headers });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const event = await response.json();
            openEventModal(event);
        } catch (error) {
            console.error('Erro ao carregar evento:', error);
            alert(`Erro: ${getErrorMessage(error)}`);
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            submitBtn.disabled = true;
            
            const eventData = getFormData();
            const response = await saveEvent(eventData);
            
            if (response.ok) {
                closeEventModal();
                loadEvents();
            } else {
                throw new Error(await response.text());
            }
        } catch (error) {
            console.error('Erro no formulário:', error);
            alert(`Erro ao salvar: ${getErrorMessage(error)}`);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    function getFormData() {
        return {
            id: document.getElementById('eventId').value,
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            location: document.getElementById('location').value,
            eventDate: document.getElementById('eventDate').value,
            status: document.getElementById('status').value
        };
    }

    async function saveEvent(eventData) {
        const { id, ...data } = eventData;
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${apiUrl}/${id}` : apiUrl;

        return await fetch(url, {
            method,
            headers,
            body: JSON.stringify(data)
        });
    }

    async function confirmDelete(id) {
        if (!confirm('Tem certeza que deseja excluir este evento permanentemente?')) {
            return;
        }
        
        try {
            const response = await fetch(`${apiUrl}/${id}`, {
                method: 'DELETE',
                headers
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            loadEvents();
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert(`Erro: ${getErrorMessage(error)}`);
        }
    }

    // --- Funções Auxiliares ---
    function formatStatus(status) {
        const statusMap = {
            'PLANEJADO': 'Planejado',
            'EM_ANDAMENTO': 'Em Andamento',
            'CONCLUIDO': 'Concluído',
            'CANCELADO': 'Cancelado'
        };
        return statusMap[status] || status;
    }

    function getErrorMessage(error) {
        const messages = {
            'Failed to fetch': 'Não foi possível conectar ao servidor',
            'AbortError': 'Tempo de conexão esgotado',
            '401': 'Sessão expirada - Faça login novamente',
            '404': 'Evento não encontrado'
        };
        
        return messages[error.message] || 
               messages[error.name] || 
               error.message || 
               'Erro desconhecido';
    }
});

// Debug helper (remova em produção)
console.log('Eventos.js carregado com sucesso');