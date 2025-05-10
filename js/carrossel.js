document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.servico-card');
    const indicadores = document.querySelectorAll('.indicador');
    const btnPrev = document.querySelector('.prev');
    const btnNext = document.querySelector('.next');
    let currentIndex = 0;
    const totalCards = cards.length;
    let autoPlayInterval;

    function showCard(index) {
        // Remove todas as classes active
        cards.forEach(card => card.classList.remove('active'));
        indicadores.forEach(ind => ind.classList.remove('active'));
        
        // Adiciona active no card e indicador atual
        cards[index].classList.add('active');
        indicadores[index].classList.add('active');
        
        // Reinicia animação
        cards[index].style.animation = 'none';
        void cards[index].offsetWidth; // Trigger reflow
        cards[index].style.animation = 'fadeIn 0.6s ease';
    }

    function nextCard() {
        currentIndex = (currentIndex + 1) % totalCards;
        showCard(currentIndex);
    }

    function prevCard() {
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        showCard(currentIndex);
    }

    // Event listeners
    btnNext.addEventListener('click', function() {
        nextCard();
        resetAutoPlay();
    });

    btnPrev.addEventListener('click', function() {
        prevCard();
        resetAutoPlay();
    });

    // Indicadores clicáveis
    indicadores.forEach((ind, index) => {
        ind.addEventListener('click', () => {
            currentIndex = index;
            showCard(currentIndex);
            resetAutoPlay();
        });
    });

    // Autoplay com reset ao interagir
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextCard, 5000);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    // Inicia o carrossel
    showCard(currentIndex);
    startAutoPlay();
});