document.addEventListener('DOMContentLoaded', function() {
    // Efeito de digitação no título
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const text = heroTitle.innerText;
        heroTitle.innerHTML = '';
        
        let i = 0;
        const typingEffect = setInterval(() => {
            if (i < text.length) {
                heroTitle.innerHTML += text.charAt(i);
                i++;
            } else {
                clearInterval(typingEffect);
            }
        }, 100);
    }

    // Efeito de parallax na imagem de fundo
    window.addEventListener('scroll', function() {
        const scrollPosition = window.pageYOffset;
        const heroImage = document.querySelector('.hero-image');
        if (heroImage) {
            heroImage.style.transform = `translateY(${scrollPosition * 0.5}px)`;
        }
    });

    // Animação dos cards do portfólio
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.1}s`;
    });
});