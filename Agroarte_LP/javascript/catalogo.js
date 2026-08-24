import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBuabZsqWLOxl-MyzlwddrFKHf32eyHtCU",
  authDomain: "database-agroarte.firebaseapp.com",
  projectId: "database-agroarte",
  storageBucket: "database-agroarte.firebasestorage.app",
  messagingSenderId: "234751803792",
  appId: "1:234751803792:web:5c0558ec3fd7fedf333315"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper para escapar strings HTML e evitar Stored XSS
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return map[m];
  });
}

let CATEGORIAS_NOMES = {};
let PRODUTOS = [];
let filtroCategoriaAtiva = 'todos';
let termoPesquisaAtivo = '';

const loadingElement = document.getElementById('loading');
const gridElement = document.getElementById('catalogo-grid');
const buscaElement = document.getElementById('catalogo-busca');
const pillsContainer = document.getElementById('pills-container');

// 1. Carregar Categorias dinâmicas
async function carregarCategorias() {
  try {
    const querySnapshot = await getDocs(collection(db, "categorias"));
    CATEGORIAS_NOMES = {};

    pillsContainer.innerHTML = '<button class="pill active" data-filter="todos">Todos</button>';

    querySnapshot.forEach(docSnap => {
      const key = docSnap.id;
      const cat = docSnap.data();
      CATEGORIAS_NOMES[key] = cat.nome;

      const btn = document.createElement('button');
      btn.className = 'pill';
      btn.dataset.filter = key;
      btn.textContent = cat.nome;

      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-pills .pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        filtroCategoriaAtiva = key;
        renderizarGrid();
      });

      pillsContainer.appendChild(btn);
    });

    const btnTodos = pillsContainer.querySelector('[data-filter="todos"]');
    btnTodos.addEventListener('click', () => {
      document.querySelectorAll('.filter-pills .pill').forEach(p => p.classList.remove('active'));
      btnTodos.classList.add('active');
      filtroCategoriaAtiva = 'todos';
      renderizarGrid();
    });

    capturarCategoriaUrl();
  } catch (err) {
    console.error("Erro ao carregar categorias:", err);
  }
}

// 2. Carregar produtos do Firestore
async function carregarProdutos() {
  try {
    const querySnapshot = await getDocs(collection(db, "produtos"));
    PRODUTOS = [];
    querySnapshot.forEach((doc) => {
      PRODUTOS.push({ id: doc.id, ...doc.data() });
    });
    
    // --- MOCK TESTE MERCADO LIVRE ---
    PRODUTOS.unshift({
      id: "teste_ml_catalogo",
      nome: "[TESTE] Bota Texana (Com ML)",
      desc: "Produto de teste injetado temporariamente para validar o botão amarelo do Mercado Livre.",
      categoria: "selaria",
      imagem: "https://images.unsplash.com/photo-1599427670731-979de87714ed?q=80&w=800&auto=format&fit=crop",
      mlLink: "https://produto.mercadolivre.com.br/MLB-12345678-bota",
      icone: "👢",
      destaque: false
    });

    loadingElement.style.display = 'none';
    gridElement.style.display = 'grid';
    renderizarGrid();
  } catch (error) {
    console.error("Erro ao carregar banco do Firestore:", error);
    loadingElement.innerHTML = `<p style="color: #c0392b;">Erro ao carregar produtos. Tente recarregar a página.</p>`;
  }
}

// Converte links do Google Drive em links diretos de imagem
function converterLinkGoogleDrive(url) {
  if (!url) return url;
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const regexD = /\/d\/([a-zA-Z0-9_-]+)/;
    const regexId = /[?&]id=([a-zA-Z0-9_-]+)/;
    const matchD = url.match(regexD);
    const matchId = url.match(regexId);
    const id = (matchD && matchD[1]) || (matchId && matchId[1]);
    if (id) return `https://lh3.googleusercontent.com/d/${id}`;
  }
  return url;
}

// 3. Renderizar os cards dinamicamente com suporte a Carrossel e ML Link
function renderizarGrid() {
  gridElement.innerHTML = '';

  const filtrados = PRODUTOS.filter(p => {
    const matchCat = (filtroCategoriaAtiva === 'todos' || p.categoria === filtroCategoriaAtiva);
    const matchBusca = (p.nome.toLowerCase().includes(termoPesquisaAtivo.toLowerCase()) || p.desc.toLowerCase().includes(termoPesquisaAtivo.toLowerCase()));
    return matchCat && matchBusca;
  });

  if (filtrados.length === 0) {
    gridElement.innerHTML = `
      <div class="catalogo-vazio">
        <p>Nenhum produto correspondente cadastrado.</p>
        <span>Por favor, verifique a categoria selecionada ou o termo digitado.</span>
      </div>
    `;
    return;
  }

  filtrados.forEach((p, idx) => {
    const card = document.createElement('article');
    card.className = 'catalogo-card';
    card.style.animationDelay = `${idx * 0.04}s`;

    const msgWpp = encodeURIComponent(`Olá! Vi o site e gostaria de solicitar um orçamento para o item: ${p.nome} (${CATEGORIAS_NOMES[p.categoria] || p.categoria}).`);
    const linkWpp = `https://wa.me/5514996336181?text=${msgWpp}`;

    let imgBlockHTML = '';
    let listImgs = p.imagens || (p.imagem ? [p.imagem] : ["https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=500&q=80"]);
    listImgs = listImgs.map(img => converterLinkGoogleDrive(img));

    if (listImgs.length > 1) {
      let slidesHTML = '';
      let dotsHTML = '';
      listImgs.forEach((img, i) => {
        slidesHTML += `
          <div class="carousel-slide">
            <img src="${img}" alt="${p.nome}" onerror="this.src='https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=500&q=80'">
          </div>
        `;
        dotsHTML += `<div class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`;
      });

      imgBlockHTML = `
        <div class="card-carousel" data-current="0" data-total="${listImgs.length}">
          <div class="carousel-track">${slidesHTML}</div>
          <button class="carousel-control prev">❮</button>
          <button class="carousel-control next">❯</button>
          <div class="carousel-indicators">${dotsHTML}</div>
        </div>
      `;
    } else {
      imgBlockHTML = `<img src="${listImgs[0]}" alt="${p.nome}" class="catalogo-card-img" onerror="this.src='https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=500&q=80'">`;
    }

    let mlButtonHTML = '';
    if (p.mlLink) {
      mlButtonHTML = `
        <a href="${p.mlLink}" target="_blank" rel="noopener noreferrer" class="btn-catalogo-ml">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="fill: #2d3748;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          Comprar no Mercado Livre
        </a>
      `;
    }

    card.innerHTML = `
      <div class="catalogo-card-img-wrapper">${imgBlockHTML}</div>
      <div class="catalogo-card-header" style="margin-bottom: 8px;">
        <span class="catalogo-card-badge">${escapeHTML(CATEGORIAS_NOMES[p.categoria] || p.categoria)}</span>
        <span style="font-size: 1.2rem;">${escapeHTML(p.icone || '📦')}</span>
      </div>
      <div class="catalogo-card-body" style="flex-grow: 1;">
        <h4>${escapeHTML(p.nome)}</h4>
        <p style="margin-bottom: 12px;">${escapeHTML(p.desc)}</p>
      </div>
      <div class="catalogo-card-footer">
        <a href="${linkWpp}" target="_blank" rel="noopener noreferrer" class="btn-catalogo-wpp">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Orçar no WhatsApp
        </a>
        ${mlButtonHTML}
      </div>
    `;
    gridElement.appendChild(card);
  });
}

// 4. Event Delegation para Carrosséis nos cards (clique e swipe)
document.addEventListener('click', (e) => {
  const dot = e.target.closest('.carousel-dot');
  if (dot) {
    e.preventDefault();
    e.stopPropagation();
    const carousel = dot.closest('.card-carousel');
    if (!carousel) return;
    const track = carousel.querySelector('.carousel-track');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const index = parseInt(dot.dataset.index);
    carousel.dataset.current = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, dIdx) => d.classList.toggle('active', dIdx === index));
    return;
  }

  const btn = e.target.closest('.carousel-control');
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();

  const carousel = btn.closest('.card-carousel');
  if (!carousel) return;
  const track = carousel.querySelector('.carousel-track');
  const dots = carousel.querySelectorAll('.carousel-dot');
  const total = parseInt(carousel.dataset.total);
  let index = parseInt(carousel.dataset.current) || 0;

  if (btn.classList.contains('prev')) {
    index = (index > 0) ? index - 1 : total - 1;
  } else if (btn.classList.contains('next')) {
    index = (index < total - 1) ? index + 1 : 0;
  }

  carousel.dataset.current = index;
  track.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((dot, dIdx) => dot.classList.toggle('active', dIdx === index));
});

let cardTouchStartX = 0;
let cardTouchStartY = 0;
let activeCarousel = null;

document.addEventListener('touchstart', (e) => {
  const carousel = e.target.closest('.card-carousel');
  if (!carousel) return;
  cardTouchStartX = e.touches[0].clientX;
  cardTouchStartY = e.touches[0].clientY;
  activeCarousel = carousel;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  if (!activeCarousel) return;
  const carousel = activeCarousel;
  activeCarousel = null;

  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  const diffX = touchEndX - cardTouchStartX;
  const diffY = touchEndY - cardTouchStartY;

  if (Math.abs(diffX) > 40 && Math.abs(diffY) < 30) {
    const track = carousel.querySelector('.carousel-track');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const total = parseInt(carousel.dataset.total);
    let index = parseInt(carousel.dataset.current) || 0;

    if (diffX > 0) {
      index = (index > 0) ? index - 1 : total - 1;
    } else {
      index = (index < total - 1) ? index + 1 : 0;
    }

    carousel.dataset.current = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, dIdx) => dot.classList.toggle('active', dIdx === index));
  }
}, { passive: true });

// 5. Captura do parâmetro de URL (?cat=pet)
function capturarCategoriaUrl() {
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');
  const pill = pillsContainer.querySelector(`[data-filter="${catParam}"]`);
  if (catParam && pill) {
    filtroCategoriaAtiva = catParam;
    document.querySelectorAll('.filter-pills .pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    renderizarGrid();
  }
}

buscaElement.addEventListener('input', (e) => {
  termoPesquisaAtivo = e.target.value;
  renderizarGrid();
});

async function inicializar() {
  await carregarCategorias();
  await carregarProdutos();
}

inicializar();
