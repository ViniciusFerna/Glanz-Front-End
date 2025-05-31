document.addEventListener('DOMContentLoaded', function() {
    const eventsContainer = document.getElementById('events-container');
    const eventForm = document.getElementById('eventForm');
    const eventModal = new bootstrap.Modal(document.getElementById('eventModal'));
    const modalTitle = document.getElementById('modalTitle');
    const saveEventBtn = document.getElementById('saveEventBtn');
    const addEventBtn = document.getElementById('add-event-btn');
    
    let currentFilter = 'all';
    let events = [];
    
    // Inicialização
    loadEvents();
    setupEventListeners();
    
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
            
            const response = await fetch('http://localhost:8080/api/events');
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
        }
    }
    
    // Renderizar eventos na tela
    function renderEvents(eventsToRender) {
        if (eventsToRender.length === 0) {
            eventsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-calendar-times fa-3x mb-3" style="color: var(--verde);"></i>
                    <h4>Nenhum evento encontrado</h4>
                    <p>Não há eventos cadastrados no momento.</p>
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
                    <div class="event-actions">
                        <button class="btn btn-outline-verde btn-edit" data-id="${event.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-outline-danger btn-delete" data-id="${event.id}">
                            <i class="fas fa-trash-alt"></i> Excluir
                        </button>
                    </div>
                </div>
            `;
            
            eventsContainer.appendChild(eventElement);
        });
        
        // Adicionar listeners aos botões de ação
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', handleEdit);
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    }
    
    // Configurar listeners de eventos
    function setupEventListeners() {
        // Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.getAttribute('data-filter');
                applyFilter();
            });
        });
        
        // Adicionar novo evento
        addEventBtn.addEventListener('click', function() {
            eventForm.reset();
            document.getElementById('eventId').value = '';
            modalTitle.textContent = 'Adicionar Novo Evento';
            saveEventBtn.textContent = 'Salvar Evento';
            eventModal.show();
        });
        
        // Salvar evento (criar/atualizar)
        saveEventBtn.addEventListener('click', async function() {
            if (!eventForm.checkValidity()) {
                eventForm.classList.add('was-validated');
                return;
            }
            
            const eventData = {
                title: document.getElementById('eventTitle').value,
                description: document.getElementById('eventDescription').value,
                location: document.getElementById('eventLocation').value,
                eventDate: document.getElementById('eventDate').value,
                status: document.getElementById('eventStatus').value,
                imageUrl: document.getElementById('eventImage').value || null
            };
            
            const eventId = document.getElementById('eventId').value;
            const isEdit = !!eventId;
            
            try {
                const response = await fetch(
                    isEdit 
                        ? `http://localhost:8080/api/events/${eventId}`
                        : 'http://localhost:8080/api/events',
                    {
                        method: isEdit ? 'PUT' : 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(eventData)
                    }
                );
                
                if (response.ok) {
                    eventModal.hide();
                    loadEvents();
                    showToast(isEdit ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
                } else {
                    throw new Error('Erro ao salvar evento');
                }
            } catch (error) {
                console.error('Erro ao salvar evento:', error);
                showToast('Erro ao salvar evento. Tente novamente.', true);
            }
        });
    }
    
    // Aplicar filtro selecionado
    function applyFilter() {
        if (currentFilter === 'all') {
            renderEvents(events);
        } else {
            const filteredEvents = events.filter(event => event.status === currentFilter);
            renderEvents(filteredEvents);
        }
    }
    
    // Manipulador de edição
    async function handleEdit(e) {
        const eventId = e.currentTarget.getAttribute('data-id');
        
        try {
            const response = await fetch(`http://localhost:8080/api/events/${eventId}`);
            const event = await response.json();
            
            // Preencher formulário
            document.getElementById('eventId').value = event.id;
            document.getElementById('eventTitle').value = event.title;
            document.getElementById('eventDescription').value = event.description || '';
            document.getElementById('eventLocation').value = event.location;
            document.getElementById('eventDate').value = formatDateTimeForInput(event.eventDate);
            document.getElementById('eventImage').value = event.imageUrl || '';
            document.getElementById('eventStatus').value = event.status;
            
            modalTitle.textContent = 'Editar Evento';
            saveEventBtn.textContent = 'Atualizar Evento';
            eventModal.show();
        } catch (error) {
            console.error('Erro ao carregar evento para edição:', error);
            showToast('Erro ao carregar evento para edição', true);
        }
    }
    
    // Manipulador de exclusão
    async function handleDelete(e) {
        if (!confirm('Tem certeza que deseja excluir este evento?')) return;
        
        const eventId = e.currentTarget.getAttribute('data-id');
        
        try {
            const response = await fetch(`http://localhost:8080/api/events/${eventId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadEvents();
                showToast('Evento excluído com sucesso!');
            } else {
                throw new Error('Erro ao excluir evento');
            }
        } catch (error) {
            console.error('Erro ao excluir evento:', error);
            showToast('Erro ao excluir evento. Tente novamente.', true);
        }
    }
    
    // Funções auxiliares
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
        const isoString = date.toISOString();
        return isoString.substring(0, isoString.length - 1);
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
    
    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = `toast-message ${isError ? 'error' : 'success'}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${isError ? 'fa-times-circle' : 'fa-check-circle'}"></i>
                <span>${message}</span>
            </div>
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