/**
 * Luis Cabrera Portfolio — Main JavaScript
 */

(function () {
    'use strict';

    // ==========================================================================
    // Intro Animation
    // ==========================================================================

    const greetings = ['Hola', 'Hello', 'Cześć', 'Salut', 'Ciao'];
    let greetingIndex = 0;

    function runIntroAnimation() {
        const intro = document.getElementById('intro');
        const greetingEl = document.getElementById('greeting');
        const hero = document.querySelector('.hero');

        if (!intro || !greetingEl) return;

        // Check if user has seen intro recently (session storage)
        if (sessionStorage.getItem('introSeen')) {
            intro.classList.add('done');
            if (hero) hero.classList.add('revealed');
            setTimeout(revealContent, 400);
            return;
        }

        function showNextGreeting() {
            greetingIndex++;

            if (greetingIndex >= greetings.length) {
                // Fade out last greeting first
                setTimeout(() => {
                    greetingEl.classList.add('out');

                    // Start revealing hero while greeting fades
                    setTimeout(() => {
                        if (hero) hero.classList.add('revealed');
                        // Start content reveal after hero starts appearing
                        setTimeout(revealContent, 600);
                    }, 200);

                    // Then fade out the intro overlay
                    setTimeout(() => {
                        intro.classList.add('hide');
                        sessionStorage.setItem('introSeen', 'true');
                        setTimeout(() => {
                            intro.classList.add('done');
                        }, 1400);
                    }, 400);
                }, 700);
                return;
            }

            // Animate out current greeting
            greetingEl.classList.add('out');

            setTimeout(() => {
                // Switch text and animate in
                greetingEl.textContent = greetings[greetingIndex];
                greetingEl.classList.remove('out');
                greetingEl.style.animation = 'none';
                greetingEl.offsetHeight; // Trigger reflow
                greetingEl.style.animation = '';

                // Schedule next greeting
                setTimeout(showNextGreeting, 600);
            }, 400);
        }

        // Start cycling after first greeting displays
        setTimeout(showNextGreeting, 700);
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
            'color: #2d2d2d; font-family: monospace;'
        );

        console.log(
            '%c👋 Hey! Curious about the code? Check out the repo → github.com/luisecab',
            'color: #666; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;'
        );
    }

    // ==========================================================================
    // GSAP Animations
    // ==========================================================================

    function initGSAPAnimations() {
        if (typeof gsap === 'undefined') {
            console.log('GSAP not loaded');
            return;
        }

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            return;
        }

        // Set initial state - everything hidden and above (negative y = above)
        gsap.set('main .section', { opacity: 0, y: -300, scale: 0.9 });
        gsap.set('main .glass-card', { opacity: 0, y: -150, rotation: 3 });
        gsap.set('.achievement-item', { opacity: 0, x: -30 });
        gsap.set('footer', { opacity: 0, y: -30 });
    }

    function revealContent() {
        if (typeof gsap === 'undefined') return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            gsap.set('main .section, main .glass-card, .achievement-item, footer', { opacity: 1, y: 0, x: 0, scale: 1, rotation: 0 });
            return;
        }

        // Sections drop down dramatically
        gsap.to('main .section', {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            stagger: 0.15,
            ease: 'power4.out',
        });

        // Cards drop in with rotation and bounce
        gsap.to('main .glass-card', {
            opacity: 1,
            y: 0,
            rotation: 0,
            duration: 1,
            stagger: 0.08,
            ease: 'back.out(1.7)',
            delay: 0.3,
        });

        // Achievement items slide in
        gsap.to('.achievement-item', {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.05,
            ease: 'power2.out',
            delay: 0.8,
        });

        // Footer drops in
        gsap.to('footer', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            delay: 1.2,
        });
    }

    // ==========================================================================
    // Smooth Scroll for Anchor Links
    // ==========================================================================

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
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
        initGSAPAnimations();
        runIntroAnimation();
        printConsoleEasterEgg();
        initSupabase();
        initSmoothScroll();
        initCVForm();
    }

    // Run on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
