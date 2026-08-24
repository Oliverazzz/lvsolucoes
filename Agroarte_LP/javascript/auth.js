// 1. Importar os módulos necessários do Firebase SDK (Modular v10+)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, addDoc, query, where, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 2. Configuração com as credenciais do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBuabZsqWLOxl-MyzlwddrFKHf32eyHtCU",
  authDomain: "database-agroarte.firebaseapp.com",
  projectId: "database-agroarte",
  storageBucket: "database-agroarte.firebasestorage.app",
  messagingSenderId: "234751803792",
  appId: "1:234751803792:web:5c0558ec3fd7fedf333315"
};

// 3. Inicializar o Firebase e o serviço de Autenticação/Banco
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Helper para escapar strings HTML e evitar Stored XSS
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return map[m];
  });
}

const isFileProtocol = window.location.protocol === 'file:';

// ── Elementos do modal de login ──
const loginModal    = document.getElementById('login-modal');
const loginButtons  = document.querySelectorAll('.user-login');
const errorMessage  = document.getElementById('error-message');

// ── Elementos do modal de conta logada ──
const accountModal        = document.getElementById('account-modal');
const accountAvatar       = document.getElementById('account-avatar');
const accountAvatarFallback = document.getElementById('account-avatar-fallback');
const accountName         = document.getElementById('account-name');
const accountEmail        = document.getElementById('account-email');
const btnSwitchAccount    = document.getElementById('btn-switch-account');
const btnLogout           = document.getElementById('btn-logout');
const btnGoAdmin          = document.getElementById('btn-go-admin');

// ==========================================
// CONTROLE DO MODAL DE LOGIN
// ==========================================
function openLoginModal() {
    if (!loginModal) return;

    if (auth.currentUser) {
        openAccountModal(auth.currentUser);
        return;
    }

    loginModal.hidden = false;
    document.body.classList.add('modal-open');
    if (errorMessage) errorMessage.style.display = 'none';
}

function closeLoginModal() {
    if (!loginModal) return;
    loginModal.hidden = true;
    document.body.classList.remove('modal-open');
}

// ==========================================
// CONTROLE DO MODAL DE CONTA LOGADA
// ==========================================
function openAccountModal(user) {
    if (!accountModal) return;

    if (accountName)  accountName.textContent  = user.displayName || 'Usuário';
    if (accountEmail) accountEmail.textContent = user.email       || '';

    if (accountAvatar && accountAvatarFallback) {
        if (user.photoURL) {
            accountAvatar.src            = user.photoURL;
            accountAvatar.style.display  = 'block';
            accountAvatarFallback.style.display = 'none';
        } else {
            accountAvatar.style.display  = 'none';
            accountAvatarFallback.style.display = 'flex';
            const initial = (user.displayName || user.email || '?')[0].toUpperCase();
            accountAvatarFallback.textContent = initial;
        }
    }

    accountModal.hidden = false;
    document.body.classList.add('modal-open');
}

// Verifica de forma segura no Firebase se a conta é Admin
function verificarAdminSilencioso(user) {
    if (!btnGoAdmin) return;
    
    getDoc(doc(db, "permissoes", "admin"))
      .then(() => {
          btnGoAdmin.style.display = 'flex';
      })
      .catch((error) => {
          console.error("Erro detalhado do Firebase na Home (verificarAdminSilencioso):", error);
          btnGoAdmin.style.display = 'none';
      });
}

function closeAccountModal() {
    if (!accountModal) return;
    accountModal.hidden = true;
    document.body.classList.remove('modal-open');
}

document.querySelectorAll('[data-account-close]').forEach((el) => {
    el.addEventListener('click', closeAccountModal);
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (loginModal  && !loginModal.hidden)  closeLoginModal();
        if (accountModal && !accountModal.hidden) closeAccountModal();
        const modalTodasAval = document.getElementById('modal-todas-avaliacoes');
        if (modalTodasAval && modalTodasAval.style.display === 'flex') {
            modalTodasAval.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }
});

// ==========================================
// BOTÕES DO MODAL DE CONTA
// ==========================================
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        auth.signOut()
            .then(() => {
                closeAccountModal();
                console.log('Sessão encerrada.');
            })
            .catch((error) => console.error('Erro ao sair:', error));
    });
}

if (btnSwitchAccount) {
    btnSwitchAccount.addEventListener('click', () => {
        auth.signOut()
            .then(() => {
                closeAccountModal();
                const switchProvider = new GoogleAuthProvider();
                switchProvider.setCustomParameters({ prompt: 'select_account' });
                return signInWithPopup(auth, switchProvider);
            })
            .then((result) => {
                console.log('Conta trocada para:', result.user.displayName);
            })
            .catch((error) => {
                if (error.code !== 'auth/popup-closed-by-user') {
                    console.error('Erro ao trocar conta:', error.code);
                }
            });
    });
}

loginButtons.forEach((button) => {
    button.addEventListener('click', openLoginModal);
});

document.querySelectorAll('[data-login-close]').forEach((el) => {
    el.addEventListener('click', closeLoginModal);
});

// ==========================================
// LOGIN COM O GOOGLE
// ==========================================
const googleProvider = new GoogleAuthProvider();
const btnGoogle = document.getElementById('btn-google');

if (btnGoogle) {
    btnGoogle.addEventListener('click', () => {
        if (errorMessage) errorMessage.style.display = 'none';

        if (isFileProtocol) {
            if (errorMessage) {
                errorMessage.style.display = 'block';
                errorMessage.innerText = 'Para usar o login com Google, abra o site via localhost ou HTTPS.';
            }
            return;
        }

        signInWithPopup(auth, googleProvider)
            .then((result) => {
                console.log('Login com Google bem-sucedido:', result.user.displayName);
                closeLoginModal();
            })
            .catch((error) => {
                console.error('Erro no login com Google:', error.code, error.message);
                if (error.code !== 'auth/popup-closed-by-user' && errorMessage) {
                    errorMessage.style.display = 'block';
                    errorMessage.innerText = error.code === 'auth/unauthorized-domain'
                        ? `Domínio (${window.location.hostname}) não autorizado no Firebase. Adicione-o em Authentication > Authorized Domains.`
                        : 'Não foi possível autenticar com o Google. Tente novamente.';
                }
            });
    });
}

// Função para converter links do Google Drive em links diretos de imagem
function converterLinkGoogleDrive(url) {
  if (!url) return url;
  if (url.includes('drive.google.com') || url.includes('docs.google.com')) {
    const regexD = /\/d\/([a-zA-Z0-9_-]+)/;
    const regexId = /[?&]id=([a-zA-Z0-9_-]+)/;
    const matchD = url.match(regexD);
    const matchId = url.match(regexId);
    const id = (matchD && matchD[1]) || (matchId && matchId[1]);
    if (id) {
      return `https://lh3.googleusercontent.com/d/${id}`;
    }
  }
  return url;
}

// ==========================================
// CARREGAR PRODUTOS EM DESTAQUE COM SUPORTE A CARROSSEL
// ==========================================
async function carregarDestaquesLP() {
  const destaquesSection = document.getElementById('destaques-section');
  const destaquesGrid = document.getElementById('destaques-grid');
  
  if (!destaquesGrid) return;
  destaquesGrid.innerHTML = '';

  try {
    const catSnapshot = await getDocs(collection(db, "categorias"));
    const categoriasNomes = {};
    catSnapshot.forEach(docSnap => {
      categoriasNomes[docSnap.id] = docSnap.data().name || docSnap.data().nome;
    });

    const q = query(collection(db, "produtos"), where("destaque", "==", true));
    const querySnapshot = await getDocs(q);

    let count = 0;
    const docsArray = [];
    querySnapshot.forEach(d => docsArray.push(d));

    docsArray.forEach((docSnap) => {
      count++;
      const p = docSnap.data();

      const card = document.createElement('article');
      card.className = 'catalogo-card';

      const msgWpp = encodeURIComponent(`Olá! Vi o site e gostaria de solicitar um orçamento para o item em Destaque: ${p.nome} (${categoriasNomes[p.categoria] || p.categoria}).`);
      const linkWpp = `https://wa.me/5514996336181?text=${msgWpp}`;

      let imgBlockHTML = '';
      let listImgs = p.imagens || (p.imagem ? [p.imagem] : ["https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=500&q=80"]);
      listImgs = listImgs.map(img => converterLinkGoogleDrive(img));

      if (listImgs.length > 1) {
        let slidesHTML = '';
        let dotsHTML = '';
        listImgs.forEach((img, idx) => {
          slidesHTML += `
            <div class="carousel-slide">
              <img src="${img}" alt="${p.nome}" onerror="this.src='https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=500&q=80'">
            </div>
          `;
          dotsHTML += `<div class="carousel-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></div>`;
        });

        imgBlockHTML = `
          <div class="card-carousel" data-current="0" data-total="${listImgs.length}">
            <div class="carousel-track">
              ${slidesHTML}
            </div>
            <button class="carousel-control prev">❮</button>
            <button class="carousel-control next">❯</button>
            <div class="carousel-indicators">
              ${dotsHTML}
            </div>
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
        <div class="catalogo-card-img-wrapper">
          ${imgBlockHTML}
        </div>
        <div class="catalogo-card-header" style="margin-bottom: 8px;">
          <span class="catalogo-card-badge">${escapeHTML(categoriasNomes[p.categoria] || p.categoria)}</span>
          <span style="font-size: 1.2rem;">${escapeHTML(p.icone || '⭐')}</span>
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
      destaquesGrid.appendChild(card);
    });

    if (count > 0 && destaquesSection) {
      destaquesSection.style.display = 'block';
      
      // Inicializa o carrossel manual geral de destaques
      if (typeof window.initHighlightsSlider === 'function') {
        window.initHighlightsSlider();
      }
    }
  } catch (err) {
    console.error("Erro ao renderizar destaques na Home:", err);
  }
}

// Event delegation global para os carrosséis de imagens nos cards de produto
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
    dots.forEach((d, dIdx) => {
      d.classList.toggle('active', dIdx === index);
    });
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
  dots.forEach((dot, dIdx) => {
    dot.classList.toggle('active', dIdx === index);
  });
});

// Event delegation global para gestos touch (Swipe) nos carrosséis dos cards de produto
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

  // Garante deslize horizontal relevante (mínimo 40px) e descarta deslizes muito verticais
  if (Math.abs(diffX) > 40 && Math.abs(diffY) < 30) {
    const track = carousel.querySelector('.carousel-track');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const total = parseInt(carousel.dataset.total);
    let index = parseInt(carousel.dataset.current) || 0;

    if (diffX > 0) {
      // Swipe direita (anterior)
      index = (index > 0) ? index - 1 : total - 1;
    } else {
      // Swipe esquerda (próximo)
      index = (index < total - 1) ? index + 1 : 0;
    }

    carousel.dataset.current = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, dIdx) => {
      dot.classList.toggle('active', dIdx === index);
    });
  }
}, { passive: true });

// ==========================================
// LÓGICA DE AVALIAÇÕES DO SITE (Firestore)
// ==========================================
const formAval = document.getElementById('form-avaliacao');
const stars = document.querySelectorAll('#star-rating span');
const avalTextoInput = document.getElementById('aval-texto');
const containerAvalDinamicas = document.getElementById('avaliacoes-dinamicas');

let ratingSelecionado = 0;

// Sistema de acender as estrelas interativas
stars.forEach(star => {
  star.addEventListener('click', () => {
    const val = parseInt(star.dataset.val);
    ratingSelecionado = val;

    stars.forEach(s => {
      const sVal = parseInt(s.dataset.val);
      if (sVal <= val) {
        s.style.color = '#f1c40f'; // Dourado
      } else {
        s.style.color = '#ccc'; // Cinza
      }
    });
  });
});

// Cadastra a avaliação no Firestore
if (formAval) {
  formAval.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById('btn-submit-aval');
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Enviando...";

    try {
      const user = auth.currentUser;
      const nome = user ? (user.displayName || user.email.split('@')[0]) : "Cliente Anônimo";
      const texto = avalTextoInput.value.trim() || "";
      
      // Se não escolheu estrela e nem escreveu texto, não envia nada vazio
      if (ratingSelecionado === 0 && texto === "") {
        alert("Por favor, selecione uma nota por estrelas ou digite um comentário antes de enviar.");
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Enviar Avaliação";
        return;
      }

      await addDoc(collection(db, "avaliacoes"), {
        nome,
        nota: ratingSelecionado || null,
        texto: texto || null,
        criadoEm: new Date()
      });

      // Limpa formulário
      formAval.reset();
      ratingSelecionado = 0;
      stars.forEach(s => s.style.color = '#ccc');
      alert("Avaliação registrada com sucesso! Muito obrigado pelo feedback.");
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar avaliação: " + err.message);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = "Enviar Avaliação";
    }
  });
}

let currentStoryIndex = 0;
let storyInterval = null;
const STORY_DURATION = 6000;

function ouvirAvaliacoesLP() {
  if (!containerAvalDinamicas) return;

  onSnapshot(query(collection(db, "avaliacoes"), orderBy("criadoEm", "desc")), (snapshot) => {
    containerAvalDinamicas.innerHTML = '';

    let totalReviews = [];
    snapshot.forEach(docSnap => {
      totalReviews.push(docSnap.data());
    });

    if (totalReviews.length === 0) {
      containerAvalDinamicas.style.display = 'none';
      return;
    }

    // Embaralha para que seja aleatório
    totalReviews = totalReviews.sort(() => 0.5 - Math.random());

    containerAvalDinamicas.style.display = 'block';

    const storyWrapper = document.createElement('div');
    storyWrapper.className = 'story-wrapper';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'story-progress-bar';
    const progressFill = document.createElement('div');
    progressFill.className = 'story-progress-fill';
    progressBar.appendChild(progressFill);
    
    const storyContent = document.createElement('div');
    storyContent.className = 'story-content';
    
    storyWrapper.appendChild(progressBar);
    storyWrapper.appendChild(storyContent);
    containerAvalDinamicas.appendChild(storyWrapper);

    let btnVerMais = document.getElementById('container-btn-ver-mais');
    if (!btnVerMais) {
      const divBtn = document.createElement('div');
      divBtn.style.textAlign = 'center';
      divBtn.style.marginTop = '20px';
      divBtn.id = 'container-btn-ver-mais';
      divBtn.innerHTML = `
        <button id="btn-ver-mais-avaliacoes" style="background: none; border: 1.5px solid var(--accent); color: var(--primary); font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 0.85rem; padding: 10px 20px; border-radius: 30px; cursor: pointer; transition: all 0.25s ease;" onmouseover="this.style.backgroundColor='var(--accent)'; this.style.color='var(--white)'" onmouseout="this.style.backgroundColor='transparent'; this.style.color='var(--primary)'">
          Todas as Avaliações (${totalReviews.length})
        </button>
      `;
      containerAvalDinamicas.after(divBtn);
      
      document.getElementById('btn-ver-mais-avaliacoes').addEventListener('click', () => {
        abrirModalTodasAvaliacoes(totalReviews);
      });
    } else {
      document.getElementById('btn-ver-mais-avaliacoes').textContent = `Todas as Avaliações (${totalReviews.length})`;
    }

    const showStory = (index) => {
      const val = totalReviews[index];
      
      let estrelasHTML = '';
      if (val.nota) {
        for (let i = 1; i <= 5; i++) {
          estrelasHTML += `<span style="color: ${i <= val.nota ? '#f1c40f' : '#ccc'}; font-size: 1.1rem; margin-right: 2px;">★</span>`;
        }
      }

      storyContent.innerHTML = `
        <div class="card-depoimento story-card" style="margin: 0; box-shadow: none; position: relative;">

          <!-- Ícone de fonte no canto superior direito -->
          <div style="position: absolute; top: 14px; right: 14px; opacity: 0.85;">
            ${val.fonte === 'google' ? `
              <svg width="22" height="22" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
            ` : `
              <!-- Agroarte logo icon -->
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="12" fill="#1b4d3e"/>
                <path d="M12 5 C12 5 7 9 7 14 C7 18 12 20 12 20 C12 20 17 18 17 14 C17 9 12 5 12 5 Z" fill="#d4a373"/>
                <path d="M12 5 L12 20" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
            `}
          </div>

          <p class="depoimento-text" style="font-style: italic; color: #555; padding-right: 30px;">
            ${val.texto ? '"' + escapeHTML(val.texto) + '"' : "Avaliou sem deixar comentário."}
          </p>
          <div class="depoimento-autor" style="margin-top: 12px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
              <div class="autor-avatar" style="background-color: var(--accent); color: var(--primary); font-weight: 700;">
                ${escapeHTML((val.nome || "C")[0].toUpperCase())}
              </div>
              <div class="autor-info" style="margin-left: 8px;">
                <h3 style="font-size: 0.9rem; margin-bottom: 4px;">${escapeHTML(val.nome || "Cliente")}</h3>
                <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.72rem; font-weight: 700; color: #1b7c4a; background: #e8f7ef; border: 1px solid #b6e8cc; border-radius: 20px; padding: 2px 8px; font-family: 'Montserrat', sans-serif; letter-spacing: 0.2px;">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L5 9L2 6" stroke="#1b7c4a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  ${val.fonte === 'google' ? 'Google' : 'Avaliação do Site'}
                </span>
              </div>
            </div>
            <div style="display: flex;">
              ${estrelasHTML}
            </div>
          </div>
        </div>
      `;
      
      progressFill.style.transition = 'none';
      progressFill.style.width = '0%';
      storyContent.classList.remove('story-active');
      
      // Força reflow
      void progressFill.offsetWidth;
      
      progressFill.style.transition = `width ${STORY_DURATION}ms linear`;
      progressFill.style.width = '100%';
      storyContent.classList.add('story-active');
    };

    if (storyInterval) clearInterval(storyInterval);

    currentStoryIndex = 0;
    showStory(currentStoryIndex);

    if (totalReviews.length > 1) {
      storyInterval = setInterval(() => {
        storyContent.classList.remove('story-active');
        
        setTimeout(() => {
          currentStoryIndex = (currentStoryIndex + 1) % totalReviews.length;
          showStory(currentStoryIndex);
        }, 400); 
      }, STORY_DURATION);
    } else {
      progressBar.style.display = 'none';
    }
  });
}

// Cria um modal dinâmico no HTML para mostrar a lista completa das avaliações do site
function abrirModalTodasAvaliacoes(reviews) {
  let modal = document.getElementById('modal-todas-avaliacoes');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-todas-avaliacoes';
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.zIndex = '110';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.padding = '24px';
    modal.style.background = 'rgba(8, 16, 14, 0.7)';
    modal.style.backdropFilter = 'blur(6px)';
    document.body.appendChild(modal);
  }

  let listHTML = '';
  reviews.forEach(val => {
    let estrelasHTML = '';
    if (val.nota) {
      for (let i = 1; i <= 5; i++) {
        estrelasHTML += `<span style="color: ${i <= val.nota ? '#f1c40f' : '#ccc'}; font-size: 1.1rem; margin-right: 2px;">★</span>`;
      }
    }
    listHTML += `
      <div class="card-depoimento" style="background: var(--bg-cream); padding: 20px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.02); display: flex; flex-direction: column; gap: 8px; text-align: left; width: 100%;">
        <p style="font-style: italic; color: #555; margin-bottom: 8px; font-size: 0.92rem;">
          ${val.texto ? `"${escapeHTML(val.texto)}"` : "Avaliou sem deixar comentário."}
        </p>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div class="autor-avatar" style="width:36px; height:36px; background-color: var(--accent); color: var(--primary); font-weight:700; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size: 0.9rem;">
              ${escapeHTML((val.nome || "C")[0].toUpperCase())}
            </div>
            <div>
              <h4 style="font-size:0.85rem; margin:0 0 4px 0; font-family:'Montserrat';">${escapeHTML(val.nome || "Cliente")}</h4>
              <span style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.7rem; font-weight: 700; color: #1b7c4a; background: #e8f7ef; border: 1px solid #b6e8cc; border-radius: 20px; padding: 2px 8px; font-family: 'Montserrat', sans-serif;">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L5 9L2 6" stroke="#1b7c4a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                Avaliação do Site
              </span>
            </div>
          </div>
          <div>${estrelasHTML}</div>
        </div>
      </div>
    `;
  });

  modal.innerHTML = `
    <div class="modal-backdrop" onclick="document.getElementById('modal-todas-avaliacoes').style.display='none'; document.body.classList.remove('modal-open');"></div>
    <div class="auth-shell" style="width: min(100%, 550px); z-index: 111;">
      <div class="form auth-form" style="padding: 24px; max-height: 80vh; overflow-y: auto;">
        <div class="flex-row" style="margin-bottom: 16px; justify-content: space-between; width: 100%;">
          <span style="font-weight: 700; color: var(--primary); font-family: 'Montserrat', sans-serif; font-size: 1.1rem;">Todas as Avaliações</span>
          <span onclick="document.getElementById('modal-todas-avaliacoes').style.display='none'; document.body.classList.remove('modal-open');" style="cursor: pointer; font-size: 1.5rem; font-weight: bold; color: var(--text-muted); line-height: 1;">&times;</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; max-height: 55vh; overflow-y: auto; padding-right: 4px;">
          ${listHTML}
        </div>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
}

// ==========================================
// OBSERVADOR DE ESTADO DE AUTENTICAÇÃO
// ==========================================
onAuthStateChanged(auth, (user) => {
    loginButtons.forEach((button) => {
        button.classList.toggle('is-authenticated', Boolean(user));
        button.setAttribute('title', user
            ? `Logado como ${user.displayName || user.email}`
            : 'Entrar na conta');
    });

    if (user) {
        verificarAdminSilencioso(user);
    } else {
        if (btnGoAdmin) btnGoAdmin.style.display = 'none';
    }
});

// ==========================================
// CARREGAR E RENDERIZAR CATEGORIAS DINAMICAMENTE DO FIREBASE
// ==========================================
async function carregarCategoriasLP() {
  const track = document.getElementById('categorias-slider-track');
  if (!track) return;

  try {
    const querySnapshot = await getDocs(collection(db, "categorias"));
    
    // Fallback de ícones padrão se não houver no banco
    const iconesPadrao = {
      pet: "🐶",
      farmacia: "💊",
      selaria: "🤠",
      ferramentas: "🛠️",
      insumos: "🌱",
      utilidades: "🏠"
    };

    const imgsPadrao = {
      pet: "https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?q=80&w=870&auto=format&fit=crop",
      farmacia: "../img/card-farmacia_veterinaria.webp",
      selaria: "https://images.unsplash.com/photo-1769374090266-ae4e916abc75?q=80&w=388&auto=format&fit=crop",
      ferramentas: "https://images.unsplash.com/photo-1683115099191-51e617fc5ff1?q=80&w=876&auto=format&fit=crop",
      insumos: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=870&auto=format&fit=crop",
      utilidades: "https://plus.unsplash.com/premium_photo-1714702844124-be1377d19666?q=80&w=869&auto=format&fit=crop"
    };

    let cardsHTML = '';
    let catArray = [];
    querySnapshot.forEach(d => catArray.push(d));

    const limit = 4;
    const displayCats = catArray.slice(0, limit);

    displayCats.forEach(docSnap => {
      const catId = docSnap.id;
      const cat = docSnap.data();
      
      const nome = cat.name || cat.nome || catId;
      const desc = cat.desc || cat.descricao || "Confira os melhores itens em nossa loja.";
      const icone = cat.icone || iconesPadrao[catId] || "🏷️";
      const imagem = converterLinkGoogleDrive(cat.imagem || cat.img || imgsPadrao[catId] || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=500&q=80");

      cardsHTML += `
        <div class="card-dep" data-category="${catId}" tabindex="0" role="button" onclick="window.location.href='./html/catalogo.html?cat=${catId}'">
          <div class="card-img-wrapper">
            <img src="${imagem}" alt="${nome}" onerror="this.src='https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=500&q=80'">
            <div class="card-icon-badge">${icone}</div>
          </div>
          <div class="card-body">
            <h3>${nome}</h3>
            <p>${desc}</p>
          </div>
          <div class="card-dep-click-indicator">👆</div>
        </div>
      `;
    });

    if (catArray.length > limit) {
      cardsHTML += `
        <div class="card-dep" tabindex="0" role="button" onclick="window.location.href='./html/catalogo.html'" style="display: flex; flex-direction: column; justify-content: center; align-items: center; background: rgba(27, 77, 62, 0.05); text-align: center; cursor: pointer; border: 2px dashed rgba(27, 77, 62, 0.2);">
          <div style="font-size: 3rem; margin-bottom: 12px;">📚</div>
          <h3 style="color: var(--primary);">Todas as Categorias</h3>
          <p style="color: var(--text-muted); font-size: 0.9rem; padding: 0 16px;">Clique para ver o catálogo completo e explorar todas as ${catArray.length} categorias.</p>
        </div>
      `;
    }

    if (cardsHTML !== '') {
      track.innerHTML = cardsHTML;
      
      // Inicializa ou atualiza o carrossel infinito de categorias no mobile
      if (typeof window.refreshCategorySlider === 'function') {
        window.refreshCategorySlider();
      }
    }
  } catch (err) {
    console.error("Erro ao carregar categorias dinâmicas:", err);
  }
}

// Inicialização Geral da LP
document.addEventListener("DOMContentLoaded", () => {
  carregarDestaquesLP();
  carregarCategoriasLP();
  ouvirAvaliacoesLP();
});
