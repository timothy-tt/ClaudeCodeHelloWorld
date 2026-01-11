// ========================================
// Liquid Glass Utilities (from shuding/liquid-glass)
// ========================================

function smoothStep(a, b, t) {
    t = Math.max(0, Math.min(1, (t - a) / (b - a)));
    return t * t * (3 - 2 * t);
}

function length(x, y) {
    return Math.sqrt(x * x + y * y);
}

function roundedRectSDF(x, y, width, height, radius) {
    const qx = Math.abs(x) - width + radius;
    const qy = Math.abs(y) - height + radius;
    return Math.min(Math.max(qx, qy), 0) + length(Math.max(qx, 0), Math.max(qy, 0)) - radius;
}

function texture(x, y) {
    return { type: 't', x, y };
}

function generateId() {
    return 'liquid-glass-' + Math.random().toString(36).substr(2, 9);
}

// ========================================
// Liquid Glass Shader for Bubble
// ========================================

class LiquidGlassShader {
    constructor(bubbleElement, options = {}) {
        this.bubble = bubbleElement;
        this.width = options.width || 120;
        this.height = options.height || 120;
        this.fragment = options.fragment || ((uv) => texture(uv.x, uv.y));
        this.canvasDPI = 1;
        this.id = generateId();

        this.createFilter();
        this.updateShader();
    }

    createFilter() {
        // Create SVG filter
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        this.svg.setAttribute('width', '0');
        this.svg.setAttribute('height', '0');
        this.svg.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 998;
        `;

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
        filter.setAttribute('id', `${this.id}_filter`);
        filter.setAttribute('filterUnits', 'userSpaceOnUse');
        filter.setAttribute('colorInterpolationFilters', 'sRGB');
        filter.setAttribute('x', '0');
        filter.setAttribute('y', '0');
        filter.setAttribute('width', this.width.toString());
        filter.setAttribute('height', this.height.toString());

        this.feImage = document.createElementNS('http://www.w3.org/2000/svg', 'feImage');
        this.feImage.setAttribute('id', `${this.id}_map`);
        this.feImage.setAttribute('width', this.width.toString());
        this.feImage.setAttribute('height', this.height.toString());

        this.feDisplacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
        this.feDisplacementMap.setAttribute('in', 'SourceGraphic');
        this.feDisplacementMap.setAttribute('in2', `${this.id}_map`);
        this.feDisplacementMap.setAttribute('xChannelSelector', 'R');
        this.feDisplacementMap.setAttribute('yChannelSelector', 'G');

        filter.appendChild(this.feImage);
        filter.appendChild(this.feDisplacementMap);
        defs.appendChild(filter);
        this.svg.appendChild(defs);

        // Create canvas for displacement map (hidden)
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width * this.canvasDPI;
        this.canvas.height = this.height * this.canvasDPI;
        this.canvas.style.display = 'none';

        this.context = this.canvas.getContext('2d');

        // Append to document
        document.body.appendChild(this.svg);

        // Apply filter to bubble
        const currentBackdrop = 'blur(20px) saturate(180%)';
        this.bubble.style.backdropFilter = `url(#${this.id}_filter) ${currentBackdrop}`;
        this.bubble.style.webkitBackdropFilter = `url(#${this.id}_filter) ${currentBackdrop}`;
    }

    updateShader() {
        const w = this.width * this.canvasDPI;
        const h = this.height * this.canvasDPI;
        const data = new Uint8ClampedArray(w * h * 4);

        let maxScale = 0;
        const rawValues = [];

        for (let i = 0; i < data.length; i += 4) {
            const x = (i / 4) % w;
            const y = Math.floor(i / 4 / w);
            const pos = this.fragment({ x: x / w, y: y / h });
            const dx = pos.x * w - x;
            const dy = pos.y * h - y;
            maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy));
            rawValues.push(dx, dy);
        }

        maxScale *= 0.5;

        let index = 0;
        for (let i = 0; i < data.length; i += 4) {
            const r = rawValues[index++] / maxScale + 0.5;
            const g = rawValues[index++] / maxScale + 0.5;
            data[i] = r * 255;
            data[i + 1] = g * 255;
            data[i + 2] = 0;
            data[i + 3] = 255;
        }

        this.context.putImageData(new ImageData(data, w, h), 0, 0);
        this.feImage.setAttributeNS('http://www.w3.org/1999/xlink', 'href', this.canvas.toDataURL());
        this.feDisplacementMap.setAttribute('scale', (maxScale / this.canvasDPI).toString());
    }

    destroy() {
        this.svg.remove();
        this.canvas.remove();
    }
}

// ========================================
// Bouncing Bubble with Liquid Glass
// ========================================

class BouncingBubble {
    constructor() {
        this.bubble = document.querySelector('.bouncing-bubble');
        if (!this.bubble) return;

        // Position
        this.x = window.innerWidth / 2 - 60;
        this.y = window.innerHeight / 2 - 60;
        this.targetX = this.x;
        this.targetY = this.y;

        // Size
        this.size = 120;

        // Gentle floating
        this.floatTime = 0;
        this.floatSpeed = 0.001;
        this.floatAmplitude = 30;

        // Mouse interaction
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.mouseInfluence = 0.15;
        this.easing = 0.05;

        this.init();
    }

    init() {
        this.bubble.style.width = `${this.size}px`;
        this.bubble.style.height = `${this.size}px`;

        // Initialize liquid glass shader with circular displacement
        this.shader = new LiquidGlassShader(this.bubble, {
            width: this.size,
            height: this.size,
            fragment: (uv) => {
                const ix = uv.x - 0.5;
                const iy = uv.y - 0.5;

                // Circular distance from center
                const dist = Math.sqrt(ix * ix + iy * iy);

                // Create circular liquid glass effect
                const displacement = smoothStep(0.5, 0, dist);
                const scaled = smoothStep(0, 1, displacement * 0.85);

                return texture(ix * scaled + 0.5, iy * scaled + 0.5);
            }
        });

        this.setupMouseTracking();
        this.animate();
        window.addEventListener('resize', () => this.handleResize());
    }

    setupMouseTracking() {
        // Mouse tracking
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        // Touch tracking
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouseX = e.touches[0].clientX;
                this.mouseY = e.touches[0].clientY;
            }
        }, { passive: true });
    }

    handleResize() {
        const maxX = window.innerWidth - this.size;
        const maxY = window.innerHeight - this.size;

        if (this.x > maxX) this.x = maxX;
        if (this.y > maxY) this.y = maxY;
        if (this.targetX > maxX) this.targetX = maxX;
        if (this.targetY > maxY) this.targetY = maxY;
    }

    animate() {
        this.floatTime += this.floatSpeed;

        // Calculate gentle floating motion using sine waves
        const floatX = Math.sin(this.floatTime * 2) * this.floatAmplitude;
        const floatY = Math.cos(this.floatTime * 1.5) * this.floatAmplitude;

        // Calculate distance from mouse
        const dx = this.mouseX - (this.x + this.size / 2);
        const dy = this.mouseY - (this.y + this.size / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Gentle repulsion from mouse (when close)
        const repelDistance = 200;
        let repelX = 0;
        let repelY = 0;

        if (distance < repelDistance && distance > 0) {
            const repelStrength = (1 - distance / repelDistance) * 50;
            repelX = -(dx / distance) * repelStrength;
            repelY = -(dy / distance) * repelStrength;
        }

        // Set target position with floating and mouse influence
        const centerX = window.innerWidth / 2 - this.size / 2;
        const centerY = window.innerHeight / 2 - this.size / 2;

        this.targetX = centerX + floatX + repelX;
        this.targetY = centerY + floatY + repelY;

        // Constrain to viewport
        const maxX = window.innerWidth - this.size;
        const maxY = window.innerHeight - this.size;

        this.targetX = Math.max(0, Math.min(maxX, this.targetX));
        this.targetY = Math.max(0, Math.min(maxY, this.targetY));

        // Smooth easing to target position
        this.x += (this.targetX - this.x) * this.easing;
        this.y += (this.targetY - this.y) * this.easing;

        // Apply position
        this.bubble.style.transform = `translate(${this.x}px, ${this.y}px)`;

        requestAnimationFrame(() => this.animate());
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
