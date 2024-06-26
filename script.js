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
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const content = document.getElementById('content').value.trim();

    if (title === "" || description === "" || content === "") {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

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
      <p>${content}</p>
      <div class="menu">⋮
        <div class="menu-content">
          <button onclick="editMemory('${title}')">Düzenle</button>
          <button onclick="deleteMemory('${title}')">Sil</button>
        </div>
      </div>
    `;
    memory.addEventListener('click', (e) => {
      if (!e.target.matches('.menu, .menu *')) {
        window.open(`${title}.txt`, '_blank');
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
    window.open(`edit.html?title=${encodeURIComponent(title)}`, '_blank');
  };

  window.deleteMemory = (title) => {
    if (confirm(`${title} adlı anıyı silmek istediğinize emin misiniz?`)) {
      fetch(`${title}.txt`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'token ghp_11A45QA3Q0sNe4aZSoypff_d9pVedBFne5mYuCwjOf8BUCW0PTXRk7HZzRYDY0tiWbL4GK6LJ4RGF4sIYo',
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          console.error('Anı silinemedi:', response.statusText);
        } else {
          document.querySelector(`.memory h2:contains('${title}')`).parentNode.remove();
        }
      })
      .catch(error => {
        console.error('Anı silinemedi:', error);
      });
    }
  };

  function saveMemory(title, description, content) {
    const data = `${description}\n${content}`;
    fetch(`${title}.txt`, {
      method: 'PUT',
      headers: {
        'Authorization': 'token ghp_11A45QA3Q0sNe4aZSoypff_d9pVedBFne5mYuCwjOf8BUCW0PTXRk7HZzRYDY0tiWbL4GK6LJ4RGF4sIYo',
        'Content-Type': 'application/json'
      },
      body: data
    })
    .then(response => {
      if (!response.ok) {
        console.error('Anı kaydedilemedi:', response.statusText);
      }
    })
    .catch(error => {
      console.error('Anı kaydedilemedi:', error);
    });
  }

  function loadMemories() {
    fetch('memory_list.txt')
    .then(response => response.text())
    .then(data => {
      const memoryList = data.split('\n').filter(line => line.trim() !== '');
      memoryList.forEach(memory => {
        fetch(memory)
        .then(response => response.text())
        .then(data => {
          const [title, description, content] = data.split('\n');
          addMemory(title, description, content);
        })
        .catch(error => {
          console.error('Anı yüklenemedi:', error);
        });
      });
    })
    .catch(error => {
      console.error('Anı listesi yüklenemedi:', error);
    });
  }

  loadMemories();
});
