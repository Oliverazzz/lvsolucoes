import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, setDoc, getDoc, onSnapshot, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBuabZsqWLOxl-MyzlwddrFKHf32eyHtCU",
  authDomain: "database-agroarte.firebaseapp.com",
  projectId: "database-agroarte",
  storageBucket: "database-agroarte.firebasestorage.app",
  messagingSenderId: "234751803792",
  appId: "1:234751803792:web:5c0558ec3fd7fedf333315"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Helper para escapar strings HTML e evitar Stored XSS
function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return map[m];
  });
}

const loginSection = document.getElementById('admin-login-section');
const panelSection = document.getElementById('admin-panel-section');
const btnLogin = document.getElementById('btn-admin-login');
const btnLogout = document.getElementById('btn-admin-logout');
const loginError = document.getElementById('login-error');
const welcomeText = document.getElementById('admin-welcome-text');
const formAdd = document.getElementById('form-add-produto');
const listContainer = document.getElementById('admin-list-container');
const countSpan = document.getElementById('prod-count');
const selectCategoria = document.getElementById('prod-categoria');
const btnAddCategoria = document.getElementById('btn-add-categoria');
const btnSubmitText = document.getElementById('btn-submit-text');
const dragZone = document.getElementById('image-drag-zone');
const fileInput = document.getElementById('prod-imagem-file');
const dragZoneText = document.getElementById('drag-zone-text');
const dragIconContainer = document.getElementById('drag-icon-container');
const searchInput = document.getElementById('admin-search-prod');

if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const items = listContainer.querySelectorAll('.admin-prod-item');
    let visibleCount = 0;
    items.forEach(item => {
      const nome = item.querySelector('.admin-prod-info h4').textContent.toLowerCase();
      if (nome.includes(term)) {
        item.style.setProperty('display', 'flex', 'important');
        visibleCount++;
      } else {
        item.style.setProperty('display', 'none', 'important');
      }
    });
    countSpan.textContent = visibleCount;
  });
}

// Elementos do Moderador de Avaliações
const avalContainer = document.getElementById('admin-aval-container');
const avalCountSpan = document.getElementById('aval-count');
const modalEditAval = document.getElementById('modal-edit-aval');
const formEditAval = document.getElementById('form-edit-avaliacao');
const editAvalId = document.getElementById('edit-aval-id');
const editAvalNome = document.getElementById('edit-aval-nome');
const editAvalNota = document.getElementById('edit-aval-nota');
const editAvalTexto = document.getElementById('edit-aval-texto');
const btnCancelEditAval = document.getElementById('btn-cancel-edit-aval');

// Elementos de Categoria
const btnDeleteCategoria = document.getElementById('btn-delete-categoria');
const modalAddCategoria = document.getElementById('modal-add-categoria');
const formNovaCategoria = document.getElementById('form-nova-categoria');
const btnCancelNewCat = document.getElementById('btn-cancel-new-cat');

let categoriasLocais = {};
let selectedFiles = [];
let editProdId = null;
let activeThumbnailIntervals = [];

// 1. Ouvinte de Autenticação
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginError.style.display = 'none';

    getDoc(doc(db, "permissoes", "admin"))
      .then(() => {
        loginSection.style.display = 'none';
        panelSection.style.display = 'block';
        welcomeText.textContent = `Olá, ${user.displayName || user.email}. Bem-vindo ao painel.`;
        ouvirCategorias();
        ouvirProdutos();
        ouvirAvaliacoes();
      })
      .catch((error) => {
        console.error("Erro detalhado do Firebase:", error.code, error.message);
        loginError.style.display = 'block';

        if (error.code === 'permission-denied') {
          loginError.innerHTML = `
            <strong>⚠️ Regras do Firestore bloquearam o acesso.</strong><br>
            Acesse <em>Firebase Console → Firestore Database → Rules</em> e atualize as permissões.<br>
            <small style="opacity:0.7">Código do erro: ${error.code}</small>
          `;
        } else if (error.code === 'not-found') {
          loginError.innerHTML = `
            <strong>⚠️ Documento de permissão não encontrado.</strong><br>
            Crie o documento <code>permissoes/admin</code> no Firestore com qualquer campo.<br>
            <small style="opacity:0.7">Código do erro: ${error.code}</small>
          `;
        } else {
          loginError.innerHTML = `
            <strong>Erro de conexão com o Firebase.</strong><br>
            Verifique sua internet e recarregue a página.<br>
            <small style="opacity:0.7">Código do erro: ${error.code || 'desconhecido'}</small>
          `;
        }
        // NÃO faz signOut — mantém o usuário logado para que possa tentar novamente
      });
  } else {
    loginSection.style.display = 'block';
    panelSection.style.display = 'none';
  }
});

// 2. Login com Google
if (btnLogin) {
  btnLogin.addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .catch((error) => {
        loginError.style.display = 'block';
        loginError.textContent = `Erro: ${error.message}`;
      });
  });
}

// 3. Logout
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    signOut(auth);
  });
}

// 4. Ouvir Categorias Dinâmicas do Firestore
function ouvirCategorias() {
  onSnapshot(collection(db, "categorias"), (snapshot) => {
    selectCategoria.innerHTML = '<option value="" disabled selected>Selecione uma Categoria...</option>';
    categoriasLocais = {};

    snapshot.forEach(docSnap => {
      const cat = docSnap.data();
      const key = docSnap.id;
      categoriasLocais[key] = cat.nome || cat.name || key;

      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = cat.nome || cat.name || key;
      selectCategoria.appendChild(opt);
    });
  });
}

// Adicionar nova categoria (Abre o modal)
if (btnAddCategoria) {
  btnAddCategoria.addEventListener('click', () => {
    modalAddCategoria.style.display = 'flex';
  });
}

if (btnCancelNewCat) {
  btnCancelNewCat.addEventListener('click', () => {
    modalAddCategoria.style.display = 'none';
    formNovaCategoria.reset();
  });
}

if (formNovaCategoria) {
  formNovaCategoria.addEventListener('submit', async (e) => {
    e.preventDefault();
    const idCat = document.getElementById('new-cat-id').value.trim();
    const nomeCat = document.getElementById('new-cat-nome').value.trim();
    const descCat = document.getElementById('new-cat-desc').value.trim();
    const iconeCat = document.getElementById('new-cat-icone').value.trim();
    const imgCat = document.getElementById('new-cat-imagem').value.trim();

    if (!idCat || !nomeCat) return;

    const cleanId = idCat.toLowerCase().replace(/\s+/g, '-').trim();

    try {
      await setDoc(doc(db, "categorias", cleanId), {
        nome: nomeCat,
        name: nomeCat,
        desc: descCat,
        icone: iconeCat || "⭐",
        imagem: imgCat || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=500&q=80"
      });
      modalAddCategoria.style.display = 'none';
      formNovaCategoria.reset();
      alert("Categoria cadastrada com sucesso!");
    } catch (err) {
      alert("Erro ao cadastrar categoria: " + err.message);
    }
  });
}

// Excluir Categoria Selecionada
if (btnDeleteCategoria) {
  btnDeleteCategoria.addEventListener('click', async () => {
    const catId = selectCategoria.value;
    if (!catId) {
      alert("Por favor, selecione uma categoria na lista para poder excluí-la.");
      return;
    }

    const catNome = categoriasLocais[catId] || catId;
    if (!confirm(`Tem certeza que deseja excluir a categoria "${catNome}"? Esta ação não pode ser desfeita e removerá a categoria do catálogo.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "categorias", catId));
      alert("Categoria excluída com sucesso!");
    } catch (err) {
      alert("Erro ao excluir categoria: " + err.message);
    }
  });
}

function resetFormProduto() {
  editProdId = null;
  formAdd.reset();
  resetDragZone();
  btnSubmitText.textContent = "Salvar Produto";
  document.getElementById('form-title').textContent = "Cadastrar Produto";
  document.getElementById('form-card').classList.remove('edit-mode-active');
  const btnCancelEdit = document.getElementById('btn-cancel-prod-edit');
  if (btnCancelEdit) btnCancelEdit.remove();
}

// 5. Ouvir produtos do Firestore (Realtime list)
let unsub = null;
function ouvirProdutos() {
  if (unsub) unsub();
  unsub = onSnapshot(collection(db, "produtos"), (snapshot) => {
    activeThumbnailIntervals.forEach(clearInterval);
    activeThumbnailIntervals = [];

    listContainer.innerHTML = '';
    let count = 0;
    snapshot.forEach((documentSnapshot) => {
      count++;
      const prod = documentSnapshot.data();
      const id = documentSnapshot.id;

      const item = document.createElement('div');
      item.className = 'admin-prod-item';

      const badgeDestaque = prod.destaque ? ' <span style="color: #f1c40f; font-size: 0.72rem; font-weight: 700; margin-left: 6px; display: inline-flex; align-items: center; gap: 3px;">⭐ destaque</span>' : '';
      const allImages = prod.imagens || (prod.imagem ? [prod.imagem] : ["https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=100&q=80"]);

      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
          <div class="admin-prod-thumb-container" style="width: 50px; height: 50px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(0,0,0,0.08); background: #eee; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
            <img class="admin-prod-thumb" src="${allImages[0]}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=100&q=80'">
          </div>
          <div class="admin-prod-info" style="flex: 1;">
            <h4 style="display: flex; align-items: center; margin: 0; font-size: 0.95rem;">${escapeHTML(prod.nome)}${badgeDestaque}</h4>
            <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Categoria: ${escapeHTML(categoriasLocais[prod.categoria] || prod.categoria)}</span>
          </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center; flex-shrink: 0;">
          <button class="btn-edit-prod" style="padding: 6px 12px; background: #e67e22; color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.85rem; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#d35400'" onmouseout="this.style.backgroundColor='#e67e22'">Editar</button>
          <button class="btn-delete-prod" data-id="${id}">Excluir</button>
        </div>
      `;

      // Rotaciona thumbnail se houver múltiplas imagens
      if (allImages.length > 1) {
        let currentImgIdx = 0;
        const intervalId = setInterval(() => {
          currentImgIdx = (currentImgIdx + 1) % allImages.length;
          const imgEl = item.querySelector('.admin-prod-thumb');
          if (imgEl) imgEl.src = allImages[currentImgIdx];
        }, 2000);
        activeThumbnailIntervals.push(intervalId);
      }

      item.querySelector('.btn-edit-prod').addEventListener('click', () => {
        editProdId = id;
        document.getElementById('prod-nome').value = prod.nome || '';
        document.getElementById('prod-desc').value = prod.desc || '';

        const selectEl = document.getElementById('prod-categoria');
        let catFound = false;
        for (let option of selectEl.options) {
          if (option.value === prod.categoria || option.text === prod.categoria) {
            selectEl.value = option.value;
            catFound = true;
            break;
          }
        }
        if (!catFound) selectEl.value = '';

        document.getElementById('prod-imagem').value = (prod.imagens ? prod.imagens.join(', ') : (prod.imagem || ''));
        document.getElementById('prod-icone').value = prod.icone || '';
        document.getElementById('prod-ml-link').value = prod.mlLink || '';
        document.getElementById('prod-destaque').checked = !!prod.destaque;

        btnSubmitText.textContent = "Salvar Alterações";
        document.getElementById('form-title').textContent = "Editar Produto: " + prod.nome;
        document.getElementById('form-card').classList.add('edit-mode-active');

        let btnCancelEdit = document.getElementById('btn-cancel-prod-edit');
        if (!btnCancelEdit) {
          btnCancelEdit = document.createElement('button');
          btnCancelEdit.type = 'button';
          btnCancelEdit.id = 'btn-cancel-prod-edit';
          btnCancelEdit.className = 'btn-admin-logout';
          btnCancelEdit.style.cssText = 'margin-top: 10px; border-color: #777; color: #777; width: 100%;';
          btnCancelEdit.textContent = "Cancelar Edição";
          btnCancelEdit.addEventListener('click', () => resetFormProduto());
          formAdd.appendChild(btnCancelEdit);
        }
        formAdd.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('prod-nome').focus();
      });

      item.querySelector('.btn-delete-prod').addEventListener('click', () => {
        if (confirm(`Deseja excluir "${prod.nome}" do catálogo?`)) {
          deleteDoc(doc(db, "produtos", id))
            .catch(err => alert(`Erro ao deletar: ${err.message}`));
        }
      });

      listContainer.appendChild(item);
    });
    countSpan.textContent = count;
  });
}

// Lógica de Drag & Drop da imagem
dragZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) handleFilesSelect(fileInput.files);
});

dragZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dragZone.classList.add('dragover');
});

dragZone.addEventListener('dragleave', () => {
  dragZone.classList.remove('dragover');
});

dragZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dragZone.classList.remove('dragover');
  if (e.dataTransfer.files.length > 0) handleFilesSelect(e.dataTransfer.files);
});

function handleFilesSelect(files) {
  selectedFiles = [];
  for (let i = 0; i < files.length; i++) {
    if (files[i].type.startsWith('image/')) selectedFiles.push(files[i]);
  }

  if (selectedFiles.length > 0) {
    dragIconContainer.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 48px; height: 48px; stroke: var(--primary);">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
    `;
    dragZoneText.textContent = `${selectedFiles.length} foto(s) selecionada(s): ` + selectedFiles.map(f => f.name).join(', ');
    dragZone.style.borderColor = 'var(--primary)';
  } else {
    resetDragZone();
  }
}

function resetDragZone() {
  selectedFiles = [];
  dragIconContainer.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="upload-icon">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  `;
  dragZoneText.textContent = "Solte as imagens aqui ou clique para selecionar";
  dragZone.style.borderColor = 'var(--accent)';
}

// 6. Cadastrar ou Editar produto
formAdd.addEventListener('submit', async (e) => {
  e.preventDefault();
  btnSubmitText.disabled = true;
  btnSubmitText.textContent = "Processando e Enviando...";

  try {
    const nome = document.getElementById('prod-nome').value;
    const desc = document.getElementById('prod-desc').value;
    const categoria = document.getElementById('prod-categoria').value;
    const imagemInputVal = document.getElementById('prod-imagem').value;
    const icone = document.getElementById('prod-icone').value;
    const mlLink = document.getElementById('prod-ml-link').value;
    const destaque = document.getElementById('prod-destaque').checked;

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

    let finalImageUrls = [];

    if (imagemInputVal.trim()) {
      finalImageUrls = imagemInputVal.split(',')
        .map(url => url.trim())
        .filter(url => url.length > 0)
        .map(url => converterLinkGoogleDrive(url));
    }

    if (selectedFiles.length > 0) {
      for (let file of selectedFiles) {
        const fileRef = ref(storage, `produtos-imagens/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(fileRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        finalImageUrls.push(downloadUrl);
      }
    }

    if (finalImageUrls.length === 0) {
      finalImageUrls.push("https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=500&q=80");
    }

    const dataPayload = {
      nome,
      desc,
      categoria,
      imagem: finalImageUrls[0],
      imagens: finalImageUrls,
      icone: icone || null,
      mlLink: mlLink || null,
      destaque: destaque
    };

    if (editProdId) {
      await updateDoc(doc(db, "produtos", editProdId), dataPayload);
      alert("Produto atualizado com sucesso!");
    } else {
      await addDoc(collection(db, "produtos"), {
        ...dataPayload,
        criadoEm: new Date()
      });
      alert("Produto cadastrado com sucesso!");
    }

    resetFormProduto();
  } catch (error) {
    console.error(error);
    alert(`Erro ao salvar produto: ${error.message}`);
  } finally {
    btnSubmitText.disabled = false;
    btnSubmitText.textContent = editProdId ? "Salvar Alterações" : "Salvar Produto";
  }
});

// 7. Ouvir avaliações do Firestore
let unsubAval = null;
function ouvirAvaliacoes() {
  if (unsubAval) unsubAval();
  unsubAval = onSnapshot(query(collection(db, "avaliacoes"), orderBy("criadoEm", "desc")), (snapshot) => {
    avalContainer.innerHTML = '';
    let count = 0;
    snapshot.forEach((docSnap) => {
      count++;
      const aval = docSnap.data();
      const id = docSnap.id;

      const item = document.createElement('div');
      item.className = 'admin-prod-item';
      item.innerHTML = `
        <div class="admin-prod-info" style="flex: 1;">
          <h4 style="display: flex; align-items: center; font-size: 0.95rem; margin-bottom: 2px;">
            ${escapeHTML(aval.nome || "Cliente Anônimo")}
            <span style="color: #f1c40f; font-size: 0.85rem; margin-left: 8px;">★ ${aval.nota || 5}</span>
          </h4>
          <p style="font-size: 0.85rem; color: #555; margin: 4px 0 0 0; line-height: 1.4;">
            ${aval.texto ? `"${escapeHTML(aval.texto)}"` : "Sem comentário."}
          </p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-edit-aval" style="background: #e8f4fd; color: #1976d2; border: 1px solid #d0e8fc; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.25s ease;">Editar</button>
          <button class="btn-delete-prod" style="background: #fff0f0; color: #c0392b; border: 1px solid #fde8e8; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.25s ease;">Excluir</button>
        </div>
      `;

      item.querySelector('.btn-delete-prod').addEventListener('click', () => {
        if (confirm(`Deseja excluir a avaliação de "${aval.nome || "Cliente Anônimo"}"?`)) {
          deleteDoc(doc(db, "avaliacoes", id))
            .catch(err => alert(`Erro ao deletar: ${err.message}`));
        }
      });

      item.querySelector('.btn-edit-aval').addEventListener('click', () => {
        editAvalId.value = id;
        editAvalNome.value = aval.nome || "";
        editAvalNota.value = aval.nota || "5";
        editAvalTexto.value = aval.texto || "";
        modalEditAval.style.display = 'flex';
      });

      avalContainer.appendChild(item);
    });
    avalCountSpan.textContent = count;
  });
}

// Salvar alteração da avaliação
formEditAval.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = editAvalId.value;
  const nome = editAvalNome.value;
  const nota = parseInt(editAvalNota.value, 10);
  const texto = editAvalTexto.value;

  try {
    await updateDoc(doc(db, "avaliacoes", id), { nome, nota, texto });
    modalEditAval.style.display = 'none';
    alert("Avaliação atualizada com sucesso!");
  } catch (err) {
    alert("Erro ao atualizar avaliação: " + err.message);
  }
});

btnCancelEditAval.addEventListener('click', () => {
  modalEditAval.style.display = 'none';
});
