async function getTabs() {
  const { persistentTabs = [] } = await chrome.storage.local.get('persistentTabs');
  return persistentTabs;
}

async function saveTabs(tabs) {
  await chrome.storage.local.set({ persistentTabs: tabs });
}

async function getAutoInject() {
  const { autoInject = true } = await chrome.storage.local.get('autoInject');
  return autoInject;
}

async function setAutoInject(value) {
  await chrome.storage.local.set({ autoInject: value });
}

async function renderToggle() {
  const enabled = await getAutoInject();
  document.getElementById('auto-inject-toggle').checked = enabled;
}

async function renderList() {
  const tabs = await getTabs();
  const list = document.getElementById('tab-list');
  list.innerHTML = '';

  if (tabs.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'まだ登録されていません';
    list.appendChild(empty);
    return;
  }

  tabs.forEach((url, idx) => {
    const row = document.createElement('div');
    row.className = 'tab-row';

    const urlSpan = document.createElement('span');
    urlSpan.className = 'tab-url';
    urlSpan.textContent = url;
    urlSpan.title = url;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '削除';
    removeBtn.addEventListener('click', async () => {
      const current = await getTabs();
      const newTabs = current.filter((_, i) => i !== idx);
      await saveTabs(newTabs);
      renderList();
    });

    row.appendChild(urlSpan);
    row.appendChild(removeBtn);
    list.appendChild(row);
  });
}

async function renderAll() {
  await renderToggle();
  await renderList();
}

document.getElementById('auto-inject-toggle').addEventListener('change', async (e) => {
  await setAutoInject(e.target.checked);
});

document.getElementById('add-current-btn').addEventListener('click', async () => {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab?.url) return;
  if (activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('chrome-extension://')) {
    alert('Chrome 内部ページは追加できません');
    return;
  }
  const tabs = await getTabs();
  if (!tabs.includes(activeTab.url)) {
    tabs.push(activeTab.url);
    await saveTabs(tabs);
    renderList();
  }
});

document.getElementById('add-url-btn').addEventListener('click', async () => {
  const input = document.getElementById('url-input');
  const url = input.value.trim();
  if (!url) return;
  const tabs = await getTabs();
  if (!tabs.includes(url)) {
    tabs.push(url);
    await saveTabs(tabs);
    input.value = '';
    renderList();
  }
});

renderAll();
