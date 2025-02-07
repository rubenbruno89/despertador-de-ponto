const alarmTime = document.getElementById('alarmTime');
const setAlarm = document.getElementById('setAlarm');
const stopAlarm = document.getElementById('stopAlarm');
const statusDiv = document.getElementById('status');

let alarmInterval;
let audioContext;

function playBeep() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  
  oscillator.start();
  setTimeout(() => oscillator.stop(), 500);
}

async function sendNtfyNotification() {
  try {
    await fetch('https://ntfy.sh/alarme-de-ponto', {
      method: 'POST',
      body: JSON.stringify({
        topic: 'alarme-de-ponto',
        message: `⏰ Hora de bater o ponto! Apenas clique para abrir: ${alarmTime.value}`,
        actions: [
          {
            action: 'view',
            label: 'Abrir Ponto Eletrônico',
            url: 'https://centraldofuncionario.com.br/35564/'
          }
        ]
      })
    });
  } catch (error) {
    console.error('Erro na notificação:', error);
  }
}

function checkAlarm() {
  const now = new Date();
  const [alarmHours, alarmMinutes] = alarmTime.value.split(':');
  const alarmDate = new Date();
  alarmDate.setHours(alarmHours, alarmMinutes, 0, 0);

  if (now >= alarmDate) {
    clearInterval(alarmInterval);
    statusDiv.textContent = '⏰ ALARME ATIVADO! Hora de bater o ponto!';
    stopAlarm.style.display = 'inline-block';
    
    playBeep();
    sendNtfyNotification();
    window.open('https://centraldofuncionario.com.br/35564/', '_blank');
    
    // Continua o bip a cada 30 segundos
    alarmInterval = setInterval(playBeep, 30000);
  }
}

setAlarm.addEventListener('click', () => {
  if (!alarmTime.value) {
    statusDiv.textContent = 'Selecione um horário primeiro';
    return;
  }
  
  alarmInterval = setInterval(checkAlarm, 1000);
  statusDiv.textContent = `Alarme ativado para ${alarmTime.value}`;
  setAlarm.style.display = 'none';
  stopAlarm.style.display = 'inline-block';
});

stopAlarm.addEventListener('click', () => {
  clearInterval(alarmInterval);
  statusDiv.textContent = 'Alarme desativado';
  setAlarm.style.display = 'inline-block';
  stopAlarm.style.display = 'none';
});