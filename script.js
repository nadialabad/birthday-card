function confettis(){
    var duration = 4000;
    var endTime = Date.now() + duration;
    var baseSettings = { startVelocity: 30, spread: 360, ticks: 40, zIndex: 3 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    var interval = setInterval(() => {
        var remainingTime = endTime - Date.now();

        if (remainingTime <= 0) {
            return clearInterval(interval);
        }

        var particleCount = 50 * (remainingTime / duration);

        confetti({ ...baseSettings, particleCount, origin: { x: randomInRange(0.1, 0.4), y: Math.random() - 0.2 } });
        confetti({ ...baseSettings, particleCount, origin: { x: randomInRange(0.5, 0.9), y: Math.random() - 0.2 } });
    }, 200);
}

let audioContext;

function getAverageVolume(array) {
    let total = 0;
    for (let i = 0; i < array.length; i++) {
        total += array[i];
    }
    return total / array.length;
}

function animateFlame() {
    analyser.getByteFrequencyData(dataArray);
    const volume = getAverageVolume(dataArray);

    const flameWrappers = document.querySelectorAll('.flame-wrapper');
    const flames = document.querySelectorAll('.flame');
    const bases = document.querySelectorAll('.base');

    if (!flameWrappers.length || !flames.length || !bases.length) return;  

    flameWrappers.forEach((flameWrapper) => {
        const shouldSway = Math.random() > 0.5;
        flameWrapper.style.animationDuration = volume > 30 ? '10ms' : '3ms';

        if (volume > 70) {
            shouldSway ? flameWrapper.classList.add('swaying') : flameWrapper.classList.remove('swaying');
        } else {
            flameWrapper.classList.remove('swaying');
        }
    });

    flames.forEach((flame) => {
        flame.style.opacity = volume > 70 ? '0.5' : '1';
    });

    if (volume > 125) {
        flames.forEach(flame => flame.style.opacity = '0');
        bases.forEach(base => base.style.opacity = '0');
        confettis();
        if (audioContext && audioContext.state !== 'closed') {
            audioContext.close();
        }
        return;
    }

    requestAnimationFrame(animateFlame);
}

function initializeAudioAnalysis() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);

            requestAnimationFrame(animateFlame);
        })
        .catch(err => {
            console.error('Error accessing microphone: ', err);
        });
}

document.getElementById('age').addEventListener('input', async(event) => {
    const ageInput = event.target.value;
    if (ageInput < 0 || ageInput > 120 || isNaN(ageInput)) {
        return; 
    }
    
    const candleContainer = document.querySelector('.candle-container');
    candleContainer.innerHTML = '';

    for (let i = 0; i < ageInput; i++) {
        const candle = document.createElement('div');
        candle.classList.add('candle');

        const leftPosition = (i + 0.5) * (100 / ageInput) + '%';
        candle.style.left = `calc(${leftPosition} - 5px)`;

        const flameWrapper = document.createElement('div');
        flameWrapper.classList.add('flame-wrapper');

        const flameColors = ['red', 'orange', 'yellow', 'white'];
        flameColors.forEach(color => {
            const flame = document.createElement('div');
            flame.classList.add('flame', color);
            flameWrapper.appendChild(flame);
        });

        const baseBlue = document.createElement('div');
        baseBlue.classList.add('base', 'blue');
        flameWrapper.appendChild(baseBlue);

        const baseBlack = document.createElement('div');
        baseBlack.classList.add('base', 'black');
        flameWrapper.appendChild(baseBlack);

        candle.appendChild(flameWrapper);
        candleContainer.appendChild(candle);
    }

    document.querySelectorAll('.flame').forEach(flame => {
        flame.style.opacity = '1';
    });
    document.querySelectorAll('.base').forEach(base => {
        base.style.opacity = '1';
    });

    if (audioContext && audioContext.state === "suspended") {
        audioContext.resume();
    }

    initializeAudioAnalysis();
});
    
initializeAudioAnalysis();
