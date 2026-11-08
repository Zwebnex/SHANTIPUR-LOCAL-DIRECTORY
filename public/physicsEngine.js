// physicsEngine.js - Dual-Mode Antigravity Physics, 3D Tilt & Cultural Particle Canvas
(function() {
  window.SHANTIPUR_PHYSICS = {
    isZeroG: true,
    particles: [],
    mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false },

    init() {
      this.initParticles();
      this.initTiltCards();
      this.initFloatingCards();
      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.active = true;
      });
      window.addEventListener('resize', () => this.resizeCanvas());
    },

    togglePhysics(forcedState) {
      if (typeof forcedState === 'boolean') {
        this.isZeroG = forcedState;
      } else {
        this.isZeroG = !this.isZeroG;
      }

      const floatingContainer = document.getElementById('floating-cards-container');
      const toggleBtn = document.getElementById('physics-toggle-pill');
      const lang = window.SHANTIPUR_DATA.currentLang;
      const t = window.SHANTIPUR_DATA.translations[lang];

      if (this.isZeroG) {
        floatingContainer?.classList.remove('bento-grid-mode');
        floatingContainer?.classList.add('zero-g-mode');
        if (toggleBtn) {
          toggleBtn.innerHTML = t.physicsToggleOn;
          toggleBtn.classList.add('shadow-[0_0_25px_rgba(217,38,38,0.7)]', 'border-accent-sindoor');
          toggleBtn.classList.remove('border-white/20');
        }
      } else {
        floatingContainer?.classList.remove('zero-g-mode');
        floatingContainer?.classList.add('bento-grid-mode');
        if (toggleBtn) {
          toggleBtn.innerHTML = t.physicsToggleOff;
          toggleBtn.classList.remove('shadow-[0_0_25px_rgba(217,38,38,0.7)]', 'border-accent-sindoor');
          toggleBtn.classList.add('border-white/20');
        }
      }
    },

    // Cultural Particle Canvas (Jaba Petals, Dhunuchi Embers, Tant Silk Threads)
    initParticles() {
      const canvas = document.getElementById('cultural-particle-canvas');
      if (!canvas) return;
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.resizeCanvas();

      const particleCount = window.innerWidth < 768 ? 40 : 85;
      this.particles = [];

      for (let i = 0; i < particleCount; i++) {
        const types = ['jaba_petal', 'dhunuchi_ember', 'tant_silk'];
        const type = types[Math.floor(Math.random() * types.length)];
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          radius: type === 'dhunuchi_ember' ? 1.5 + Math.random() * 2 : 4 + Math.random() * 6,
          type: type,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -0.4 - Math.random() * 1.2,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.03,
          opacity: 0.3 + Math.random() * 0.6,
          hueOffset: Math.random() * 20
        });
      }

      const animate = () => {
        this.drawParticles();
        requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    },

    resizeCanvas() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    drawParticles() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        // Mouse magnetic repulsion
        if (this.mouse.active) {
          const dx = p.x - this.mouse.x;
          const dy = p.y - this.mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 0) {
            const force = (120 - dist) / 120 * 3.5;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        // Loop boundaries
        if (p.y < -20) p.y = this.canvas.height + 20;
        if (p.x < -20) p.x = this.canvas.width + 20;
        if (p.x > this.canvas.width + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        if (p.type === 'jaba_petal') {
          // Sacred Red Hibiscus Petal
          ctx.fillStyle = '#D92626';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.radius, p.radius * 1.8, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'dhunuchi_ember') {
          // Golden Zari / Dhunuchi Charcoal Spark
          ctx.fillStyle = '#D4AF37';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#E88D2A';
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'tant_silk') {
          // Shimmering Fine Tant Silk Thread
          ctx.strokeStyle = '#F6F2E6';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-p.radius * 2, -p.radius);
          ctx.bezierCurveTo(-p.radius, p.radius, p.radius, -p.radius, p.radius * 2, p.radius);
          ctx.stroke();
        }
        ctx.restore();
      }
    },

    // 3D Specular Tilt Cards with Silk Sheen Cursor Tracking
    initTiltCards() {
      document.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.tilt-3d-card');
        cards.forEach(card => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotX = ((y - centerY) / centerY) * -10;
            const rotY = ((x - centerX) / centerX) * 10;
            card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;

            const sheen = card.querySelector('.zari-sheen');
            if (sheen) {
              sheen.style.opacity = '0.4';
              sheen.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(212, 175, 55, 0.45) 0%, rgba(217, 38, 38, 0.1) 40%, transparent 70%)`;
            }
          } else {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            const sheen = card.querySelector('.zari-sheen');
            if (sheen) sheen.style.opacity = '0';
          }
        });
      });
    },

    // Floating Interactive Cards (Zero-G Levitation with Grab, Toss & Sinusoidal Float)
    initFloatingCards() {
      let time = 0;
      const animateFloat = () => {
        time += 0.03;
        if (this.isZeroG) {
          const floaters = document.querySelectorAll('.zero-g-floater');
          floaters.forEach((el, index) => {
            if (!el.dataset.dragging) {
              const freq = 1 + (index % 3) * 0.4;
              const amp = 8 + (index % 4) * 4;
              const offsetY = Math.sin(time * freq + index) * amp;
              const tilt = Math.cos(time * 0.8 + index) * 3;
              el.style.transform = `translate3d(0, ${offsetY}px, 0) rotate(${tilt}deg)`;
            }
          });
        }
        requestAnimationFrame(animateFloat);
      };
      requestAnimationFrame(animateFloat);

      // Drag and Toss functionality
      document.querySelectorAll('.zero-g-floater').forEach(el => {
        let isDown = false;
        let startX, startY;
        let origTransform = '';

        el.addEventListener('mousedown', (e) => {
          if (!this.isZeroG) return;
          if (e.target.closest('button') || e.target.closest('a')) return;
          isDown = true;
          el.dataset.dragging = "true";
          startX = e.clientX;
          startY = e.clientY;
          origTransform = el.style.transform;
          el.style.cursor = 'grabbing';
          el.style.zIndex = '50';
          el.style.transition = 'none';
        });

        window.addEventListener('mousemove', (e) => {
          if (!isDown || !this.isZeroG) return;
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          el.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${dx * 0.05}deg) scale(1.05)`;
        });

        window.addEventListener('mouseup', () => {
          if (isDown) {
            isDown = false;
            delete el.dataset.dragging;
            el.style.cursor = 'grab';
            el.style.zIndex = '';
            el.style.transition = 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
            setTimeout(() => {
              el.style.transition = '';
            }, 800);
          }
        });
      });
    }
  };
})();
