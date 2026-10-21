document.getElementById('fileInput').addEventListener('change', function(e) {
  var file = e.target.files[0];
  var reader = new FileReader();
  reader.onload = function(event) {
    var data = new Uint8Array(event.target.result);
    var workbook = XLSX.read(data, {type: 'array'});
    var firstSheetName = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[firstSheetName];
    var json = XLSX.utils.sheet_to_json(worksheet);
    displayParticipants(json);
  };
  reader.readAsArrayBuffer(file);
});

function displayParticipants(data) {
  var list = document.getElementById('participantsList');
  list.innerHTML = '';
  data.forEach(function(participant) {
    var div = document.createElement('div');
    div.className = 'participant-card';
    div.innerText = participant.Nom + ' ' + participant.Prenom;
    list.appendChild(div);
  });
}