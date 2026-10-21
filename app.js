let participants = [];
let activeDate = 'auto';
let currentParticipantId = null;

window.onload = function() {
  loadData();
  renderList();
};

function loadData() {
  const saved = localStorage.getItem('shooting_participants');
  if (saved) {
    participants = JSON.parse(saved);
  }
  const savedDate = localStorage.getItem('shooting_date');
  if (savedDate) {
    activeDate = savedDate;
    document.getElementById('admin-date-select').value = activeDate;
  }
}

function saveData() {
  localStorage.setItem('shooting_participants', JSON.stringify(participants));
}

function getTodayString() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return day + '.' + month;
}

function getEffectiveDate() {
  return activeDate === 'auto' ? getTodayString() : activeDate;
}

function renderList(searchQuery = "") {
  const listContainer = document.getElementById('participants-list');
  const noResults = document.getElementById('no-results');
  listContainer.innerHTML = '';
  
  const today = getEffectiveDate();
  document.getElementById('date-display').innerText = "Date : " + today + (activeDate === 'auto' ? " automatique" : " manuelle");

  let filtered = participants.filter(p => p.Date === today || !p.Date);

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p => 
      (p.Nom && p.Nom.toLowerCase().includes(q)) || 
      (p.Prenom && p.Prenom.toLowerCase().includes(q))
    );
  }

  filtered.sort((a, b) => {
    if (a.valide !== b.valide) {
      return a.valide ? 1 : -1;
    }
    const timeA = a.Heure || "23:59";
    const timeB = b.Heure || "23:59";
    return timeA.localeCompare(timeB);
  });

  if (filtered.length === 0 && searchQuery !== "") {
    noResults.style.display = 'block';
  } else {
    noResults.style.display = 'none';
    filtered.forEach(p => {
      const div = document.createElement('div');
      div.className = 'participant-card' + (p.valide ? ' valide' : '');
      div.onclick = () => openProfile(p.id);
      
      div.innerHTML = `
        <div class="participant-info">
          <strong>${p.Prenom || ''} ${p.Nom || ''}</strong>
          <span class="participant-time">${p.Heure || 'heure à définir'}</span>
        </div>
      `;
      listContainer.appendChild(div);
    });
  }
}

document.getElementById('searchInput').addEventListener('input', function(e) {
  renderList(e.target.value);
});

document.getElementById('btn-add-search').addEventListener('click', function() {
  const query = document.getElementById('searchInput').value.trim();
  let nom = "", prenom = query;
  if (query.includes(' ')) {
    const parts = query.split(' ');
    nom = parts.pop();
    prenom = parts.join(' ');
  }
  
  const newP = {
    id: Date.now().toString(),
    Prenom: prenom,
    Nom: nom,
    Date: getEffectiveDate(),
    Heure: "",
    Telephone: "",
    Mail: "",
    Adresse: "",
    valide: false
  };
  
  participants.push(newP);
  saveData();
  document.getElementById('searchInput').value = "";
  renderList();
  openProfile(newP.id);
});

function openProfile(id) {
  currentParticipantId = id;
  const p = participants.find(x => x.id === id);
  if (!p) return;
  
  document.getElementById('profile-name').innerText = `${p.Prenom || ''} ${p.Nom || ''}`;
  document.getElementById('profile-time').innerText = p.Heure || '-';
  document.getElementById('profile-phone').innerText = p.Telephone || '-';
  document.getElementById('profile-email').innerText = p.Mail || '-';
  document.getElementById('profile-address').innerText = p.Adresse || '-';
  
  document.getElementById('btn-validate').innerText = p.valide ? "Annuler la validation" : "Valider la présence";
  
  document.getElementById('profile-modal').classList.add('active');
}

document.getElementById('btn-close-profile').onclick = () => {
  document.getElementById('profile-modal').classList.remove('active');
};

document.getElementById('btn-validate').onclick = () => {
  const p = participants.find(x => x.id === currentParticipantId);
  if (p) {
    p.valide = !p.valide;
    saveData();
    renderList(document.getElementById('searchInput').value);
  }
  document.getElementById('profile-modal').classList.remove('active');
};

document.getElementById('btn-edit').onclick = () => {
  const p = participants.find(x => x.id === currentParticipantId);
  if (!p) return;
  
  document.getElementById('edit-prenom').value = p.Prenom || '';
  document.getElementById('edit-nom').value = p.Nom || '';
  document.getElementById('edit-heure').value = p.Heure || '';
  document.getElementById('edit-phone').value = p.Telephone || '';
  document.getElementById('edit-email').value = p.Mail || '';
  document.getElementById('edit-address').value = p.Adresse || '';
  
  document.getElementById('profile-modal').classList.remove('active');
  document.getElementById('edit-modal').classList.add('active');
};

document.getElementById('btn-cancel-edit').onclick = () => {
  document.getElementById('edit-modal').classList.remove('active');
  openProfile(currentParticipantId);
};

document.getElementById('btn-save-edit').onclick = () => {
  const p = participants.find(x => x.id === currentParticipantId);
  if (p) {
    p.Prenom = document.getElementById('edit-prenom').value;
    p.Nom = document.getElementById('edit-nom').value;
    p.Heure = document.getElementById('edit-heure').value;
    p.Telephone = document.getElementById('edit-phone').value;
    p.Mail = document.getElementById('edit-email').value;
    p.Adresse = document.getElementById('edit-address').value;
    saveData();
    renderList(document.getElementById('searchInput').value);
  }
  document.getElementById('edit-modal').classList.remove('active');
  openProfile(currentParticipantId);
};

let tapCount = 0;
let tapTimer;
document.getElementById('admin-trigger').addEventListener('click', () => {
  tapCount++;
  clearTimeout(tapTimer);
  if (tapCount >= 5) {
    tapCount = 0;
    const code = prompt("Code administrateur : ");
    if (code === "1848") {
      document.getElementById('admin-modal').classList.add('active');
    } else if (code !== null) {
      alert("code incorrect");
    }
  }
  tapTimer = setTimeout(() => { tapCount = 0; }, 1500);
});

document.getElementById('btn-close-admin').onclick = () => {
  document.getElementById('admin-modal').classList.remove('active');
};

document.getElementById('admin-date-select').onchange = (e) => {
  activeDate = e.target.value;
  localStorage.setItem('shooting_date', activeDate);
  renderList();
};

document.getElementById('fileInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, {type: 'array'});
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(worksheet);
    
    participants = json.map((row, index) => ({
      id: Date.now().toString() + "-" + index,
      Prenom: row.Prenom || row.Prénom || "",
      Nom: row.Nom || "",
      Date: row.Date || row.Jour || getTodayString(),
      Heure: row.Heure || row.Horaire || "",
      Telephone: row.Telephone || row.Téléphone || row.Tel || "",
      Mail: row.Mail || row.Email || "",
      Adresse: row.Adresse || row.Adresse_postale || "",
      valide: false
    }));
    
    saveData();
    renderList();
    alert("importation réussie : " + participants.length + " personnes ajoutées");
  };
  reader.readAsArrayBuffer(file);
});

document.getElementById('btn-export').onclick = () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(participants, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "sauvegarde_shooting_" + getEffectiveDate() + ".json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
