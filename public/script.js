// ========================================
// monopo.london-inspired Interactive Features
// ========================================

// ========================================
// Custom Cursor
// ========================================

class CustomCursor {
    constructor() {
        this.cursor = document.querySelector('[data-cursor]');
        this.follower = document.querySelector('[data-cursor-follower]');

        if (!this.cursor || !this.follower) return;
        if (window.innerWidth <= 768) return; // Disable on mobile

        this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.followerPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.speed = 0.15;

        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.pos.x = e.clientX;
            this.pos.y = e.clientY;
        });

        // Hover effects
        const hoverElements = document.querySelectorAll('[data-cursor-text], a, button, .project-card, .service-item');

        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.follower.classList.add('expand');
            });

            el.addEventListener('mouseleave', () => {
                this.follower.classList.remove('expand');
            });
        });

        this.animate();
    }

    animate() {
        // Smooth cursor
        this.cursor.style.left = this.pos.x + 'px';
        this.cursor.style.top = this.pos.y + 'px';

        // Smooth follower with lag
        this.followerPos.x += (this.pos.x - this.followerPos.x) * this.speed;
        this.followerPos.y += (this.pos.y - this.followerPos.y) * this.speed;

        this.follower.style.left = this.followerPos.x + 'px';
        this.follower.style.top = this.followerPos.y + 'px';

        requestAnimationFrame(() => this.animate());
    }
}

// ========================================
// Smooth Scroll with Lenis
// ========================================

class SmoothScroll {
    constructor() {
        if (typeof Lenis === 'undefined') {
            console.warn('Lenis not loaded');
            return;
        }

        this.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        this.init();
    }

    init() {
        // Lenis animation frame
        const raf = (time) => {
            this.lenis.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    this.lenis.scrollTo(target, {
                        offset: 0,
                        duration: 1.5,
                    });
                }
            });
        });
    }

    stop() {
        if (this.lenis) this.lenis.stop();
    }

    start() {
        if (this.lenis) this.lenis.start();
    }
}

// ========================================
// Navigation Overlay
// ========================================

class Navigation {
    constructor() {
        this.burger = document.querySelector('[data-burger]');
        this.overlay = document.querySelector('[data-nav-overlay]');
        this.navLinks = document.querySelectorAll('[data-nav-link]');

        if (!this.burger || !this.overlay) return;

        this.isOpen = false;
        this.init();
    }

    init() {
        // Toggle menu
        this.burger.addEventListener('click', () => {
            this.toggle();
        });

        // Close on link click
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.close();
            });
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.burger.classList.add('active');
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Stop smooth scroll
        if (window.smoothScroll) window.smoothScroll.stop();
    }

    close() {
        this.isOpen = false;
        this.burger.classList.remove('active');
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';

        // Resume smooth scroll
        if (window.smoothScroll) window.smoothScroll.start();
    }
}

// ========================================
// Canvas Animation (Simple grid pattern)
// ========================================

class CanvasAnimation {
    constructor() {
        this.container = document.querySelector('[data-canvas]');
        if (!this.container) return;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        this.gridSize = 40;
        this.mousePos = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => {
            this.mousePos.x = e.clientX;
            this.mousePos.y = e.clientY;
        });

        this.animate();
    }

    resize() {
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw subtle grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        requestAnimationFrame(() => this.animate());
    }
}

// ========================================
// Scroll Reveal Animations
// ========================================

class ScrollReveal {
    constructor() {
        this.sections = document.querySelectorAll('section');
        if (this.sections.length === 0) return;

        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '-50px'
        });

        this.sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(50px)';
            section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            observer.observe(section);
        });

        // First section should be visible
        if (this.sections[0]) {
            this.sections[0].style.opacity = '1';
            this.sections[0].style.transform = 'translateY(0)';
        }
    }
}

// ========================================
// Initialize Everything
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize modules
    new CustomCursor();
    window.smoothScroll = new SmoothScroll();
    new Navigation();
    new CanvasAnimation();
    new ScrollReveal();

    // Add loaded class
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Prevent default cursor on custom cursor elements
if (window.innerWidth > 768) {
    document.addEventListener('mousemove', function() {
        document.body.style.cursor = 'none';
    });
}
