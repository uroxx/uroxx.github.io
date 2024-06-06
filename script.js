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

  memoryForm.addEventListener('submit', event => {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const content = document.getElementById('content').value;

    saveMemory(title, description, content);
    addMemory(title, description, content);
    memoryForm.reset();
  });

  function addMemory(title, description, content) {
    const memory = document.createElement('div');
    memory.classList.add('memory');
    memory.innerHTML = `
      <h2>${title}</h2>
      <p>${description}</p>
      <div class="menu">⋮
        <div class="menu-content">
          <button onclick="editMemory('${title}')">Düzenle</button>
          <button onclick="deleteMemory('${title}')">Sil</button>
        </div>
      </div>
    `;
    memory.addEventListener('click', (e) => {
      if (!e.target.matches('.menu, .menu *')) {
        window.open(`read.html?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&content=${encodeURIComponent(content)}`, '_blank');
      }
    });
    memory.querySelector('.menu').addEventListener('click', (e) => {
      e.stopPropagation();
      const menuContent = memory.querySelector('.menu-content');
      menuContent.style.display = menuContent.style.display === 'block' ? 'none' : 'block';
    });
    memoriesContainer.appendChild(memory);
  }

  window.editMemory = (title) => {
    const description = decodeURIComponent(new URLSearchParams(window.location.search).get('description'));
    const content = decodeURIComponent(new URLSearchParams(window.location.search).get('content'));
    window.open(`edit.html?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&content=${encodeURIComponent(content)}`, '_blank');
  };

  window.deleteMemory = (title) => {
    if (confirm(`${title} adlı anıyı silmek istediğinize emin misiniz?`)) {
      fetch(`https://api.github.com/repos/uroxx/uroxx.github.io/contents/notes.txt`, {
        method: 'GET',
        headers: {
          'Authorization': `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`
        }
      })
      .then(response => response.json())
      .then(data => {
        const fileContent = atob(data.content);
        const updatedContent = fileContent.split('\n').filter(line => !line.startsWith(`${title}:`)).join('\n');
        fetch(`https://api.github.com/repos/uroxx/uroxx.github.io/contents/notes.txt`, {
          method: 'PUT',
          headers: {
            'Authorization': `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`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: 'Deleted memory',
            content: btoa(updatedContent),
            sha: data.sha
          })
        });
      });
    }
  };

  function saveMemory(title, description, content) {
    fetch(`https://api.github.com/repos/uroxx/uroxx.github.io/contents/notes.txt`, {
      method: 'GET',
      headers: {
        'Authorization': `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`
      }
    })
    .then(response => response.json())
    .then(data => {
      const fileContent = atob(data.content);
      const newContent = `${fileContent}\n${title}:${description}:${content}`;
      fetch(`https://api.github.com/repos/uroxx/uroxx.github.io/contents/notes.txt`, {
        method: 'PUT',
        headers: {
          'Authorization': `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`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Added new memory',
          content: btoa(newContent),
          sha: data.sha
        })
      });
    });
  }

  function loadMemories() {
    fetch(`https://api.github.com/repos/uroxx/uroxx.github.io/contents/notes.txt`, {
      method: 'GET',
      headers: {
        'Authorization': `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`
      }
    })
    .then(response => response.json())
    .then(data => {
      const fileContent = atob(data.content);
      const lines = fileContent.split('\n');
      lines.forEach(line => {
        const [title, description, content] = line.split(':');
        addMemory(title, description, content);
      });
    });
  }

  loadMemories();
});
