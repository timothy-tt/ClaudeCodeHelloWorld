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
