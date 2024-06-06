document.addEventListener('DOMContentLoaded', () => {
  const bannerTexts = [
    "Anı eklemek istiyorsan Başlık, Bilgi ve İçeriği doldurman gerekir.",
    "Bu Anı Defteri Tubiş ile Neboş'un yaşadığı bütün olaylar ve anıları saklamak için yapılmıştır.",
    "Anılara saygımız olduğundan dolayı lütfen küfür yazmayınız.",
    "Buraya sadece Tuba ve Nebi girebilir.",
    "Tubişim çoook özür dilerim...",
    "Seni seviyorum canım karım ❤️"
  ];
  let bannerIndex = 0;
  const bannerElement = document.getElementById('banner-text');

  function updateBanner() {
    bannerElement.textContent = bannerTexts[bannerIndex];
    bannerIndex = (bannerIndex + 1) % bannerTexts.length;
  }

  setInterval(updateBanner, 10000);
  updateBanner();

  const memoryForm = document.getElementById('memoryForm');
  const memoriesContainer = document.getElementById('memories');
  const GITHUB_TOKEN = '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';
  const REPO_OWNER = 'uroxx';
  const REPO_NAME = 'uroxx.github.io';
  const FILE_PATH = 'notes.txt';

  memoryForm.addEventListener('submit', event => {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const content = document.getElementById('content').value;

    saveMemory(title, description, content);
    addMemory(title, description, content);
    memoryForm.reset();
  });

  async function saveMemory(title, description, content) {
    const memory = `${title}\n${description}\n${content}\n---\n`;
    let currentContent = await fetchContent();

    currentContent += memory;

    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Yeni anı eklendi',
        content: btoa(unescape(encodeURIComponent(currentContent))),
        sha: await fetchSha()
      })
    });

    if (!response.ok) {
      console.error('Anı kaydedilemedi:', response.statusText);
    }
  }

  async function fetchContent() {
    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return decodeURIComponent(escape(atob(data.content)));
    } else if (response.status === 404) {
      return '';
    } else {
      console.error('Dosya içeriği alınamadı:', response.statusText);
      return '';
    }
  }

  async function fetchSha() {
    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.sha;
    } else {
      return '';
    }
  }

  async function loadMemories() {
    const content = await fetchContent();
    const memories = content.split('---\n').filter(memory => memory.trim() !== '');
    
    memories.forEach(memory => {
      const [title, description, ...contentArr] = memory.split('\n');
      const content = contentArr.join('\n');
      addMemory(title, description, content);
    });
  }

  function addMemory(title, description, content) {
    const memory = document.createElement('div');
    memory.classList.add('memory');
    memory.innerHTML = `
      <h2>${title}</h2>
      <p>${description}</p>
      <div class="menu">⋮
        <div class="menu-content">
          <button onclick="editMemory('${title}')">Düzenle</button>
          <button onclick="deleteMemory('${title}', '${title}')">Sil</button>
        </div>
      </div>
    `;
    memory.addEventListener('click', (e) => {
      if (!e.target.matches('.menu, .menu *')) {
        window.open(`read.html?title=${title}`, '_blank');
      }
    });
    memory.querySelector('.menu').addEventListener('click', (e) => {
      e.stopPropagation();
      const menuContent = memory.querySelector('.menu-content');
      menuContent.style.display = menuContent.style.display === 'block' ? 'none' : 'block';
    });
    memoriesContainer.appendChild(memory);
  }

  loadMemories();
});
