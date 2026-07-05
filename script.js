/* =========================================================
   RAPIDCHAT — SISTEMA DE MENSAGENS PRONTAS
   Lógica: LocalStorage, CRUD, busca, categorias, favoritos,
   fixados, exportar/importar, atalhos, tema.
   ========================================================= */

/* ---------------------- CONSTANTES ---------------------- */
const STORAGE_KEYS = {
  MESSAGES: 'rapidchat_messages',
  CATEGORIES: 'rapidchat_categories',
  THEME: 'rapidchat_theme'
};

const DEFAULT_CATEGORIES = [
  'Atendimento', 'Financeiro', 'Suporte', 'Encerramento',
  'Instalação', 'Agendamento', 'Rede', 'Outros'
];

const CATEGORY_ICONS = {
  'Atendimento': 'fa-headset',
  'Financeiro': 'fa-coins',
  'Suporte': 'fa-screwdriver-wrench',
  'Encerramento': 'fa-flag-checkered',
  'Instalação': 'fa-tower-broadcast',
  'Agendamento': 'fa-calendar-days',
  'Rede': 'fa-wifi',
  'Outros': 'fa-layer-group'
};

const DEFAULT_MESSAGES = [
  { title: 'Atendimento Inicial', description: 'Mensagem de boas-vindas ao cliente', category: 'Atendimento',
    message: 'Boa noite, tudo certo? Meu nome é Kaio, sou do Suporte Técnico da Digital NET. Como posso ajudá-lo(a)?' },
  { title: 'Encerramento', description: 'Encerramento por inatividade', category: 'Encerramento',
    message: 'Devido à inatividade, este atendimento será encerrado. Caso ainda precise de suporte, basta enviar uma nova mensagem. Estaremos à disposição para atendê-lo(a). Agradecemos o contato e desejamos uma ótima noite!' },
  { title: 'Reiniciar Equipamento', description: 'Orientação para reiniciar o roteador', category: 'Suporte',
    message: 'Peço, por gentileza, que desligue o roteador da tomada, aguarde aproximadamente 30 segundos e ligue novamente. Após reiniciar, informe se o problema foi resolvido.' },
  { title: 'Aguarde Testes', description: 'Aviso de testes em andamento', category: 'Suporte',
    message: 'Estou realizando alguns testes em sua conexão. Peço, por gentileza, que aguarde alguns instantes.' },
  { title: 'Agendamento', description: 'Solicitação de visita técnica', category: 'Agendamento',
    message: 'Será necessário o envio de um técnico ao local. Estou registrando a solicitação para que nosso setor responsável realize o agendamento.' },
  { title: 'Sinal Normal', description: 'Conexão testada e normalizada', category: 'Rede',
    message: 'Realizei os testes e sua conexão encontra-se normal neste momento. Peço que verifique se o problema persiste.' },
  { title: 'Lentidão', description: 'Verificação de causa de lentidão', category: 'Rede',
    message: 'Estou realizando verificações para identificar a causa da lentidão. Peço alguns instantes.' },
  { title: 'Falta de Energia', description: 'Verificação de energia do equipamento', category: 'Suporte',
    message: 'Verifique, por gentileza, se o equipamento está ligado na tomada e se há energia elétrica normalmente no local.' },
  { title: 'Cliente sem Resposta', description: 'Aviso de encerramento por falta de retorno', category: 'Atendimento',
    message: 'Estou aguardando seu retorno. Caso não haja resposta, este atendimento poderá ser encerrado por inatividade.' },
  { title: 'Atendimento Encerrado', description: 'Confirmação de encerramento', category: 'Encerramento',
    message: 'O atendimento foi encerrado. Sempre que precisar, basta enviar uma nova mensagem. Estamos à disposição.' },
  { title: 'Financeiro', description: 'Encaminhamento ao setor financeiro', category: 'Financeiro',
    message: 'Seu atendimento será encaminhado ao setor financeiro. Eles irão auxiliá-lo(a) da melhor forma possível.' },
  { title: 'Mudança de Endereço', description: 'Registro de solicitação de mudança', category: 'Outros',
    message: 'Sua solicitação foi registrada. O setor responsável dará continuidade ao processo de mudança de endereço.' },
  { title: 'Liberação de Sinal', description: 'Atualização de conexão realizada', category: 'Rede',
    message: 'Realizei uma atualização em sua conexão. Peço que reinicie o roteador e teste novamente.' },
  { title: 'Atualização de Cadastro', description: 'Confirmação de dados cadastrais', category: 'Outros',
    message: 'Para prosseguirmos, preciso confirmar alguns dados cadastrais.' },
  { title: 'Problema Geral', description: 'Instabilidade geral na rede', category: 'Rede',
    message: 'Identificamos uma instabilidade em nossa rede que está afetando alguns clientes. Nossa equipe já trabalha para normalizar o serviço o mais rápido possível. Agradecemos sua compreensão.' },
  { title: 'Aguardando Técnico', description: 'Solicitação registrada, aguardando contato', category: 'Agendamento',
    message: 'Sua solicitação foi registrada. Em breve nossa equipe técnica entrará em contato.' },
  { title: 'Equipamento Sem Comunicação', description: 'Equipamento sem sinal com a central', category: 'Suporte',
    message: 'Seu equipamento está sem comunicação com nossa central. Será necessário realizar algumas verificações.' },
  { title: 'Cliente VPN', description: 'Verificação de conexão com VPN', category: 'Rede',
    message: 'Verificamos que sua conexão utiliza VPN. Será necessário analisar também o equipamento principal responsável pela distribuição da rede.' },
  { title: 'Atualização em Andamento', description: 'Instabilidade por atualização de sistema', category: 'Rede',
    message: 'Estamos realizando uma atualização em nossos sistemas. Alguns serviços poderão apresentar instabilidade temporária.' },
  { title: 'Atendimento Finalizado', description: 'Agradecimento final ao cliente', category: 'Encerramento',
    message: 'Agradecemos seu contato. Foi um prazer atendê-lo(a). Tenha uma excelente noite.' }
];

/* ---------------------- ESTADO ---------------------- */
let state = {
  messages: [],
  categories: [],
  activeCategory: 'Todas',
  searchTerm: '',
  editingId: null,
  deletingId: null
};

/* ---------------------- ELEMENTOS ---------------------- */
const el = {
  searchInput: document.getElementById('searchInput'),
  statTotal: document.getElementById('statTotal'),
  statMessages: document.getElementById('statMessages'),
  statFavorites: document.getElementById('statFavorites'),
  statCategories: document.getElementById('statCategories'),
  categoryList: document.getElementById('categoryList'),
  cardsGrid: document.getElementById('cardsGrid'),
  emptyState: document.getElementById('emptyState'),
  currentCategoryTitle: document.getElementById('currentCategoryTitle'),
  resultsCount: document.getElementById('resultsCount'),

  btnTheme: document.getElementById('btnTheme'),
  btnNewMessage: document.getElementById('btnNewMessage'),
  btnNewCategory: document.getElementById('btnNewCategory'),
  btnExport: document.getElementById('btnExport'),
  btnImport: document.getElementById('btnImport'),
  importFile: document.getElementById('importFile'),
  btnClearMessages: document.getElementById('btnClearMessages'),

  btnSidebarToggle: document.getElementById('btnSidebarToggle'),
  sidebar: document.getElementById('sidebar'),
  sidebarOverlay: document.getElementById('sidebarOverlay'),

  messageModalOverlay: document.getElementById('messageModalOverlay'),
  modalTitle: document.getElementById('modalTitle'),
  messageId: document.getElementById('messageId'),
  fieldTitle: document.getElementById('fieldTitle'),
  fieldDescription: document.getElementById('fieldDescription'),
  fieldCategory: document.getElementById('fieldCategory'),
  fieldMessage: document.getElementById('fieldMessage'),
  charCount: document.getElementById('charCount'),
  btnCloseModal: document.getElementById('btnCloseModal'),
  btnCancelModal: document.getElementById('btnCancelModal'),
  btnSaveMessage: document.getElementById('btnSaveMessage'),

  categoryModalOverlay: document.getElementById('categoryModalOverlay'),
  fieldNewCategory: document.getElementById('fieldNewCategory'),
  btnCloseCategoryModal: document.getElementById('btnCloseCategoryModal'),
  btnCancelCategory: document.getElementById('btnCancelCategory'),
  btnSaveCategory: document.getElementById('btnSaveCategory'),

  confirmModalOverlay: document.getElementById('confirmModalOverlay'),
  confirmText: document.getElementById('confirmText'),
  btnCloseConfirmModal: document.getElementById('btnCloseConfirmModal'),
  btnCancelConfirm: document.getElementById('btnCancelConfirm'),
  btnConfirmDelete: document.getElementById('btnConfirmDelete'),

  clearConfirmModalOverlay: document.getElementById('clearConfirmModalOverlay'),
  btnCloseClearConfirmModal: document.getElementById('btnCloseClearConfirmModal'),
  btnCancelClearConfirm: document.getElementById('btnCancelClearConfirm'),
  btnConfirmClear: document.getElementById('btnConfirmClear'),

  restoreModalOverlay: document.getElementById('restoreModalOverlay'),
  btnCloseRestoreModal: document.getElementById('btnCloseRestoreModal'),
  btnSelectRestoreFile: document.getElementById('btnSelectRestoreFile'),
  restoreImportFile: document.getElementById('restoreImportFile'),
  btnRestoreDefaults: document.getElementById('btnRestoreDefaults'),
  btnCancelRestore: document.getElementById('btnCancelRestore'),

  toastContainer: document.getElementById('toastContainer')
};

/* ---------------------- UTIL ---------------------- */
function uid(){
  return 'm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

function escapeHtml(str){
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(ts){
  if(!ts) return 'Nunca usada';
  const d = new Date(ts);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
}

/* ---------------------- PERSISTÊNCIA ---------------------- */
function loadState(){
  let messages = null;
  let categories = null;

  try{ messages = JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)); }catch(e){ messages = null; }
  try{ categories = JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES)); }catch(e){ categories = null; }

  if(!categories || !Array.isArray(categories) || categories.length === 0){
    categories = [...DEFAULT_CATEGORIES];
  }

  if(!messages || !Array.isArray(messages) || messages.length === 0){
    messages = DEFAULT_MESSAGES.map(m => ({
      id: uid(),
      title: m.title,
      description: m.description,
      message: m.message,
      category: m.category,
      favorite: false,
      pinned: false,
      usageCount: 0,
      lastUsed: null,
      createdAt: Date.now()
    }));
  }

  state.messages = messages;
  state.categories = categories;

  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  applyTheme(savedTheme, false);

  persist();
}

function persist(){
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(state.messages));
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(state.categories));
}

/* ---------------------- TEMA ---------------------- */
function applyTheme(theme, save = true){
  if(theme === 'light'){
    document.documentElement.setAttribute('data-theme', 'light');
    el.btnTheme.innerHTML = '<i class="fa-solid fa-moon"></i>';
  } else {
    document.documentElement.removeAttribute('data-theme');
    el.btnTheme.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }
  if(save) localStorage.setItem(STORAGE_KEYS.THEME, theme);
}

el.btnTheme.addEventListener('click', () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  applyTheme(isLight ? 'dark' : 'light');
});

/* ---------------------- TOAST ---------------------- */
function showToast(message, type = 'success'){
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.success}"></i><span>${escapeHtml(message)}</span>`;
  el.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ---------------------- RENDER: CATEGORIAS (SIDEBAR) ---------------------- */
function renderCategories(){
  const counts = {};
  state.messages.forEach(m => { counts[m.category] = (counts[m.category] || 0) + 1; });

  let html = `
    <li class="category-item ${state.activeCategory === 'Todas' ? 'active' : ''}" data-cat="Todas">
      <span class="cat-name"><i class="fa-solid fa-layer-group"></i> Todas</span>
      <span class="cat-count">${state.messages.length}</span>
    </li>
    <li class="category-item ${state.activeCategory === 'Favoritas' ? 'active' : ''}" data-cat="Favoritas">
      <span class="cat-name"><i class="fa-solid fa-star"></i> Favoritas</span>
      <span class="cat-count">${state.messages.filter(m => m.favorite).length}</span>
    </li>
  `;

  state.categories.forEach(cat => {
    const icon = CATEGORY_ICONS[cat] || 'fa-tag';
    html += `
      <li class="category-item ${state.activeCategory === cat ? 'active' : ''}" data-cat="${escapeHtml(cat)}">
        <span class="cat-name"><i class="fa-solid ${icon}"></i> ${escapeHtml(cat)}</span>
        <span class="cat-count">${counts[cat] || 0}</span>
      </li>
    `;
  });

  el.categoryList.innerHTML = html;

  el.categoryList.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', () => {
      state.activeCategory = item.dataset.cat;
      closeSidebarMobile();
      renderAll();
    });
  });
}

/* ---------------------- RENDER: SELECT DE CATEGORIA (MODAL) ---------------------- */
function renderCategoryOptions(selected){
  el.fieldCategory.innerHTML = state.categories
    .map(cat => `<option value="${escapeHtml(cat)}" ${cat === selected ? 'selected' : ''}>${escapeHtml(cat)}</option>`)
    .join('');
}

/* ---------------------- FILTRO + ORDENAÇÃO ---------------------- */
function getFilteredMessages(){
  let list = [...state.messages];

  if(state.activeCategory === 'Favoritas'){
    list = list.filter(m => m.favorite);
  } else if(state.activeCategory !== 'Todas'){
    list = list.filter(m => m.category === state.activeCategory);
  }

  const term = state.searchTerm.trim().toLowerCase();
  if(term){
    list = list.filter(m =>
      m.title.toLowerCase().includes(term) ||
      m.description.toLowerCase().includes(term) ||
      m.message.toLowerCase().includes(term)
    );
  }

  list.sort((a, b) => {
    if(a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if(a.favorite !== b.favorite) return a.favorite ? -1 : 1;
    return a.title.localeCompare(b.title, 'pt-BR');
  });

  return list;
}

/* ---------------------- RENDER: CARDS ---------------------- */
function renderCards(){
  const list = getFilteredMessages();

  el.currentCategoryTitle.textContent = state.activeCategory === 'Todas' ? 'Todas as mensagens' : state.activeCategory;
  el.resultsCount.textContent = `${list.length} mensagem${list.length === 1 ? '' : 's'} encontrada${list.length === 1 ? '' : 's'}`;

  if(list.length === 0){
    el.cardsGrid.innerHTML = '';
    el.emptyState.hidden = false;
    return;
  }
  el.emptyState.hidden = true;

  el.cardsGrid.innerHTML = list.map(cardTemplate).join('');
}

function cardTemplate(m){
  return `
    <div class="msg-card ${m.pinned ? 'is-pinned' : ''}" data-id="${m.id}">
      <div class="msg-card-top">
        <div class="msg-card-titles">
          <div class="msg-card-title" title="${escapeHtml(m.title)}">${escapeHtml(m.title)}</div>
          <div class="msg-card-desc">${escapeHtml(m.description || '')}</div>
        </div>
        <button class="star-btn ${m.favorite ? 'active' : ''}" data-action="favorite" title="Favoritar">
          <i class="fa-solid fa-star"></i>
        </button>
      </div>

      <span class="msg-card-category">${escapeHtml(m.category)}</span>

      <div class="msg-card-text">${escapeHtml(m.message)}</div>

      <div class="msg-card-meta">
        <span><i class="fa-regular fa-clock"></i> ${formatDate(m.lastUsed)}</span>
        <span>${m.usageCount || 0}x utilizada</span>
      </div>

      <div class="msg-card-actions">
        <button class="copy-btn" data-action="copy">
          <i class="fa-regular fa-copy"></i><span>Copiar</span>
        </button>
        <button class="mini-action ${m.pinned ? 'pinned' : ''}" data-action="pin" title="Fixar">
          <i class="fa-solid fa-thumbtack"></i>
        </button>
        <button class="mini-action" data-action="duplicate" title="Duplicar">
          <i class="fa-regular fa-clone"></i>
        </button>
        <button class="mini-action" data-action="share" title="Compartilhar">
          <i class="fa-solid fa-share-nodes"></i>
        </button>
        <button class="mini-action" data-action="edit" title="Editar">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="mini-action danger" data-action="delete" title="Excluir">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `;
}

/* ---------------------- RENDER: ESTATÍSTICAS ---------------------- */
function renderStats(){
  el.statTotal.textContent = state.messages.length;
  el.statMessages.textContent = state.messages.length;
  el.statFavorites.textContent = state.messages.filter(m => m.favorite).length;
  el.statCategories.textContent = state.categories.length;
}

function renderAll(){
  renderCategories();
  renderCards();
  renderStats();
}

/* ---------------------- AÇÕES DOS CARDS ---------------------- */
el.cardsGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if(!btn) return;
  const card = e.target.closest('.msg-card');
  const id = card.dataset.id;
  const action = btn.dataset.action;
  const msg = state.messages.find(m => m.id === id);
  if(!msg) return;

  switch(action){
    case 'copy': copyMessage(msg, btn); break;
    case 'favorite': toggleFavorite(msg); break;
    case 'pin': togglePin(msg); break;
    case 'duplicate': duplicateMessage(msg); break;
    case 'share': shareMessage(msg); break;
    case 'edit': openMessageModal(msg); break;
    case 'delete': openConfirmDelete(msg); break;
  }
});

function copyMessage(msg, btn){
  const finish = () => {
    msg.usageCount = (msg.usageCount || 0) + 1;
    msg.lastUsed = Date.now();
    persist();

    const original = btn.innerHTML;
    btn.classList.add('copied');
    btn.innerHTML = '<i class="fa-solid fa-check"></i><span>Copiado</span>';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = original;
      renderCards();
    }, 2000);

    showToast('Mensagem copiada com sucesso.', 'success');
  };

  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(msg.message).then(finish).catch(() => fallbackCopy(msg.message, finish));
  } else {
    fallbackCopy(msg.message, finish);
  }
}

function fallbackCopy(text, cb){
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try{ document.execCommand('copy'); }catch(e){ /* ignore */ }
  document.body.removeChild(ta);
  cb();
}

function toggleFavorite(msg){
  msg.favorite = !msg.favorite;
  persist();
  renderAll();
}

function togglePin(msg){
  msg.pinned = !msg.pinned;
  persist();
  renderAll();
  showToast(msg.pinned ? 'Mensagem fixada.' : 'Mensagem desafixada.', 'info');
}

function duplicateMessage(msg){
  const copy = {
    ...msg,
    id: uid(),
    title: msg.title + ' (cópia)',
    favorite: false,
    pinned: false,
    usageCount: 0,
    lastUsed: null,
    createdAt: Date.now()
  };
  state.messages.push(copy);
  persist();
  renderAll();
  showToast('Mensagem duplicada.', 'success');
}

function shareMessage(msg){
  copyMessage(msg, { classList: { add(){}, remove(){} }, innerHTML: '' });
  showToast('Texto copiado para compartilhar.', 'info');
}

/* ---------------------- MODAL: NOVA / EDITAR MENSAGEM ---------------------- */
function openMessageModal(msg = null){
  state.editingId = msg ? msg.id : null;
  el.modalTitle.innerHTML = msg
    ? '<i class="fa-solid fa-pen"></i> Editar Mensagem'
    : '<i class="fa-solid fa-plus"></i> Nova Mensagem';

  el.fieldTitle.value = msg ? msg.title : '';
  el.fieldDescription.value = msg ? msg.description : '';
  el.fieldMessage.value = msg ? msg.message : '';
  el.charCount.textContent = el.fieldMessage.value.length;

  renderCategoryOptions(msg ? msg.category : state.categories[0]);

  el.messageModalOverlay.classList.add('open');
  setTimeout(() => el.fieldTitle.focus(), 100);
}

function closeMessageModal(){
  el.messageModalOverlay.classList.remove('open');
  state.editingId = null;
}

el.fieldMessage.addEventListener('input', () => {
  el.charCount.textContent = el.fieldMessage.value.length;
});

el.btnNewMessage.addEventListener('click', () => openMessageModal());
el.btnCloseModal.addEventListener('click', closeMessageModal);
el.btnCancelModal.addEventListener('click', closeMessageModal);
el.messageModalOverlay.addEventListener('click', (e) => {
  if(e.target === el.messageModalOverlay) closeMessageModal();
});

el.btnSaveMessage.addEventListener('click', () => {
  const title = el.fieldTitle.value.trim();
  const description = el.fieldDescription.value.trim();
  const category = el.fieldCategory.value;
  const message = el.fieldMessage.value.trim();

  if(!title || !message){
    showToast('Preencha ao menos o título e a mensagem.', 'error');
    return;
  }

  if(state.editingId){
    const msg = state.messages.find(m => m.id === state.editingId);
    if(msg){
      msg.title = title;
      msg.description = description;
      msg.category = category;
      msg.message = message;
    }
    showToast('Mensagem atualizada com sucesso.', 'success');
  } else {
    state.messages.push({
      id: uid(),
      title, description, category, message,
      favorite: false, pinned: false,
      usageCount: 0, lastUsed: null,
      createdAt: Date.now()
    });
    showToast('Mensagem cadastrada com sucesso.', 'success');
  }

  persist();
  renderAll();
  closeMessageModal();
});

/* ---------------------- MODAL: CONFIRMAR EXCLUSÃO ---------------------- */
function openConfirmDelete(msg){
  state.deletingId = msg.id;
  el.confirmText.textContent = `Deseja realmente excluir "${msg.title}"? Essa ação não pode ser desfeita.`;
  el.confirmModalOverlay.classList.add('open');
}

function closeConfirmModal(){
  el.confirmModalOverlay.classList.remove('open');
  state.deletingId = null;
}

el.btnCloseConfirmModal.addEventListener('click', closeConfirmModal);
el.btnCancelConfirm.addEventListener('click', closeConfirmModal);
el.confirmModalOverlay.addEventListener('click', (e) => {
  if(e.target === el.confirmModalOverlay) closeConfirmModal();
});

el.btnConfirmDelete.addEventListener('click', () => {
  state.messages = state.messages.filter(m => m.id !== state.deletingId);
  persist();
  renderAll();
  closeConfirmModal();
  showToast('Mensagem excluída.', 'success');
});

/* ---------------------- MODAL: NOVA CATEGORIA ---------------------- */
function openCategoryModal(){
  el.fieldNewCategory.value = '';
  el.categoryModalOverlay.classList.add('open');
  setTimeout(() => el.fieldNewCategory.focus(), 100);
}
function closeCategoryModal(){
  el.categoryModalOverlay.classList.remove('open');
}

el.btnNewCategory.addEventListener('click', openCategoryModal);
el.btnCloseCategoryModal.addEventListener('click', closeCategoryModal);
el.btnCancelCategory.addEventListener('click', closeCategoryModal);
el.categoryModalOverlay.addEventListener('click', (e) => {
  if(e.target === el.categoryModalOverlay) closeCategoryModal();
});

el.btnSaveCategory.addEventListener('click', () => {
  const name = el.fieldNewCategory.value.trim();
  if(!name){
    showToast('Digite um nome para a categoria.', 'error');
    return;
  }
  if(state.categories.some(c => c.toLowerCase() === name.toLowerCase())){
    showToast('Essa categoria já existe.', 'error');
    return;
  }
  state.categories.push(name);
  persist();
  renderAll();
  closeCategoryModal();
  showToast('Categoria criada com sucesso.', 'success');
});

/* ---------------------- BUSCA ---------------------- */
el.searchInput.addEventListener('input', () => {
  state.searchTerm = el.searchInput.value;
  renderCards();
});

/* ---------------------- EXPORTAR / IMPORTAR ---------------------- */
el.btnExport.addEventListener('click', () => {
  const payload = {
    messages: state.messages,
    categories: state.categories,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rapidchat-mensagens-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Mensagens exportadas com sucesso.', 'success');
});

el.btnImport.addEventListener('click', () => el.importFile.click());

el.importFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    try{
      const data = JSON.parse(evt.target.result);
      const importedMessages = Array.isArray(data.messages) ? data.messages : (Array.isArray(data) ? data : []);
      const importedCategories = Array.isArray(data.categories) ? data.categories : [];

      let count = 0;
      importedMessages.forEach(m => {
        if(!m.title || !m.message) return;
        state.messages.push({
          id: uid(),
          title: m.title,
          description: m.description || '',
          category: m.category || 'Outros',
          message: m.message,
          favorite: !!m.favorite,
          pinned: !!m.pinned,
          usageCount: m.usageCount || 0,
          lastUsed: m.lastUsed || null,
          createdAt: Date.now()
        });
        count++;
      });

      importedCategories.forEach(cat => {
        if(cat && !state.categories.some(c => c.toLowerCase() === String(cat).toLowerCase())){
          state.categories.push(cat);
        }
      });

      persist();
      renderAll();
      showToast(`${count} mensagem(ns) importada(s) com sucesso.`, 'success');
    }catch(err){
      showToast('Arquivo inválido. Verifique o formato JSON.', 'error');
    }
    el.importFile.value = '';
  };
  reader.readAsText(file);
});

/* ---------------------- LIMPAR MENSAGENS + RESTAURAR ---------------------- */
function openClearConfirmModal(){
  el.clearConfirmModalOverlay.classList.add('open');
}
function closeClearConfirmModal(){
  el.clearConfirmModalOverlay.classList.remove('open');
}
function openRestoreModal(){
  el.restoreModalOverlay.classList.add('open');
}
function closeRestoreModal(){
  el.restoreModalOverlay.classList.remove('open');
}

el.btnClearMessages.addEventListener('click', openClearConfirmModal);
el.btnCloseClearConfirmModal.addEventListener('click', closeClearConfirmModal);
el.btnCancelClearConfirm.addEventListener('click', closeClearConfirmModal);
el.clearConfirmModalOverlay.addEventListener('click', (e) => {
  if(e.target === el.clearConfirmModalOverlay) closeClearConfirmModal();
});

el.btnConfirmClear.addEventListener('click', () => {
  state.messages = [];
  state.categories = [];
  state.activeCategory = 'Todas';
  state.searchTerm = '';
  el.searchInput.value = '';
  persist();
  renderAll();
  closeClearConfirmModal();
  showToast('Todas as mensagens foram apagadas.', 'success');
  openRestoreModal();
});

el.btnCloseRestoreModal.addEventListener('click', closeRestoreModal);
el.btnCancelRestore.addEventListener('click', closeRestoreModal);
el.restoreModalOverlay.addEventListener('click', (e) => {
  if(e.target === el.restoreModalOverlay) closeRestoreModal();
});

el.btnSelectRestoreFile.addEventListener('click', () => el.restoreImportFile.click());

el.btnRestoreDefaults.addEventListener('click', () => {
  state.categories = [...DEFAULT_CATEGORIES];
  state.messages = DEFAULT_MESSAGES.map(m => ({
    id: uid(),
    title: m.title,
    description: m.description,
    message: m.message,
    category: m.category,
    favorite: false,
    pinned: false,
    usageCount: 0,
    lastUsed: null,
    createdAt: Date.now()
  }));
  persist();
  renderAll();
  closeRestoreModal();
  showToast('Mensagens padrão restauradas com sucesso.', 'success');
});

el.restoreImportFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    try{
      const data = JSON.parse(evt.target.result);
      const importedMessages = Array.isArray(data.messages) ? data.messages : (Array.isArray(data) ? data : []);
      const importedCategories = Array.isArray(data.categories) ? data.categories : [];

      const newMessages = [];
      importedMessages.forEach(m => {
        if(!m.title || !m.message) return;
        newMessages.push({
          id: uid(),
          title: m.title,
          description: m.description || '',
          category: m.category || 'Outros',
          message: m.message,
          favorite: !!m.favorite,
          pinned: !!m.pinned,
          usageCount: m.usageCount || 0,
          lastUsed: m.lastUsed || null,
          createdAt: Date.now()
        });
      });

      if(newMessages.length === 0){
        showToast('Nenhuma mensagem válida encontrada no arquivo.', 'error');
        el.restoreImportFile.value = '';
        return;
      }

      const newCategories = importedCategories.length > 0
        ? [...new Set(importedCategories)]
        : [...new Set(newMessages.map(m => m.category))];

      state.messages = newMessages;
      state.categories = newCategories.length > 0 ? newCategories : [...DEFAULT_CATEGORIES];

      persist();
      renderAll();
      closeRestoreModal();
      showToast(`Sistema restaurado com ${newMessages.length} mensagem(ns).`, 'success');
    }catch(err){
      showToast('Arquivo inválido. Verifique o formato JSON.', 'error');
    }
    el.restoreImportFile.value = '';
  };
  reader.readAsText(file);
});

/* ---------------------- SIDEBAR MOBILE ---------------------- */
function openSidebarMobile(){
  el.sidebar.classList.add('open');
  el.sidebarOverlay.classList.add('open');
}
function closeSidebarMobile(){
  el.sidebar.classList.remove('open');
  el.sidebarOverlay.classList.remove('open');
}
el.btnSidebarToggle.addEventListener('click', openSidebarMobile);
el.sidebarOverlay.addEventListener('click', closeSidebarMobile);

/* ---------------------- ATALHOS DE TECLADO ---------------------- */
document.addEventListener('keydown', (e) => {
  const anyModalOpen = document.querySelector('.modal-overlay.open');

  if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f'){
    e.preventDefault();
    el.searchInput.focus();
    el.searchInput.select();
    return;
  }

  if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n'){
    e.preventDefault();
    if(!anyModalOpen) openMessageModal();
    return;
  }

  if(e.key === 'Escape'){
    closeMessageModal();
    closeConfirmModal();
    closeCategoryModal();
    closeClearConfirmModal();
    closeRestoreModal();
    closeSidebarMobile();
  }
});

/* ---------------------- INICIALIZAÇÃO ---------------------- */
loadState();
renderAll();