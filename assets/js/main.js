/* ======= Data model (localStorage) ======= */
const STORAGE_KEY = 'todo_app_v2';
let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  lists: {}, // começa vazio
  current: null, // nenhuma lista selecionada
  theme: 'default'
};

/* ======= Elements ======= */
const content = document.getElementById('content');
const fabBtn = document.getElementById('fabBtn');
const sheet = document.getElementById('sheet');
const backdrop = document.getElementById('backdrop');
const newTaskText = document.getElementById('newTaskText');
const newTaskList = document.getElementById('newTaskList');
const saveTask = document.getElementById('saveTask');

const listsBtn = document.getElementById('listsBtn');
const leftDrawer = document.getElementById('leftDrawer');
const listsArea = document.getElementById('listsArea');
const newListName = document.getElementById('newListName');
const createListBtn = document.getElementById('createListBtn');

const settingsBtn = document.getElementById('settingsBtn');
const rightDrawer = document.getElementById('rightDrawer');

const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

const resetBtn = document.getElementById('resetBtn');
const themeDefault = document.getElementById('themeDefault');
const themeAlt = document.getElementById('themeAlt');

/* ======= Helpers ======= */
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function openSheet() {
  sheet.classList.add('active');
  backdrop.classList.add('active');
  newTaskText.focus();
  populateListOptions();
}

function closeSheet() {
  sheet.classList.remove('active');
  backdrop.classList.remove('active');
  newTaskText.value = '';
}

function openLeftDrawer() { leftDrawer.classList.add('active'); backdrop.classList.add('active'); }
function closeLeftDrawer() { leftDrawer.classList.remove('active'); backdrop.classList.remove('active'); }
function openRightDrawer() { rightDrawer.classList.add('active'); backdrop.classList.add('active'); }
function closeRightDrawer() { rightDrawer.classList.remove('active'); backdrop.classList.remove('active'); }

function toggleLeft() { leftDrawer.classList.contains('active') ? closeLeftDrawer() : openLeftDrawer(); }
function toggleRight() { rightDrawer.classList.contains('active') ? closeRightDrawer() : openRightDrawer(); }

backdrop.addEventListener('click', () => {
  closeSheet(); closeLeftDrawer(); closeRightDrawer();
});

/* ======= Render UI ======= */
function populateListOptions() {
  newTaskList.innerHTML = '';
  Object.keys(state.lists).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    if (name === state.current) opt.selected = true;
    newTaskList.appendChild(opt);
  });
}

function renderListsPanel() {
  listsArea.innerHTML = '';
  Object.keys(state.lists).forEach(name => {
    const el = document.createElement('div');
    el.className = 'list-item';
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px">
        <strong>${name}</strong>
        <div class="muted" style="font-size:12px">(${state.lists[name].length})</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="icon-btn" title="Selecionar" data-list="${name}"><i class="fa-solid fa-arrow-up-right-from-square"></i></button>
        <button class="icon-btn" title="Remover" data-remove="${name}"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    listsArea.appendChild(el);
  });

  // bind
  listsArea.querySelectorAll('[data-list]').forEach(b => {
    b.onclick = e => {
      const name = e.currentTarget.dataset.list;
      state.current = name; save(); render();
      closeLeftDrawer();
    };
  });
  listsArea.querySelectorAll('[data-remove]').forEach(b => {
    b.onclick = e => {
      const name = e.currentTarget.dataset.remove;
      if (confirm(`Remover lista "${name}"? Todas as tarefas serão removidas.`)) {
        delete state.lists[name];
        const keys = Object.keys(state.lists);
        state.current = keys.length ? keys[0] : null;
        save(); render();
      }
    };
  });
}

function renderTasks() {
  content.innerHTML = '';
  if (!state.current) {
    content.innerHTML = '<div class="center muted">Nenhuma lista disponível. <br/> Para criar uma lista clique no menu <i style="color:#524780; margin-left: 10px" class="fa-solid fa-list"></i></div>';
    return;
  }
  const tasks = state.lists[state.current] || [];
  const header = document.createElement('div');
  header.style.marginBottom = '10px';
  header.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-weight:700;font-size:17px">${state.current}</div>
        <div class="muted" style="font-size:13px">${tasks.length} tarefas</div>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="icon-btn" id="shareListBtn" title="Compartilhar lista"><i class="fa-solid fa-share-nodes"></i></button>
        <button class="icon-btn" id="renameListBtn" title="Renomear lista"><i class="fa-solid fa-pen"></i></button>
      </div>
    </div>
  `;
  content.appendChild(header);

  if (tasks.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'center muted';
    empty.style.marginTop = '18px';
    empty.textContent = 'Nenhuma tarefa. Toque em + para adicionar.';
    content.appendChild(empty);
  }

  tasks.forEach((task, idx) => {
    const card = document.createElement('div');
    card.className = 'task' + (task.completed ? ' completed' : '');
    card.innerHTML = `
      <div class="left">
        <button class="icon-btn toggle" title="Marcar como feito"><i class="${task.completed ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'}"></i></button>
        <span title="${task.text}">${task.text}</span>
      </div>
      <div class="actions">
        <button class="icon-btn edit" title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
        <button class="icon-btn delete" title="Excluir"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;

    card.addEventListener('click', e => {
      if (e.target.closest('.icon-btn')) return;
      card.classList.toggle('expanded');
    });

    card.querySelector('.toggle').onclick = e => {
      e.stopPropagation();
      task.completed = !task.completed;
      save(); renderTasks();
    };

    card.querySelector('.edit').onclick = e => {
      e.stopPropagation();
      const newText = prompt('Editar tarefa:', task.text);
      if (newText !== null) {
        const t = newText.trim();
        if (t.length) {
          task.text = t; save(); renderTasks();
        }
      }
    };

    card.querySelector('.delete').onclick = e => {
      e.stopPropagation();
      if (confirm('Excluir esta tarefa?')) {
        state.lists[state.current].splice(idx, 1);
        save(); renderTasks();
      }
    };

    content.appendChild(card);
  });

  const renameBtn = document.getElementById('renameListBtn');
  if (renameBtn) {
    renameBtn.onclick = () => {
      const name = prompt('Novo nome para a lista:', state.current);
      if (name) {
        const trimmed = name.trim();
        if (trimmed && !state.lists[trimmed]) {
          state.lists[trimmed] = state.lists[state.current];
          delete state.lists[state.current];
          state.current = trimmed;
          save(); render();
        } else if (state.lists[trimmed]) {
          alert('Já existe uma lista com esse nome.');
        }
      }
    };
  }

  const shareBtn = document.getElementById('shareListBtn');
  if (shareBtn) {
    shareBtn.onclick = () => {
      const listName = state.current;
      const tasks = state.lists[listName] || [];
      if (tasks.length === 0) {
        alert('Essa lista está vazia.');
        return;
      }
      let message = `📝 *${listName}*\n\n`;
      tasks.forEach(t => {
        message += `• ${t.text}\n`;
      });
      if (navigator.share) {
        navigator.share({
          title: `Lista: ${listName}`,
          text: message
        }).catch(err => console.log('Compartilhamento cancelado:', err));
      } else {
        const encoded = encodeURIComponent(message);
        const waUrl = `https://wa.me/?text=${encoded}`;
        window.open(waUrl, '_blank');
      }
    };
  }
}

function render() {
  populateListOptions();
  renderListsPanel();
  renderTasks();
  applyTheme();
}

/* ======= Actions ======= */
fabBtn.addEventListener('click', openSheet);
saveTask.addEventListener('click', () => {
  const text = newTaskText.value.trim();
  const list = newTaskList.value;
  if (!text) { alert('Digite a tarefa'); return; }
  state.lists[list].push({ text, completed: false });
  save(); closeSheet(); render();
});

newTaskText.addEventListener('keypress', e => {
  if (e.key === 'Enter') saveTask.click();
});

listsBtn.addEventListener('click', () => {
  if (rightDrawer.classList.contains('active')) closeRightDrawer();
  toggleLeft();
});

settingsBtn.addEventListener('click', () => {
  if (leftDrawer.classList.contains('active')) closeLeftDrawer();
  toggleRight();
});

createListBtn.addEventListener('click', () => {
  const name = newListName.value.trim();
  if (!name) return;
  if (state.lists[name]) { alert('Já existe uma lista com esse nome.'); return; }
  state.lists[name] = [];
  state.current = name;
  newListName.value = '';
  save(); render(); closeLeftDrawer();
});

/* ======= Backup & Import ======= */
exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'todo-export.json';
  a.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => { importFile.click(); });
importFile.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = event => {
    try {
      const importedData = JSON.parse(event.target.result);
      if (!importedData.lists || typeof importedData.lists !== 'object') {
        alert('Arquivo inválido.'); return;
      }
      let newLists = 0, newTasks = 0;
      for (const [listName, importedTasks] of Object.entries(importedData.lists)) {
        if (!state.lists[listName]) {
          state.lists[listName] = importedTasks;
          newLists++; newTasks += importedTasks.length;
        } else {
          const existingTasks = state.lists[listName];
          importedTasks.forEach(task => {
            const exists = existingTasks.some(t => t.text === task.text);
            if (!exists) { existingTasks.push(task); newTasks++; }
          });
        }
      }
      if (importedData.theme) state.theme = importedData.theme;
      if (importedData.current && state.lists[importedData.current]) {
        state.current = importedData.current;
      }
      save(); render();
      alert(`Backup importado com sucesso!\n${newLists} listas novas\n${newTasks} tarefas novas.`);
    } catch (err) {
      alert('Erro ao importar o arquivo.');
      console.error(err);
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

/* ======= Reset ======= */
resetBtn.addEventListener('click', () => {
  if (confirm('Resetar dados?')) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
});

/* ======= Tema ======= */
themeDefault.addEventListener('click', () => { state.theme = 'default'; save(); applyTheme(); });
themeAlt.addEventListener('click', () => { state.theme = 'dark'; save(); applyTheme(); });

function applyTheme() {
  if (state.theme === 'dark') {
    document.documentElement.style.setProperty('--neutral', '#0f1720');
    document.documentElement.style.setProperty('--text', '#f4f4f4');
    document.body.style.background = 'linear-gradient(180deg,#071227 0%, #071a2b 100%)';
  } else {
    document.documentElement.style.setProperty('--neutral', '#f4f4f4');
    document.documentElement.style.setProperty('--text', '#1a1a1a');
    document.body.style.background = 'linear-gradient(180deg,#fbfdff 0%, var(--neutral) 100%)';
  }
}

/* ======= Gestos ======= */
let touchStartX = 0, touchEndX = 0, touchStartY = 0, touchEndY = 0;
document.addEventListener('touchstart', e => {
  const t = e.changedTouches[0]; touchStartX = t.pageX; touchStartY = t.pageY;
});
document.addEventListener('touchmove', e => {
  const t = e.changedTouches[0]; touchEndX = t.pageX; touchEndY = t.pageY;
});
document.addEventListener('touchend', () => {
  const deltaX = touchEndX - touchStartX;
  const deltaY = Math.abs(touchEndY - touchStartY);
  if (Math.abs(deltaX) < 50 || deltaY > 80) return;
  if (deltaX > 50 && rightDrawer.classList.contains('active')) closeRightDrawer();
  if (deltaX < -50 && leftDrawer.classList.contains('active')) closeLeftDrawer();
});

/* ======= Init ======= */
window.onload = () => { render(); };
window.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeSheet(); closeLeftDrawer(); closeRightDrawer(); }
});
backdrop.addEventListener('touchmove', e => e.preventDefault(), { passive: false });



if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('Service Worker registrado:', reg))
      .catch(err => console.error('Erro ao registrar Service Worker:', err));
  });
}


let deferredPrompt;
const installBtn = document.getElementById('installBtn');

// Detecta o evento antes da instalação
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'block'; // mostra o botão quando pode instalar
});

// Detecta quando o app foi instalado
window.addEventListener('appinstalled', () => {
  console.log('✅ App instalado com sucesso!');
  alert('Aplicativo instalado com sucesso!');
  installBtn.style.display = 'none'; // oculta o botão após instalação
  deferredPrompt = null;
});

// Esconde o botão se já estiver rodando em modo PWA
const isInStandaloneMode =
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

if (isInStandaloneMode) {
  installBtn.style.display = 'none';
}

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      //const confirmar = confirm("📲 Deseja instalar o aplicativo 'Minhas Tarefas'?");
     // if (!confirmar) return;

      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('Usuário aceitou a instalação');
        installBtn.style.display = 'none';
      } else {
        console.log('Usuário cancelou a instalação');
      }

      deferredPrompt = null;
    } else {
      alert('⚠️ O app já pode estar instalado ou o navegador não suporta instalação PWA.');
    }
  });
}





