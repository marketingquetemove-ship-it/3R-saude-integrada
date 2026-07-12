/* ==========================================================================
   3R SAÚDE INTEGRADA - JAVASCRIPT PRINCIPAL
   ========================================================================== */

(function() {
    'use strict';

    // ===== PRELOADER =====
    window.addEventListener('load', function() {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.classList.add('hidden');
                setTimeout(() => preloader.remove(), 600);
            }, 800);
        }
    });

    // ===== INIT AOS =====
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 80,
            disable: window.innerWidth < 768 && 'phone'
        });
    }

    // ===== HEADER SCROLL =====
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (header) {
            if (currentScroll > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        lastScroll = currentScroll;
    }, { passive: true });

    // ===== MENU MOBILE =====
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Fechar ao clicar em um link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') &&
                !navMenu.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // ===== BACK TO TOP =====
    const backToTop = document.getElementById('backToTop');

    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }, { passive: true });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===== CONTADOR ANIMADO =====
    const counters = document.querySelectorAll('.counter');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2000;
                const start = performance.now();

                const update = (currentTime) => {
                    const elapsed = currentTime - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const current = Math.floor(easeOut * target);

                    counter.textContent = current.toLocaleString('pt-BR');

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        counter.textContent = target.toLocaleString('pt-BR');
                    }
                };

                requestAnimationFrame(update);
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.3 });

    counters.forEach(counter => counterObserver.observe(counter));

    // ===== FAQ ACCORDION =====
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                faqItems.forEach(i => i.classList.remove('active'));
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });

    // ===== CARROSSEL DE DEPOIMENTOS =====
    const carousel = document.getElementById('depoimentosCarousel');
    if (carousel) {
        const track = carousel.querySelector('.depoimentos-track');
        const cards = track ? track.querySelectorAll('.depoimento-card') : [];
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        let currentIndex = 0;
        let cardsPerView = 3;

        function updateCardsPerView() {
            if (window.innerWidth < 768) {
                cardsPerView = 1;
            } else if (window.innerWidth < 1024) {
                cardsPerView = 2;
            } else {
                cardsPerView = 3;
            }
        }

        function updateCarousel() {
            if (!track || cards.length === 0) return;
            const cardWidth = cards[0].offsetWidth + 32; // width + gap
            const offset = -currentIndex * cardWidth;
            track.style.transform = `translateX(${offset}px)`;
        }

        function getMaxIndex() {
            return Math.max(0, cards.length - cardsPerView);
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentIndex = currentIndex >= getMaxIndex() ? 0 : currentIndex + 1;
                updateCarousel();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentIndex = currentIndex <= 0 ? getMaxIndex() : currentIndex - 1;
                updateCarousel();
            });
        }

        // Auto-play
        let autoplay = setInterval(() => {
            if (nextBtn) nextBtn.click();
        }, 5000);

        carousel.addEventListener('mouseenter', () => clearInterval(autoplay));
        carousel.addEventListener('mouseleave', () => {
            autoplay = setInterval(() => {
                if (nextBtn) nextBtn.click();
            }, 5000);
        });

        window.addEventListener('resize', () => {
            updateCardsPerView();
            if (currentIndex > getMaxIndex()) {
                currentIndex = getMaxIndex();
            }
            updateCarousel();
        });

        updateCardsPerView();
        updateCarousel();
    }

    // ===== MÁSCARA TELEFONE =====
    const telefoneInputs = document.querySelectorAll('input[type="tel"]');
    telefoneInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');

            if (value.length > 11) {
                value = value.substring(0, 11);
            }

            if (value.length > 6) {
                value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7)}`;
            } else if (value.length > 2) {
                value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
            } else if (value.length > 0) {
                value = `(${value}`;
            }

            e.target.value = value;
        });
    });

    // ===== SCROLL SUAVE PARA LINKS INTERNOS =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href.length <= 1) return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const offset = 100;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // ===== VALIDAÇÃO FORMULÁRIO DE CONTATO =====
    const contatoForm = document.getElementById('contatoForm');
    if (contatoForm) {
        contatoForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Validações
            const nome = document.getElementById('contatoNome');
            const email = document.getElementById('contatoEmail');
            const telefone = document.getElementById('contatoTelefone');
            const assunto = document.getElementById('contatoAssunto');
            const mensagem = document.getElementById('contatoMensagem');
            const aceite = document.getElementById('contatoAceite');

            let isValid = true;

            // Limpar erros anteriores
            contatoForm.querySelectorAll('.error-message').forEach(el => el.textContent = '');
            contatoForm.querySelectorAll('input, select, textarea').forEach(el => el.classList.remove('error'));

            // Validar nome
            if (!nome.value.trim() || nome.value.trim().length < 3) {
                showError(nome, 'Nome deve ter pelo menos 3 caracteres');
                isValid = false;
            }

            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value.trim() || !emailRegex.test(email.value)) {
                showError(email, 'E-mail inválido');
                isValid = false;
            }

            // Validar telefone
            if (!telefone.value.replace(/\D/g, '') || telefone.value.replace(/\D/g, '').length < 10) {
                showError(telefone, 'Telefone inválido');
                isValid = false;
            }

            // Validar assunto
            if (!assunto.value) {
                showError(assunto, 'Selecione um assunto');
                isValid = false;
            }

            // Validar mensagem
            if (!mensagem.value.trim() || mensagem.value.trim().length < 10) {
                showError(mensagem, 'Mensagem deve ter pelo menos 10 caracteres');
                isValid = false;
            }

            // Validar aceite
            if (!aceite.checked) {
                showError(aceite, 'Você precisa aceitar a política de privacidade');
                isValid = false;
            }

            if (isValid) {
                // Enviar via WhatsApp
                const texto = `*Contato via Site 3R Saúde Integrada*%0A%0A` +
                    `*Nome:* ${nome.value}%0A` +
                    `*E-mail:* ${email.value}%0A` +
                    `*Telefone:* ${telefone.value}%0A` +
                    `*Assunto:* ${assunto.value}%0A` +
                    `*Mensagem:* ${mensagem.value}`;

                window.open(`https://wa.me/557192735493?text=${texto}`, '_blank');

                // Mostrar mensagem de sucesso
                showSuccessMessage(contatoForm, 'Mensagem enviada com sucesso! Em breve entraremos em contato.');

                // Limpar formulário
                contatoForm.reset();
            }
        });
    }

    function showError(field, message) {
        field.classList.add('error');
        const errorSpan = field.parentElement.querySelector('.error-message') ||
                          field.closest('.form-group')?.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.textContent = message;
        }
    }

    function showSuccessMessage(form, message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        successDiv.style.cssText = `
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            margin-top: 1rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 500;
            animation: fadeInUp 0.4s ease;
        `;
        form.appendChild(successDiv);
        setTimeout(() => {
            successDiv.style.opacity = '0';
            setTimeout(() => successDiv.remove(), 300);
        }, 5000);
    }

    // ===== LAZY LOADING FALLBACK =====
    if ('loading' in HTMLImageElement.prototype) {
        // Browser supports native lazy loading
    } else {
        // Fallback
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    imageObserver.unobserve(img);
                }
            });
        });
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // ===== ANIMAÇÃO DE ENTRADA PARA ELEMENTOS =====
    const animateOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    };

    const scrollObserver = new IntersectionObserver(animateOnScroll, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.especialidade-card, .depoimento-card, .valor-card, .stat-item').forEach(el => {
        scrollObserver.observe(el);
    });

    console.log('%c🦷 3R Saúde Integrada', 'color:#D4AF37;font-size:24px;font-weight:bold;');
    console.log('%cSite desenvolvido com tecnologia premium', 'color:#0B2D5C;font-size:14px;');

})();
