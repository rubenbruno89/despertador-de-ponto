const entradaTime = document.getElementById('entradaTime');
const saidaAlmocoTime = document.getElementById('saidaAlmocoTime');
const retornoAlmocoTime = document.getElementById('retornoAlmocoTime');
const saidaTime = document.getElementById('saidaTime');
const setAlarm = document.getElementById('setAlarm');
const stopAlarm = document.getElementById('stopAlarm');
const statusDiv = document.getElementById('status');

let alarmIntervals = [];
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

async function sendNtfyNotification(message) {
  try {
    await fetch('https://ntfy.sh/alarme-de-ponto', {
      method: 'POST',
      body: JSON.stringify({
        topic: 'alarme-de-ponto',
        message: message,
        actions: [
          {
            action: 'view',
            label: 'Abrir Ponto Eletrônico',
            url: 'https://centraldofuncionario.com.br/35564/incluir-ponto'
          }
        ]
      })
    });
  } catch (error) {
    console.error('Erro na notificação:', error);
  }
}

function checkAlarm(timeInput, label) {
  const now = new Date();
  const [alarmHours, alarmMinutes] = timeInput.value.split(':');
  const alarmDate = new Date();
  alarmDate.setHours(alarmHours, alarmMinutes, 0, 0);

  if (now >= alarmDate) {
    const message = `⏰ Hora de ${label}! Clique para abrir o ponto.`;
    statusDiv.textContent = message;
    stopAlarm.style.display = 'inline-block';
    
    playBeep();
    sendNtfyNotification(message);
    window.open('https://centraldofuncionario.com.br/35564/incluir-ponto', '_blank');
    
    return true;
  }
  return false;
}

function setupAlarms() {
  const alarmPoints = [
    { input: entradaTime, label: 'entrada' },
    { input: saidaAlmocoTime, label: 'saída para almoço' },
    { input: retornoAlmocoTime, label: 'retorno do almoço' },
    { input: saidaTime, label: 'saída' }
  ];

  // Clear any existing intervals
  alarmIntervals.forEach(clearInterval);
  alarmIntervals = [];

  // Setup new intervals for each alarm point
  alarmPoints.forEach(point => {
    if (point.input.value) {
      const interval = setInterval(() => {
        if (checkAlarm(point.input, point.label)) {
          clearInterval(interval);
        }
      }, 1000);
      alarmIntervals.push(interval);
    }
  });

  statusDiv.textContent = 'Alarmes ativados';
  setAlarm.style.display = 'none';
  stopAlarm.style.display = 'inline-block';
}

function stopAlarms() {
  alarmIntervals.forEach(clearInterval);
  alarmIntervals = [];
  statusDiv.textContent = 'Alarmes desativados';
  setAlarm.style.display = 'inline-block';
  stopAlarm.style.display = 'none';
}

setAlarm.addEventListener('click', setupAlarms);
stopAlarm.addEventListener('click', stopAlarms);