// ========================================
// Hero Background Slideshow
// ========================================

class HeroSlideshow {
    constructor() {
        this.hero = document.querySelector('.hero');
        if (!this.hero) return;

        // Unsplash images for "Product Design" theme
        this.images = [
            'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1920&q=80',  // Design workspace
            'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=1920&q=80',  // Product design tools
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',  // Minimal design
            'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1920&q=80'   // Modern workspace
        ];

        this.currentIndex = 0;
        this.init();
    }

    init() {
        // Create background layers
        this.images.forEach((imgUrl, index) => {
            const bgLayer = document.createElement('div');
            bgLayer.classList.add('hero-bg-layer');
            if (index === 0) bgLayer.classList.add('active');
            bgLayer.style.backgroundImage = `url(${imgUrl})`;
            this.hero.insertBefore(bgLayer, this.hero.firstChild);
        });

        // Start slideshow
        setInterval(() => this.nextSlide(), 5000);
    }

    nextSlide() {
        const layers = document.querySelectorAll('.hero-bg-layer');
        layers[this.currentIndex].classList.remove('active');

        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        layers[this.currentIndex].classList.add('active');
    }
}

// ========================================
// Initialize on DOM Load
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    new HeroSlideshow();
});

// ========================================
// Smooth Scroll Enhancement
// ========================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
