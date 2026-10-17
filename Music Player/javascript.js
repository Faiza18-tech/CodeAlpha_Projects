const tracks = [
    { id: 1, title: "Dynamite", artist: "BTS", duration: "3:19", freq: 440 },
    { id: 2, title: "Pasoori", artist: "Ali Sethi x Shae Gill", duration: "3:44", freq: 330 },
    { id: 3, title: "Butter", artist: "BTS", duration: "2:44", freq: 520 },
    { id: 4, title: "Kahani Suno 2.0", artist: "Kaifi Khalil", duration: "2:53", freq: 280 },
    { id: 5, title: "Boy With Luv", artist: "BTS ft. Halsey", duration: "3:49", freq: 390 },
    { id: 6, title: "Blockbuster", artist: "Faris Shafi x Umair", duration: "3:05", freq: 410 }
];

let currentTrackIndex = 0;
let isPlaying = false;
let audioCtx = null;
let oscillator = null;
let gainNode = null;

function renderPlaylist() {
    const container = document.getElementById('playlist-container');
    if (!container) return;
    container.innerHTML = '';

    tracks.forEach((track, index) => {
        const isActive = index === currentTrackIndex;
        const item = document.createElement('div');
        item.className = `p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
            isActive 
                ? 'bg-cyan-500/10 border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/30'
        }`;
        
        // Song par click krne se player screen khul jayegi
        item.onclick = () => selectSongAndOpenPlayer(index);

        item.innerHTML = `
            <div class="flex items-center space-x-4">
                <div class="w-9 h-9 rounded-lg ${isActive ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_#22d3ee]' : 'bg-slate-800 text-cyan-400'} flex items-center justify-center font-cyber text-xs">
                    ${index + 1}
                </div>
                <div>
                    <h4 class="font-cyber font-semibold text-sm ${isActive ? 'text-cyan-300' : 'text-white'}">${track.title}</h4>
                    <p class="text-xs text-slate-400">${track.artist}</p>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <span class="text-xs font-mono text-slate-500">${track.duration}</span>
                <i class="fa-solid fa-play text-xs text-cyan-400"></i>
            </div>
        `;
        container.appendChild(item);
    });
}

// Navigation Controllers
function openPlaylistScreen() {
    document.getElementById('home-view').classList.add('hidden');
    document.getElementById('playlist-screen').classList.remove('hidden');
    document.getElementById('playlist-screen').classList.add('flex');
    renderPlaylist();
}

function closePlaylistScreen() {
    document.getElementById('playlist-screen').classList.add('hidden');
    document.getElementById('playlist-screen').classList.remove('flex');
    document.getElementById('home-view').classList.remove('hidden');
}

function selectSongAndOpenPlayer(index) {
    currentTrackIndex = index;
    document.getElementById('playlist-screen').classList.add('hidden');
    document.getElementById('playlist-screen').classList.remove('flex');
    
    const playerScreen = document.getElementById('player-screen');
    playerScreen.classList.remove('hidden');
    playerScreen.classList.add('flex');

    updatePlayerUI();
    startSynthAudio();
}

function backToPlaylist() {
    document.getElementById('player-screen').classList.add('hidden');
    document.getElementById('player-screen').classList.remove('flex');
    document.getElementById('playlist-screen').classList.remove('hidden');
    document.getElementById('playlist-screen').classList.add('flex');
    renderPlaylist();
}

// Audio Engine & Player Updates
function startSynthAudio() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        stopSynthAudio();

        const track = tracks[currentTrackIndex];
        oscillator = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(track.freq, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, audioCtx.currentTime);

        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        isPlaying = true;
        updatePlayButtonIcon();
    } catch (e) {
        console.error("Audio error:", e);
    }
}

function stopSynthAudio() {
    if (oscillator) {
        try {
            oscillator.stop();
            oscillator.disconnect();
        } catch(e) {}
        oscillator = null;
    }
    isPlaying = false;
    updatePlayButtonIcon();
}

function togglePlayPause() {
    if (isPlaying) {
        stopSynthAudio();
    } else {
        startSynthAudio();
    }
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    updatePlayerUI();
    startSynthAudio();
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    updatePlayerUI();
    startSynthAudio();
}

function updatePlayerUI() {
    const track = tracks[currentTrackIndex];
    document.getElementById('player-song-title').innerText = track.title;
    document.getElementById('player-song-artist').innerText = track.artist;
    document.getElementById('total-duration').innerText = track.duration;
}

function updatePlayButtonIcon() {
    const icon = document.getElementById('player-play-icon');
    if (icon) {
        icon.className = isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play ml-1";
    }
}

function toggleLike(btn) {
    const icon = btn.querySelector('i');
    if (icon.classList.contains('fa-regular')) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid', 'text-pink-500');
    } else {
        icon.classList.remove('fa-solid', 'text-pink-500');
        icon.classList.add('fa-regular');
    }
}

window.onload = function() {
    renderPlaylist();
};