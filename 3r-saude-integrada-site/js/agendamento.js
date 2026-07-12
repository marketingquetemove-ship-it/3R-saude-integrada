/* ==========================================================================
   3R SAÚDE INTEGRADA - SISTEMA DE AGENDAMENTO
   ========================================================================== */

(function() {
    'use strict';

    // ===== ESTADO DO FORMULÁRIO =====
    const formState = {
        currentStep: 1,
        selectedDate: null,
        selectedTime: null,
        selectedMonth: new Date().getMonth(),
        selectedYear: new Date().getFullYear()
    };

    // ===== CONFIGURAÇÕES DE HORÁRIO =====
    const SCHEDULE = {
        // Segunda à Sexta (1-5): 08:30 às 18:30
        weekday: {
            start: '08:30',
            end: '18:30',
            interval: 40, // minutos
        },
        // Sábado (6): 08:30 às 14:00
        saturday: {
            start: '08:30',
            end: '14:00',
            interval: 40,
        },
        // Domingo: Fechado
    };

    const MONTHS = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    // ===== ELEMENTOS DOM =====
    const form = document.getElementById('agendamentoForm');
    if (!form) return;

    const steps = form.querySelectorAll('.form-step');
    const nextBtns = form.querySelectorAll('.next-step');
    const prevBtns = form.querySelectorAll('.prev-step');
    const calendarDays = document.getElementById('calendarDays');
    const calendarTitle = document.getElementById('calendarTitle');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const horariosGrid = document.getElementById('horariosGrid');
    const resumoContainer = document.getElementById('resumoAgendamento');

    // ===== INICIALIZAÇÃO =====
    function init() {
        showStep(1);
        renderCalendar();
        setupEventListeners();
    }

    // ===== EVENT LISTENERS =====
    function setupEventListeners() {
        nextBtns.forEach(btn => btn.addEventListener('click', handleNext));
        prevBtns.forEach(btn => btn.addEventListener('click', handlePrev));
        if (prevMonthBtn) prevMonthBtn.addEventListener('click', () => changeMonth(-1));
        if (nextMonthBtn) nextMonthBtn.addEventListener('click', () => changeMonth(1));
        form.addEventListener('submit', handleSubmit);
    }

    // ===== NAVEGAÇÃO ENTRE ETAPAS =====
    function showStep(step) {
        steps.forEach(s => s.classList.remove('active'));
        const targetStep = form.querySelector(`.form-step[data-step="${step}"]`);
        if (targetStep) {
            targetStep.classList.add('active');
            targetStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        formState.currentStep = step;

        if (step === 3) {
            renderResumo();
        }
    }

    function handleNext() {
        if (!validateCurrentStep()) return;

        if (formState.currentStep < 3) {
            showStep(formState.currentStep + 1);
        }
    }

    function handlePrev() {
        if (formState.currentStep > 1) {
            showStep(formState.currentStep - 1);
        }
    }

    // ===== VALIDAÇÕES =====
    function validateCurrentStep() {
        if (formState.currentStep === 1) {
            return validateStep1();
        } else if (formState.currentStep === 2) {
            return validateStep2();
        }
        return true;
    }

    function validateStep1() {
        let isValid = true;
        clearErrors();

        const nome = document.getElementById('nome');
        const telefone = document.getElementById('telefone');
        const email = document.getElementById('email');
        const procedimento = document.getElementById('procedimento');

        if (!nome.value.trim() || nome.value.trim().length < 3) {
            showFieldError(nome, 'Nome deve ter pelo menos 3 caracteres');
            isValid = false;
        }

        const phoneClean = telefone.value.replace(/\D/g, '');
        if (!phoneClean || phoneClean.length < 10) {
            showFieldError(telefone, 'Telefone inválido');
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim() || !emailRegex.test(email.value)) {
            showFieldError(email, 'E-mail inválido');
            isValid = false;
        }

        if (!procedimento.value) {
            showFieldError(procedimento, 'Selecione um procedimento');
            isValid = false;
        }

        return isValid;
    }

    function validateStep2() {
        let isValid = true;
        clearErrors();

        if (!formState.selectedDate) {
            showFormError('dataError', 'Selecione uma data');
            isValid = false;
        }

        if (!formState.selectedTime) {
            showFormError('horarioError', 'Selecione um horário');
            isValid = false;
        }

        return isValid;
    }

    function showFieldError(field, message) {
        field.classList.add('error');
        const errorEl = document.getElementById(field.id + 'Error');
        if (errorEl) errorEl.textContent = message;
    }

    function showFormError(id, message) {
        const errorEl = document.getElementById(id);
        if (errorEl) errorEl.textContent = message;
    }

    function clearErrors() {
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        form.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    }

    // ===== CALENDÁRIO =====
    function renderCalendar() {
        if (!calendarDays || !calendarTitle) return;

        const year = formState.selectedYear;
        const month = formState.selectedMonth;

        calendarTitle.textContent = `${MONTHS[month]} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let html = '';

        // Dias do mês anterior
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            html += `<button type="button" class="calendar-day other-month disabled" disabled>${day}</button>`;
        }

        // Dias do mês atual
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay();
            const isPast = date < today;
            const isSunday = dayOfWeek === 0;
            const isToday = date.getTime() === today.getTime();
            const isSelected = formState.selectedDate &&
                formState.selectedDate.getTime() === date.getTime();

            let classes = 'calendar-day';
            if (isPast || isSunday) classes += ' disabled';
            if (isToday) classes += ' today';
            if (isSelected) classes += ' selected';

            const disabled = (isPast || isSunday) ? 'disabled' : '';
            html += `<button type="button" class="${classes}" ${disabled} data-date="${date.toISOString()}">${day}</button>`;
        }

        calendarDays.innerHTML = html;

        // Adicionar event listeners
        calendarDays.querySelectorAll('.calendar-day:not(.disabled):not(.other-month)').forEach(btn => {
            btn.addEventListener('click', () => selectDate(new Date(btn.dataset.date)));
        });
    }

    function changeMonth(delta) {
        formState.selectedMonth += delta;

        if (formState.selectedMonth > 11) {
            formState.selectedMonth = 0;
            formState.selectedYear++;
        } else if (formState.selectedMonth < 0) {
            formState.selectedMonth = 11;
            formState.selectedYear--;
        }

        // Limitar navegação a 6 meses no futuro
        const today = new Date();
        const maxDate = new Date(today.getFullYear(), today.getMonth() + 6, 1);
        const current = new Date(formState.selectedYear, formState.selectedMonth, 1);

        if (current > maxDate) {
            formState.selectedMonth = maxDate.getMonth();
            formState.selectedYear = maxDate.getFullYear();
        }

        // Não permitir voltar para antes do mês atual
        if (formState.selectedYear < today.getFullYear() ||
            (formState.selectedYear === today.getFullYear() && formState.selectedMonth < today.getMonth())) {
            formState.selectedMonth = today.getMonth();
            formState.selectedYear = today.getFullYear();
        }

        renderCalendar();
    }

    function selectDate(date) {
        formState.selectedDate = date;
        formState.selectedTime = null;
        renderCalendar();
        renderHorarios();
        showFormError('dataError', '');
    }

    // ===== HORÁRIOS =====
    function renderHorarios() {
        if (!horariosGrid) return;

        if (!formState.selectedDate) {
            horariosGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--gray-500); padding: 1rem;">Selecione uma data para ver os horários disponíveis</p>';
            return;
        }

        const dayOfWeek = formState.selectedDate.getDay();
        let config;

        if (dayOfWeek === 0) {
            // Domingo - Fechado
            horariosGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--error); padding: 1rem;"><i class="fas fa-times-circle"></i> Não funcionamos aos domingos</p>';
            return;
        } else if (dayOfWeek === 6) {
            // Sábado
            config = SCHEDULE.saturday;
        } else {
            // Segunda a Sexta
            config = SCHEDULE.weekday;
        }

        const slots = generateTimeSlots(config.start, config.end, config.interval);
        const now = new Date();
        const isToday = formState.selectedDate.toDateString() === now.toDateString();

        let html = '';
        slots.forEach(time => {
            const [hours, minutes] = time.split(':').map(Number);
            const slotDate = new Date(formState.selectedDate);
            slotDate.setHours(hours, minutes, 0, 0);

            const isPast = isToday && slotDate <= now;
            const isSelected = formState.selectedTime === time;

            let classes = 'horario-btn';
            if (isPast) classes += ' disabled';
            if (isSelected) classes += ' selected';

            const disabled = isPast ? 'disabled' : '';
            html += `<button type="button" class="${classes}" ${disabled} data-time="${time}">${time}</button>`;
        });

        horariosGrid.innerHTML = html;

        horariosGrid.querySelectorAll('.horario-btn:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', () => selectTime(btn.dataset.time));
        });
    }

    function generateTimeSlots(start, end, intervalMinutes) {
        const slots = [];
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);

        let currentMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        // O último slot deve terminar exatamente no horário de fechamento
        while (currentMinutes + intervalMinutes <= endMinutes) {
            const hours = Math.floor(currentMinutes / 60);
            const minutes = currentMinutes % 60;
            slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
            currentMinutes += intervalMinutes;
        }

        return slots;
    }

    function selectTime(time) {
        formState.selectedTime = time;
        renderHorarios();
        showFormError('horarioError', '');
    }

    // ===== RESUMO =====
    function renderResumo() {
        if (!resumoContainer) return;

        const nome = document.getElementById('nome').value;
        const telefone = document.getElementById('telefone').value;
        const email = document.getElementById('email').value;
        const procedimento = document.getElementById('procedimento').value;
        const mensagem = document.getElementById('mensagem').value;

        const dataFormatada = formState.selectedDate.toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        const diaSemana = formState.selectedDate.getDay();
        let diaTipo = '';
        if (diaSemana === 0) diaTipo = '(Domingo - Fechado)';
        else if (diaSemana === 6) diaTipo = '(Sábado)';
        else diaTipo = '(Dia útil)';

        let html = `
            <h3 style="font-family: 'Playfair Display', serif; color: var(--primary-dark); margin-bottom: 1.5rem; text-align: center;">
                <i class="fas fa-clipboard-check" style="color: var(--gold); margin-right: 0.5rem;"></i>
                Resumo do Agendamento
            </h3>
            <div class="resumo-item">
                <span class="resumo-label"><i class="fas fa-user"></i> Nome</span>
                <span class="resumo-valor">${escapeHtml(nome)}</span>
            </div>
            <div class="resumo-item">
                <span class="resumo-label"><i class="fas fa-phone"></i> Telefone</span>
                <span class="resumo-valor">${escapeHtml(telefone)}</span>
            </div>
            <div class="resumo-item">
                <span class="resumo-label"><i class="fas fa-envelope"></i> E-mail</span>
                <span class="resumo-valor">${escapeHtml(email)}</span>
            </div>
            <div class="resumo-item">
                <span class="resumo-label"><i class="fas fa-tooth"></i> Procedimento</span>
                <span class="resumo-valor">${escapeHtml(procedimento)}</span>
            </div>
            <div class="resumo-item">
                <span class="resumo-label"><i class="fas fa-calendar"></i> Data</span>
                <span class="resumo-valor">${dataFormatada}<br><small>${diaTipo}</small></span>
            </div>
            <div class="resumo-item">
                <span class="resumo-label"><i class="fas fa-clock"></i> Horário</span>
                <span class="resumo-valor">${formState.selectedTime} <small>(40 min)</small></span>
            </div>
        `;

        if (mensagem && mensagem.trim()) {
            html += `
            <div class="resumo-item">
                <span class="resumo-label"><i class="fas fa-comment"></i> Mensagem</span>
                <span class="resumo-valor">${escapeHtml(mensagem)}</span>
            </div>
            `;
        }

        html += `
            <div style="background: rgba(37, 211, 102, 0.1); border: 1px solid rgba(37, 211, 102, 0.3); border-radius: 12px; padding: 1rem; margin-top: 1.5rem; text-align: center; color: var(--primary-dark);">
                <i class="fab fa-whatsapp" style="color: #25D366; font-size: 1.25rem; margin-right: 0.5rem;"></i>
                <strong>Ao confirmar, você será redirecionado ao WhatsApp da clínica</strong>
            </div>
        `;

        resumoContainer.innerHTML = html;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== SUBMIT FINAL =====
    function handleSubmit(e) {
        e.preventDefault();

        const aceite = document.getElementById('aceite');
        if (!aceite.checked) {
            alert('Você precisa aceitar a política de privacidade para confirmar o agendamento.');
            return;
        }

        const nome = document.getElementById('nome').value;
        const telefone = document.getElementById('telefone').value;
        const email = document.getElementById('email').value;
        const procedimento = document.getElementById('procedimento').value;
        const mensagem = document.getElementById('mensagem').value;

        const dataFormatada = formState.selectedDate.toLocaleDateString('pt-BR');
        const horario = formState.selectedTime;

        // Montar mensagem para WhatsApp
        let textoWhatsApp = `Olá! Gostaria de confirmar meu agendamento.%0A%0A` +
            `*Nome:* ${nome}%0A` +
            `*Telefone:* ${telefone}%0A` +
            `*E-mail:* ${email}%0A` +
            `*Procedimento:* ${procedimento}%0A` +
            `*Data:* ${dataFormatada}%0A` +
            `*Horário:* ${horario}`;

        if (mensagem && mensagem.trim()) {
            textoWhatsApp += `%0A%0A*Mensagem adicional:* ${mensagem}`;
        }

        textoWhatsApp += `%0A%0A_Aguardo confirmação. Obrigado!_`;

        // Abrir WhatsApp
        const whatsappURL = `https://wa.me/557192735493?text=${textoWhatsApp}`;
        window.open(whatsappURL, '_blank');

        // Mostrar mensagem de sucesso
        showSuccessAndReset();
    }

    function showSuccessAndReset() {
        const successHTML = `
            <div class="form-step active" style="text-align: center; padding: 3rem 0;">
                <div style="width: 100px; height: 100px; margin: 0 auto 2rem; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);">
                    <i class="fas fa-check"></i>
                </div>
                <h2 style="font-family: 'Playfair Display', serif; color: var(--primary-dark); font-size: 2rem; margin-bottom: 1rem;">Agendamento Enviado!</h2>
                <p style="color: var(--gray-600); font-size: 1.1rem; line-height: 1.6; max-width: 500px; margin: 0 auto 2rem;">
                    Você foi redirecionado para o WhatsApp da clínica. Nossa equipe confirmará seu agendamento em breve.
                </p>
                <div style="background: var(--gray-50); padding: 1.5rem; border-radius: 12px; max-width: 500px; margin: 0 auto 2rem;">
                    <p style="color: var(--primary-dark); font-weight: 600; margin-bottom: 0.5rem;">📱 Não foi redirecionado?</p>
                    <a href="https://wa.me/557192735493" target="_blank" class="btn btn-whatsapp" style="margin-top: 0.5rem;">
                        <i class="fab fa-whatsapp"></i> Abrir WhatsApp
                    </a>
                </div>
                <a href="index.html" class="btn btn-outline">
                    <i class="fas fa-home"></i> Voltar ao Início
                </a>
            </div>
        `;

        form.innerHTML = successHTML;
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ===== INIT =====
    init();

})();
