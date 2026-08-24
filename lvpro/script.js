(() => {
  'use strict';

  /* =========================================================
     CONFIG — edite aqui para personalizar
     ========================================================= */
  const CONFIG = {
    whatsappNumber: '5514996878349', // DDI+DDD+número, apenas dígitos
  };

  /* =========================================================
     DADOS — serviços, processo, portfólio, depoimentos
     ========================================================= */
  const SERVICES = [
    {
      icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8 21h8M12 17v4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
      title: 'Landing Pages',
      desc: 'Páginas estratégicas, rápidas e responsivas que transformam visitantes em clientes.',
      list: ['Design persuasivo', 'Foco em conversão', 'Estrutura validada', 'Entrega rápida'],
      full: 'Criamos landing pages sob medida para o seu produto ou serviço: copywriting orientado a conversão, design responsivo, carregamento rápido e estrutura testada para transformar visitantes em leads e clientes. Cada página é pensada para uma única meta clara — vender, cadastrar ou agendar.'
    },
    {
      icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.36a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.64 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.64 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7.07 4.24l.06.06A1.7 1.7 0 0 0 9 4.64a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.36 9c.14.36.5 1.14 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
      title: 'Automações',
      desc: 'Automatizamos processos e integrações para você ganhar tempo e reduzir falhas operacionais.',
      list: ['Fluxos de e-mail e WhatsApp', 'Integrações com ferramentas', 'Respostas automáticas', 'Nutrição de leads'],
      full: 'Conectamos suas ferramentas e criamos fluxos automáticos de e-mail, WhatsApp e CRM para que nenhum lead fique sem resposta. Menos tarefas manuais, menos falhas, mais tempo livre para você focar em estratégia enquanto o sistema trabalha por você.'
    },
    {
      icon: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="currentColor" stroke-width="1.7"/><path d="M5 20c1.2-3.6 4-5.4 7-5.4s5.8 1.8 7 5.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>`,
      title: 'Consultoria',
      desc: 'Análise do seu negócio e orientação estratégica para decisões que geram resultado de verdade.',
      list: ['Diagnóstico completo', 'Plano de ação personalizado', 'Otimização de conversão', 'Acompanhamento estratégico'],
      full: 'Analisamos seu funil, seus dados e seu momento de negócio para entregar um plano de ação claro e realista. Acompanhamos a execução, otimizamos o que não performa e ajustamos a rota com base em métricas reais — sem achismo.'
    },
  ];

  const STEPS = [
    { title: 'Entendimento', desc: 'Mergulhamos no seu negócio, objetivos e público para entender o que realmente importa.', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M20 20L16.5 16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>` },
    { title: 'Estratégia', desc: 'Definimos a melhor abordagem, estrutura, mensagem e ferramentas para o resultado.', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 21V13M4 9V3M12 21V11M12 7V3M20 21V15M20 11V3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M1 13H7M9 7H15M17 15H23" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>` },
    { title: 'Execução', desc: 'Criamos sua landing page, configuramos automações e testamos cada detalhe.', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94L4 21l-3-3 8.5-8.5a6 6 0 0 1 7.94-7.94L14.71 6.3Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>` },
    { title: 'Resultados', desc: 'Acompanhamos métricas, otimizamos e escalamos o que funciona para crescer ainda mais.', icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 20V14M12 20V8M20 20V4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>` },
  ];

  const PROJECTS = [
    { title: 'LP para Lançamento Infoproduto', tags: 'Landing Page · Copy · Design', stat: '+215% Conversões', a:'#4a1414', b:'#0b0b0b' },
    { title: 'LP para Produto Físico', tags: 'Landing Page · Design', stat: '+178% Conversões', a:'#2b2b2b', b:'#0b0b0b' },
    { title: 'LP para Mentoria Online', tags: 'Landing Page · Copy · Design', stat: '+206% Conversões', a:'#3a1414', b:'#151515' },
    { title: 'LP para Serviço Financeiro', tags: 'Landing Page · Automação', stat: '+162% Conversões', a:'#1a1a2e', b:'#0b0b0b' },
    { title: 'LP para Clínica de Estética', tags: 'Landing Page · Design', stat: '+190% Conversões', a:'#3a1f2e', b:'#0b0b0b' },
    { title: 'LP para Curso Online', tags: 'Landing Page · Copy', stat: '+230% Conversões', a:'#4a1414', b:'#242424' },
    { title: 'LP para E-commerce de Moda', tags: 'Landing Page · Automação', stat: '+145% Conversões', a:'#2b1a1a', b:'#0b0b0b' },
    { title: 'LP para Consultoria Jurídica', tags: 'Landing Page · Copy · Design', stat: '+170% Conversões', a:'#242424', b:'#0b0b0b' },
  ];

  const TESTIMONIALS = [
    { name: 'Presença Digital', role: 'Estudo de Mercado', initials: 'PD', text: 'Um site profissional não é apenas um cartão de visitas, é a representação oficial da sua presença digital.' },
    { name: '30% Mais Clientes', role: 'Análise de Conversão', initials: '30', text: 'Empresas que estabelecem uma presença digital sólida com landing pages estratégicas conseguem até 30% a mais de clientes.' },
    { name: 'Mais Vendas', role: 'Dados de Automação', initials: 'DA', text: 'Automações de marketing e vendas podem reduzir falhas de acompanhamento em 70%, garantindo que nenhum lead esfrie.' },
    { name: 'Menos Custo (CAC)', role: 'Estratégia Digital', initials: 'ED', text: 'Com uma landing page de alta performance, o custo de aquisição de clientes (CAC) chega a cair pela metade pela eficiência na conversão.' },
  ];

  /* =========================================================
     HELPERS
     ========================================================= */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function starsSVG(){
    let s = '';
    for(let i=0;i<5;i++){
      s += `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.7-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.3l7.1-.7L12 2Z"/></svg>`;
    }
    return s;
  }

  function toast(msg){
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove('is-visible'), 2600);
  }

  function whatsappLink(msg){
    return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg || 'Olá! Vim pelo site da LV Soluções Digitais.')}`;
  }

  /* =========================================================
     RENDER: SERVICES
     ========================================================= */
  function renderServices(){
    const grid = $('#servicesGrid');
    grid.innerHTML = SERVICES.map((s, i) => `
      <div class="card reveal reveal--delay-${i % 3}">
        <div class="card__icon">${s.icon}</div>
        <h3 class="card__title">${s.title}</h3>
        <p class="card__desc">${s.desc}</p>
        <ul class="card__list">
          ${s.list.map(li => `<li><svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 12.5L9 17.5L20 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>${li}</li>`).join('')}
        </ul>
        <button class="card__cta js-service-more" data-index="${i}" type="button">
          Saiba mais
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    `).join('');
  }

  /* =========================================================
     RENDER: STEPS
     ========================================================= */
  function renderSteps(){
    const list = $('#stepsList');
    list.innerHTML = STEPS.map((s, i) => `
      <li class="step reveal reveal--delay-${i % 3}">
        <div class="step__icon">${s.icon}</div>
        <span class="step__num">0${i + 1}</span>
        <h3 class="step__title">${s.title}</h3>
        <p class="step__desc">${s.desc}</p>
      </li>
    `).join('');
  }

  /* =========================================================
     RENDER: PORTFOLIO
     ========================================================= */
  function renderPortfolio(){
    const track = $('#portfolioTrack');
    track.innerHTML = PROJECTS.map(p => `
      <article class="project-card">
        <div class="project-card__media" style="--tint-a:${p.a};--tint-b:${p.b}">
          <span class="project-card__badge">${p.stat}</span>
        </div>
        <div class="project-card__body">
          <h3 class="project-card__title">${p.title}</h3>
          <p class="project-card__tags">${p.tags}</p>
        </div>
      </article>
    `).join('');

    const dots = $('#portfolioDots');
    const dotCount = Math.min(PROJECTS.length, 6);
    dots.innerHTML = Array.from({length: dotCount}).map((_, i) =>
      `<button type="button" aria-label="Ir para grupo ${i + 1}" class="${i === 0 ? 'is-active' : ''}"></button>`
    ).join('');

  }

  /* =========================================================
     RENDER: TESTIMONIALS
     ========================================================= */
  function renderTestimonials(){
    const track = $('#testimonialsTrack');
    track.innerHTML = TESTIMONIALS.map(t => `
      <article class="testimonial-card">
        <svg class="testimonial-card__quote-icon" width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 6C6.5 7.5 5 10 5 13a4 4 0 1 0 4 4c0-1.6-.9-2.7-2.2-3.3.3-2 1.6-3.7 3.7-4.7L9.5 6Zm9 0C15.5 7.5 14 10 14 13a4 4 0 1 0 4 4c0-1.6-.9-2.7-2.2-3.3.3-2 1.6-3.7 3.7-4.7L18.5 6Z"/></svg>
        <div class="testimonial-card__stars">${starsSVG()}</div>
        <p class="testimonial-card__text">${t.text}</p>
        <div class="testimonial-card__author">
          <span class="testimonial-card__avatar">${t.initials}</span>
          <div><strong>${t.name}</strong><span>${t.role}</span></div>
        </div>
      </article>
    `).join('');
  }

  /* =========================================================
     HEADER: scroll state + active link
     ========================================================= */
  function initHeader(){
    const header = $('#header');
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const links = $$('.nav__link');
    const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const id = '#' + entry.target.id;
          links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(s => io.observe(s));
  }

  /* =========================================================
     MOBILE MENU
     ========================================================= */
  function initMenu(){
    const toggle = $('#menuToggle');
    const nav = $('#nav');
    function close(){
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
    }
    function open(){
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Fechar menu');
    }
    toggle.addEventListener('click', () => {
      nav.classList.contains('is-open') ? close() : open();
    });
    $$('.nav__link').forEach(l => l.addEventListener('click', close));
    document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
  }

  /* =========================================================
     REVEAL ON SCROLL
     ========================================================= */
  function initReveal(){
    const items = $$('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(i => io.observe(i));
  }

  /* =========================================================
     CAROUSELS
     ========================================================= */
  function initCarousels(){
    // arrows that scroll their target track by one "page"
    $$('.carousel__arrow[data-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const track = document.getElementById(btn.dataset.target);
        if(!track) return;
        const card = track.querySelector('.project-card, .testimonial-card');
        const step = card ? card.getBoundingClientRect().width + 22 : track.clientWidth * 0.8;
        const dir = btn.dataset.dir === 'prev' || btn.classList.contains('carousel__arrow--prev') ? -1 : 1;
        try {
          track.scrollBy({ left: step * dir, behavior: 'smooth' });
        } catch(e) {
          track.scrollLeft += step * dir;
        }
      });
    });

    // portfolio dots sync
    const pTrack = $('#portfolioTrack');
    const pDots = $$('#portfolioDots button');
    if(pTrack && pDots.length){
      let ticking = false;
      pTrack.addEventListener('scroll', () => {
        if(ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const ratio = pTrack.scrollLeft / Math.max(1, (pTrack.scrollWidth - pTrack.clientWidth));
          const idx = Math.min(pDots.length - 1, Math.round(ratio * (pDots.length - 1)));
          pDots.forEach((d, i) => d.classList.toggle('is-active', i === idx));
          ticking = false;
        });
      }, { passive: true });

      pDots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
          const target = (pTrack.scrollWidth - pTrack.clientWidth) * (i / (pDots.length - 1));
          pTrack.scrollTo({ left: target, behavior: 'smooth' });
        });
      });
    }

    // testimonials counter
    const tTrack = $('#testimonialsTrack');
    const counter = $('#testimonialsCounter');
    if(tTrack && counter){
      const update = () => {
        const card = tTrack.querySelector('.testimonial-card');
        if(!card) return;
        const step = card.getBoundingClientRect().width + 22;
        const idx = Math.min(TESTIMONIALS.length - 1, Math.round(tTrack.scrollLeft / step));
        counter.textContent = `${idx + 1} / ${TESTIMONIALS.length}`;
      };
      tTrack.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
      update();
    }

    // enable drag-to-scroll with mouse on desktop
    $$('.carousel__track').forEach(track => {
      let isDown = false, startX, scrollLeft;
      track.addEventListener('mousedown', e => {
        isDown = true; track.classList.add('is-dragging');
        startX = e.pageX - track.offsetLeft; scrollLeft = track.scrollLeft;
      });
      ['mouseleave','mouseup'].forEach(ev => track.addEventListener(ev, () => { isDown = false; track.classList.remove('is-dragging'); }));
      track.addEventListener('mousemove', e => {
        if(!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        track.scrollLeft = scrollLeft - (x - startX) * 1.2;
      });
    });
  }

  /* =========================================================
     MODALS
     ========================================================= */
  function openModal(modal){
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(modal){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function initModals(){
    const serviceModal = $('#serviceModal');

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.js-service-more');
      if(trigger){
        const s = SERVICES[Number(trigger.dataset.index)];
        $('#serviceModalTitle').textContent = s.title;
        $('#serviceModalText').textContent = s.full;
        openModal(serviceModal);
      }
      if(e.target.closest('[data-close-modal]')){
        e.preventDefault();
        [serviceModal].forEach(m => { if(m && m.classList.contains('is-open')) closeModal(m); });
      }
    });

    document.addEventListener('keydown', e => {
      if(e.key === 'Escape'){
        [serviceModal].forEach(m => { if(m && m.classList.contains('is-open')) closeModal(m); });
      }
    });
  }

  /* =========================================================
     WHATSAPP BUTTONS
     ========================================================= */
  function initWhatsapp(){
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.js-open-whatsapp');
      if(!btn) return;
      e.preventDefault();
      window.open(whatsappLink(btn.dataset.msg), '_blank', 'noopener');
    });
  }

  /* =========================================================
     "EM BREVE" placeholders (blog, materiais, social etc.)
     ========================================================= */
  function initSoonLinks(){
    document.addEventListener('click', (e) => {
      const link = e.target.closest('.js-soon');
      if(!link) return;
      e.preventDefault();
      toast('Essa página ainda está em construção 🚧');
    });
  }

  /* =========================================================
     FOOTER YEAR
     ========================================================= */
  function initYear(){
    const y = $('#year');
    if(y) y.textContent = new Date().getFullYear();
  }

  /* =========================================================
     INIT
     ========================================================= */
  document.addEventListener('DOMContentLoaded', () => {
    renderServices();
    renderSteps();
    renderPortfolio();
    renderTestimonials();

    initHeader();
    initMenu();
    initReveal();
    initCarousels();
    initModals();
    initWhatsapp();
    initSoonLinks();
    initYear();
  });
})();
