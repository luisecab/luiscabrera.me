/**
 * Luis Cabrera Portfolio — Main JavaScript
 *
 * Starfield (canvas) → intro greetings → warp → hero + scroll reveals.
 * Motion rules: transform/opacity/filter only, strong ease-out curves,
 * exits faster than entrances, springs for decorative pointer tracking,
 * and a real reduced-motion path (static sky, fades only).
 */

(function () {
    'use strict';

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
    const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    // ==========================================================================
    // Starfield
    // ==========================================================================

    function createStarfield(canvas) {
        const ctx = canvas && canvas.getContext('2d');
        if (!ctx) return null;

        // Mostly white, a few blue-hot and warm stars, like a real sky
        const TINTS = ['255,255,255', '255,255,255', '255,255,255', '255,255,255', '214,224,255', '178,198,255', '255,228,198'];

        let w = 0;
        let h = 0;
        let stars = [];
        let running = false;
        let rafId = 0;
        let last = 0;
        let time = 0;

        // Pointer parallax, interpolated with a spring so it has momentum
        const pointer = { tx: 0, ty: 0, x: 0, y: 0, vx: 0, vy: 0 };
        const SPRING_K = 38;   // stiffness
        const SPRING_C = 11;   // damping (slightly under critical for a soft settle)

        let warpStart = -1;
        let warpDuration = 0;

        let shooting = null;
        let nextShootingAt = performance.now() + 6000;

        const glowSprite = (function () {
            const c = document.createElement('canvas');
            c.width = c.height = 64;
            const g = c.getContext('2d');
            const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
            grd.addColorStop(0, 'rgba(255,255,255,0.9)');
            grd.addColorStop(0.14, 'rgba(222,230,255,0.45)');
            grd.addColorStop(0.45, 'rgba(157,180,255,0.1)');
            grd.addColorStop(1, 'rgba(157,180,255,0)');
            g.fillStyle = grd;
            g.fillRect(0, 0, 64, 64);
            return c;
        })();

        function motionAllowed() {
            return !reducedMotionQuery.matches;
        }

        function populate() {
            const count = Math.round(Math.min(720, Math.max(160, (w * h) / 2300)));
            stars = [];
            for (let i = 0; i < count; i++) {
                // Skew depth toward the distance: many faint stars, few bright ones
                const d = 0.15 + 0.85 * Math.pow(Math.random(), 2.4);
                const tint = TINTS[(Math.random() * TINTS.length) | 0];
                stars.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    d: d,
                    r: 0.3 + d * 1.25,
                    a: 0.22 + d * 0.68,
                    color: 'rgb(' + tint + ')',
                    twAmp: 0.08 + Math.random() * 0.34,
                    twSpeed: 0.4 + Math.random() * 1.4,
                    twPhase: Math.random() * Math.PI * 2,
                    glow: d > 0.8 && Math.random() < 0.55,
                });
            }
            // Group by colour so fillStyle changes rarely while drawing
            stars.sort((a, b) => (a.color < b.color ? -1 : a.color > b.color ? 1 : 0));
        }

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const widthChanged = window.innerWidth !== w;
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            // Mobile toolbars change the height on scroll: keep the same sky then
            if (widthChanged || !stars.length) populate();
            if (!running) draw(performance.now());
        }

        function warpAmount(now) {
            if (warpStart < 0) return 0;
            const t = (now - warpStart) / warpDuration;
            if (t >= 1) {
                warpStart = -1;
                return 0;
            }
            return t < 0.38 ? easeInOutCubic(t / 0.38) : 1 - easeOutQuart((t - 0.38) / 0.62);
        }

        function spawnShootingStar(now) {
            const fromLeft = Math.random() < 0.5;
            const angle = (16 + Math.random() * 22) * Math.PI / 180;
            const speed = 0.85 + Math.random() * 0.55; // px per ms
            shooting = {
                x: fromLeft ? Math.random() * w * 0.55 : w * 0.45 + Math.random() * w * 0.55,
                y: Math.random() * h * 0.45,
                ux: Math.cos(angle) * (fromLeft ? 1 : -1),
                uy: Math.sin(angle),
                speed: speed,
                born: now,
                life: 650 + Math.random() * 450,
                len: 90 + Math.random() * 110,
            };
        }

        function drawShootingStar(now) {
            if (!shooting) {
                if (motionAllowed() && warpStart < 0 && now >= nextShootingAt) spawnShootingStar(now);
                return;
            }
            const s = shooting;
            const elapsed = now - s.born;
            const t = elapsed / s.life;
            if (t >= 1) {
                shooting = null;
                nextShootingAt = now + 7000 + Math.random() * 10000;
                return;
            }
            const travel = easeOutQuart(t) * s.speed * s.life;
            const hx = s.x + s.ux * travel;
            const hy = s.y + s.uy * travel;
            const alpha = Math.sin(Math.PI * t);
            const tail = s.len * (0.4 + 0.6 * alpha);
            const tx = hx - s.ux * tail;
            const ty = hy - s.uy * tail;
            const grd = ctx.createLinearGradient(hx, hy, tx, ty);
            grd.addColorStop(0, 'rgba(255,255,255,' + (0.9 * alpha) + ')');
            grd.addColorStop(1, 'rgba(157,180,255,0)');
            ctx.strokeStyle = grd;
            ctx.lineWidth = 1.3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(hx, hy);
            ctx.lineTo(tx, ty);
            ctx.stroke();
            ctx.globalAlpha = alpha;
            ctx.drawImage(glowSprite, hx - 9, hy - 9, 18, 18);
            ctx.globalAlpha = 1;
        }

        function draw(now) {
            ctx.clearRect(0, 0, w, h);
            const moving = motionAllowed();
            const scrollY = moving ? (window.scrollY || 0) : 0;
            const px = moving ? pointer.x : 0;
            const py = moving ? pointer.y : 0;
            const warp = moving ? warpAmount(now) : 0;
            const cx = w / 2;
            const cy = h / 2;
            let currentColor = '';

            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                let x = s.x - px * s.d * 26;
                let y = s.y - scrollY * s.d * 0.16 - py * s.d * 26;
                // Wrap so the sky never runs out while scrolling
                y = ((y % h) + h) % h;
                x = ((x % w) + w) % w;

                let alpha = s.a;
                if (moving) alpha *= 1 - s.twAmp * (0.5 + 0.5 * Math.sin(time * s.twSpeed + s.twPhase));

                if (s.color !== currentColor) {
                    currentColor = s.color;
                    ctx.fillStyle = currentColor;
                    ctx.strokeStyle = currentColor;
                }

                if (warp > 0.002) {
                    // Hyperspace: stretch each star away from the centre, nearer stars more
                    const stretch = warp * s.d * 0.42;
                    ctx.globalAlpha = Math.min(1, alpha + warp * 0.35);
                    ctx.lineWidth = Math.max(0.6, s.r * 1.1);
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + (x - cx) * stretch, y + (y - cy) * stretch);
                    ctx.stroke();
                    continue;
                }

                ctx.globalAlpha = alpha;
                if (s.r < 0.9) {
                    ctx.fillRect(x - s.r, y - s.r, s.r * 2, s.r * 2);
                } else {
                    ctx.beginPath();
                    ctx.arc(x, y, s.r, 0, Math.PI * 2);
                    ctx.fill();
                }
                if (s.glow) {
                    const size = s.r * 10;
                    ctx.globalAlpha = alpha * 0.55;
                    ctx.drawImage(glowSprite, x - size / 2, y - size / 2, size, size);
                }
            }
            ctx.globalAlpha = 1;
            if (moving) drawShootingStar(now);
        }

        function frame(now) {
            rafId = requestAnimationFrame(frame);
            const dt = Math.min((now - (last || now)) / 1000, 1 / 20);
            last = now;
            time += dt;

            pointer.vx += ((pointer.tx - pointer.x) * SPRING_K - pointer.vx * SPRING_C) * dt;
            pointer.vy += ((pointer.ty - pointer.y) * SPRING_K - pointer.vy * SPRING_C) * dt;
            pointer.x += pointer.vx * dt;
            pointer.y += pointer.vy * dt;

            draw(now);
        }

        function start() {
            if (running || !motionAllowed() || document.hidden) return;
            running = true;
            last = 0;
            rafId = requestAnimationFrame(frame);
        }

        function stop() {
            running = false;
            cancelAnimationFrame(rafId);
            draw(performance.now());
        }

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 120);
        });

        // Pause when the tab is hidden; nobody is watching
        document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

        const onMotionPrefChange = () => (motionAllowed() ? start() : stop());
        if (reducedMotionQuery.addEventListener) reducedMotionQuery.addEventListener('change', onMotionPrefChange);

        if (finePointer) {
            window.addEventListener('pointermove', (e) => {
                pointer.tx = (e.clientX / w - 0.5) * 2;
                pointer.ty = (e.clientY / h - 0.5) * 2;
            }, { passive: true });
            document.documentElement.addEventListener('pointerleave', () => {
                pointer.tx = 0;
                pointer.ty = 0;
            });
        }

        resize();
        start();

        return {
            warp(duration) {
                if (!motionAllowed()) return;
                warpStart = performance.now();
                warpDuration = duration;
                nextShootingAt = Math.max(nextShootingAt, warpStart + duration + 4000);
            },
        };
    }

    // ==========================================================================
    // Intro: greetings, then a warp jump into the page (once per session)
    // ==========================================================================

    const greetings = ['Hola', 'Hello', 'Cześć', 'Salut', 'Ciao'];
    const GREETING_MS = 1200;  // time each greeting stays on screen
    const SWAP_MS = 260;       // exit of one greeting before the next enters

    function runIntro(starfield, onReveal) {
        const root = document.documentElement;
        const intro = document.getElementById('intro');
        const greetingEl = document.getElementById('greeting');
        const hero = document.querySelector('.hero');

        function reveal() {
            if (hero) hero.classList.add('revealed');
            onReveal();
        }

        // The inline script in <head> decides: no intro under reduced motion or on repeat visits
        if (!root.classList.contains('intro-active') || !intro || !greetingEl) {
            root.classList.remove('intro-active');
            reveal();
            return;
        }

        let finished = false;
        const timers = [];
        const later = (fn, ms) => timers.push(setTimeout(fn, ms));
        const skipEvents = ['pointerdown', 'touchstart', 'wheel', 'scroll', 'keydown'];

        function finish(skipped) {
            if (finished) return;
            finished = true;
            timers.forEach(clearTimeout);
            skipEvents.forEach(ev => window.removeEventListener(ev, onSkip));
            try { sessionStorage.setItem('introSeen', 'true'); } catch (e) { /* storage blocked */ }

            greetingEl.classList.remove('is-in');
            greetingEl.classList.add('is-out');
            // A user who skips wants to get in: shorter jump, content sooner
            if (starfield) starfield.warp(skipped ? 750 : 1300);
            intro.classList.add('hide');
            setTimeout(reveal, skipped ? 160 : 520);
            setTimeout(() => {
                root.classList.remove('intro-active');
                intro.classList.add('done');
            }, 450);
        }

        function onSkip() {
            finish(true);
        }

        function show(text) {
            greetingEl.style.transition = 'none';
            greetingEl.classList.remove('is-in', 'is-out');
            greetingEl.textContent = text;
            void greetingEl.offsetWidth; // commit the start state so the entrance transitions
            greetingEl.style.transition = '';
            greetingEl.classList.add('is-in');
        }

        let index = 0;
        function next() {
            index++;
            if (index >= greetings.length) {
                finish(false);
                return;
            }
            greetingEl.classList.remove('is-in');
            greetingEl.classList.add('is-out');
            later(() => {
                show(greetings[index]);
                later(next, GREETING_MS);
            }, SWAP_MS);
        }

        skipEvents.forEach(ev => window.addEventListener(ev, onSkip, { passive: true }));
        show(greetings[0]);
        later(next, GREETING_MS);
    }

    // ==========================================================================
    // Scroll reveals: blur-up as things enter, staggered when they arrive together
    // ==========================================================================

    function initReveal() {
        const targets = document.querySelectorAll('.section > .section-title, main .glass-card, .experience-card, .footer-content');
        if (!('IntersectionObserver' in window)) {
            targets.forEach(el => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            let batchIndex = 0;
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                observer.unobserve(el);
                if (batchIndex > 0 && !reducedMotionQuery.matches) {
                    el.style.transitionDelay = Math.min(batchIndex, 6) * 70 + 'ms';
                    el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
                }
                batchIndex++;
                el.classList.add('is-visible');
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

        targets.forEach(el => observer.observe(el));
    }

    // ==========================================================================
    // Card spotlight: a soft light that follows the cursor (fine pointers only)
    // ==========================================================================

    function initSpotlight() {
        if (!finePointer) return;
        document.querySelectorAll('.spotlight').forEach((card) => {
            card.addEventListener('pointermove', (e) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mx', (e.clientX - rect.left) + 'px');
                card.style.setProperty('--my', (e.clientY - rect.top) + 'px');
            }, { passive: true });
        });
    }

    // ==========================================================================
    // Supabase Configuration
    // ==========================================================================

    const SUPABASE_URL = 'https://pgbgvysqsklqigvejbvg.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnYmd2eXNxc2tscWlndmVqYnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxOTQ2NDMsImV4cCI6MjA3NTc3MDY0M30.NBxtgtUCOPslI3V9ikqkDoqZNACTP7--qkOsTef3d4g';

    let supabase = null;

    function initSupabase() {
        if (window.supabase) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    }

    // ==========================================================================
    // Console Easter Egg
    // ==========================================================================

    function printConsoleEasterEgg() {
        console.log(
            `
%c
██╗     ██╗   ██╗██╗███████╗
██║     ██║   ██║██║██╔════╝
██║     ██║   ██║██║███████╗
██║     ██║   ██║██║╚════██║
███████╗╚██████╔╝██║███████║
╚══════╝ ╚═════╝ ╚═╝╚══════╝

 ██████╗ █████╗ ██████╗ ██████╗ ███████╗██████╗  █████╗
██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗
██║     ███████║██████╔╝██████╔╝█████╗  ██████╔╝███████║
██║     ██╔══██║██╔══██╗██╔══██╗██╔══╝  ██╔══██╗██╔══██║
╚██████╗██║  ██║██████╔╝██║  ██║███████╗██║  ██║██║  ██║
 ╚═════╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
`,
            'color: #9db4ff; font-family: monospace; text-shadow: 0 0 6px rgba(157,180,255,0.6);'
        );

        console.log(
            '%c✦ Hey, fellow traveler. Curious about the code? Check out the repo → github.com/luisecab',
            'color: #a4a9be; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;'
        );
    }

    // ==========================================================================
    // CV Request Form
    // ==========================================================================

    function initCVForm() {
        const form = document.getElementById('cv-form');
        const emailInput = document.getElementById('email-input');
        const submitBtn = document.getElementById('submit-btn');
        const errorEl = document.getElementById('email-error');
        const successEl = document.getElementById('form-success');

        if (!form || !emailInput || !submitBtn) return;

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Rate limiting - prevent multiple submissions within 60 seconds
        let lastSubmitTime = 0;
        const RATE_LIMIT_MS = 60000;

        function validateEmail(email) {
            const trimmed = email.trim();
            if (!trimmed) {
                return { valid: false, message: 'Email is required' };
            }
            if (trimmed.length > 255) {
                return { valid: false, message: 'Email is too long' };
            }
            if (!emailRegex.test(trimmed)) {
                return { valid: false, message: 'Please enter a valid email address' };
            }
            return { valid: true, message: '' };
        }

        function showError(message) {
            errorEl.textContent = message;
            successEl.textContent = '';
            emailInput.classList.add('error');
        }

        function showSuccess(message) {
            successEl.textContent = message;
            errorEl.textContent = '';
            emailInput.classList.remove('error');
        }

        function clearMessages() {
            errorEl.textContent = '';
            successEl.textContent = '';
            emailInput.classList.remove('error');
        }

        function setLoading(loading) {
            submitBtn.disabled = loading;
            submitBtn.classList.toggle('loading', loading);
        }

        // Clear error on input
        emailInput.addEventListener('input', () => {
            if (emailInput.classList.contains('error')) {
                clearMessages();
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearMessages();

            const email = emailInput.value;
            const validation = validateEmail(email);

            if (!validation.valid) {
                showError(validation.message);
                return;
            }

            // Rate limiting check
            const now = Date.now();
            if (now - lastSubmitTime < RATE_LIMIT_MS) {
                const secondsLeft = Math.ceil((RATE_LIMIT_MS - (now - lastSubmitTime)) / 1000);
                showError(`Please wait ${secondsLeft} seconds before submitting again.`);
                return;
            }

            if (!supabase) {
                showError('Service temporarily unavailable. Please try again later.');
                return;
            }

            setLoading(true);

            try {
                const { error } = await supabase.functions.invoke('send-cv', {
                    body: { email: email.trim() }
                });

                if (error) {
                    throw error;
                }

                lastSubmitTime = Date.now();
                showSuccess('CV sent! Check your inbox.');
                emailInput.value = '';

            } catch (err) {
                console.error('CV request error:', err);

                if (err.message?.includes('Too many')) {
                    showError('Too many requests. Please try again later.');
                } else {
                    showError('Something went wrong. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        });
    }

    // ==========================================================================
    // Initialize
    // ==========================================================================

    function init() {
        const starfield = createStarfield(document.getElementById('starfield'));
        runIntro(starfield, initReveal);
        initSpotlight();
        printConsoleEasterEgg();
        initSupabase();
        initCVForm();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
