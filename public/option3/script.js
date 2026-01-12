// ========================================
// Custom Cursor
// ========================================

class CustomCursor {
    constructor() {
        this.cursor = document.querySelector('[data-cursor]');
        this.follower = document.querySelector('[data-cursor-follower]');

        if (!this.cursor || !this.follower) return;

        this.cursorPos = { x: 0, y: 0 };
        this.followerPos = { x: 0, y: 0 };
        this.speed = 0.15;

        this.init();
    }

    init() {
        // Mouse move
        document.addEventListener('mousemove', (e) => {
            this.cursorPos.x = e.clientX;
            this.cursorPos.y = e.clientY;

            this.cursor.style.left = e.clientX + 'px';
            this.cursor.style.top = e.clientY + 'px';
        });

        // Animate follower with lag
        this.animateFollower();

        // Hover effects
        const interactiveElements = document.querySelectorAll('a, button, [data-cursor-text]');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.follower.classList.add('expand'));
            el.addEventListener('mouseleave', () => this.follower.classList.remove('expand'));
        });
    }

    animateFollower() {
        this.followerPos.x += (this.cursorPos.x - this.followerPos.x) * this.speed;
        this.followerPos.y += (this.cursorPos.y - this.followerPos.y) * this.speed;

        this.follower.style.left = this.followerPos.x + 'px';
        this.follower.style.top = this.followerPos.y + 'px';

        requestAnimationFrame(() => this.animateFollower());
    }
}

// ========================================
// Smooth Scroll
// ========================================

class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }
}

// ========================================
// Initialize
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Check if touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        new CustomCursor();
    }

    new SmoothScroll();
});
