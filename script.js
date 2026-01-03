// ========================================
// Bouncing Bubble with Physics
// ========================================

class BouncingBubble {
    constructor() {
        this.bubble = document.querySelector('.bouncing-bubble');
        if (!this.bubble) return;

        this.x = Math.random() * (window.innerWidth - 150);
        this.y = Math.random() * (window.innerHeight - 150);
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.size = 120;
        this.speed = 3;
        this.bounce = 0.95;

        this.init();
    }

    init() {
        this.bubble.style.width = `${this.size}px`;
        this.bubble.style.height = `${this.size}px`;
        this.animate();
        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        const maxX = window.innerWidth - this.size;
        const maxY = window.innerHeight - this.size;

        if (this.x > maxX) this.x = maxX;
        if (this.y > maxY) this.y = maxY;
    }

    animate() {
        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Boundary collision detection with bounce
        const maxX = window.innerWidth - this.size;
        const maxY = window.innerHeight - this.size;

        if (this.x <= 0) {
            this.x = 0;
            this.vx = Math.abs(this.vx) * this.bounce;
            this.addRandomness();
        } else if (this.x >= maxX) {
            this.x = maxX;
            this.vx = -Math.abs(this.vx) * this.bounce;
            this.addRandomness();
        }

        if (this.y <= 0) {
            this.y = 0;
            this.vy = Math.abs(this.vy) * this.bounce;
            this.addRandomness();
        } else if (this.y >= maxY) {
            this.y = maxY;
            this.vy = -Math.abs(this.vy) * this.bounce;
            this.addRandomness();
        }

        // Maintain consistent speed
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed > 0) {
            this.vx = (this.vx / currentSpeed) * this.speed;
            this.vy = (this.vy / currentSpeed) * this.speed;
        }

        // Apply position
        this.bubble.style.transform = `translate(${this.x}px, ${this.y}px)`;

        requestAnimationFrame(() => this.animate());
    }

    addRandomness() {
        // Add slight random variation to direction on bounce
        this.vx += (Math.random() - 0.5) * 0.5;
        this.vy += (Math.random() - 0.5) * 0.5;
    }
}

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
    new BouncingBubble();
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
