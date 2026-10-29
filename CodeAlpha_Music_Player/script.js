// Tracks Data
const tracks = [
    { id: 1, title: "Believer", artist: "Imagine Dragons", durationSec: 204, durationStr: "3:24", cover: "images/Believer – Imagine Dragons.jpg", src: "audio/Believer.mp3" },
    { id: 2, title: "Boy With Luv", artist: "BTS ft. Halsey", durationSec: 229, durationStr: "3:49", cover: "images/Boy With Luv.jpeg", src: "audio/boy-with-luv.mp3" },
    { id: 3, title: "Butter", artist: "BTS", durationSec: 164, durationStr: "2:44", cover: "images/Butter.jpeg", src: "audio/butter.mp3" },
    { id: 4, title: "Criminal", artist: "Britney Spears", durationSec: 225, durationStr: "3:45", cover: "images/Criminal.jpeg", src: "audio/Criminal.mp3" },
    { id: 5, title: "Dynamite", artist: "BTS", durationSec: 199, durationStr: "3:19", cover: "images/Dynamite.jpeg", src: "audio/dynamite.mp3" },
    { id: 6, title: "Faded", artist: "Alan Walker", durationSec: 212, durationStr: "3:32", cover: "images/Faded.jpeg", src: "audio/Faded.mp3" },
    { id: 7, title: "Levitating", artist: "Dua Lipa", durationSec: 203, durationStr: "3:23", cover: "images/Levitating.jpeg", src: "audio/Levitating.mp3" },
    { id: 8, title: "Love Me Like You Do", artist: "Ellie Goulding", durationSec: 238, durationStr: "3:58", cover: "images/Love Me Like You Do.jpeg", src: "audio/Love Me Like You Do.mp3" },
    { id: 9, title: "Night Changes", artist: "One Direction", durationSec: 226, durationStr: "3:46", cover: "images/Night Changes.jpeg", src: "audio/Night Changes.mp3" },
    { id: 10, title: "Shape of You", artist: "Ed Sheeran", durationSec: 233, durationStr: "3:53", cover: "images/Shape of You.jpeg", src: "audio/Shape of You.mp3" },
    { id: 11, title: "Stay", artist: "The Kid LAROI & Justin Bieber", durationSec: 141, durationStr: "2:21", cover: "images/Stay.jpeg", src: "audio/Stay.mp3" },
    { id: 12, title: "Unstoppable", artist: "Sia", durationSec: 217, durationStr: "3:37", cover: "images/Unstoppable.jpeg", src: "audio/Unstoppable.mp3" }
];

let currentTrackIndex = -1; 
let isPlaying = false;
let currentScreen = 'home';

const audioElement = document.getElementById('audio-element');
let timerInterval = null;
let previousVolume = 0.8;

const songProgress = document.getElementById('song-progress');
const volumeSlider = document.getElementById('volume-slider');

const homeView = document.getElementById('home-view');
const playlistView = document.getElementById('playlist-view');
const playerView = document.getElementById('player-view');

const headerTitle = document.getElementById('header-title');
const backBtn = document.getElementById('back-btn');

// Slider Track Update Function
function updateSliderTrack(slider) {
    if (!slider) return;
    const val = slider.value;
    const max = slider.max || 100;
    const percentage = (val / max) * 100;
    slider.style.background = `linear-gradient(to right, #ff6e40 0%, #ff6e40 ${percentage}%, #11131a ${percentage}%, #11131a 100%)`;
}

// Render Playlist
function renderPlaylist() {
    const container = document.getElementById('playlist-container');
    if (!container) return;
    container.innerHTML = '';

    tracks.forEach((track, index) => {
        const isActive = index === currentTrackIndex;
        const item = document.createElement('div');
        
        // Yahan humne 'playlist-item' class add ki hai hover effect ke liye
        item.className = `playlist-item p-3 rounded-xl flex items-center justify-between cursor-pointer ${
            isActive ? 'neu-card-active' : 'neu-card'
        }`;
        
        item.onclick = () => {
            selectAndPlay(index);
        };

        let buttonContent = '';
        if (isActive && isPlaying) {
            buttonContent = `
                <div class="eq-container">
                    <div class="eq-bar"></div>
                    <div class="eq-bar"></div>
                    <div class="eq-bar"></div>
                    <div class="eq-bar"></div>
                    <div class="eq-bar"></div>
                </div>`;
        } else if (isActive && !isPlaying) {
            buttonContent = `<i class="fa-solid fa-pause text-[10px]"></i>`;
        } else {
            buttonContent = `<i class="fa-solid fa-play text-[10px] ml-0.5"></i>`;
        }

        item.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 rounded-lg overflow-hidden neu-inset p-0.5 shrink-0">
                    <img src="${track.cover}" class="w-full h-full object-cover rounded">
                </div>
                <div>
                    <h4 class="font-cyber font-semibold text-xs ${isActive ? 'text-orange-500' : 'text-slate-200'}">${track.title}</h4>
                    <p class="text-[10px] text-slate-400 mt-0.5">${track.artist}</p>
                </div>
            </div>
            <button class="w-8 h-8 rounded-lg ${isActive && isPlaying ? 'neu-orange-btn text-white' : 'neu-btn text-slate-400'} flex items-center justify-center text-xs">
                ${buttonContent}
            </button>
        `;
        container.appendChild(item);
    });
}

// Screen Switching Logic
function switchScreen(screen) {
    currentScreen = screen;
    homeView.classList.add('hidden');
    homeView.classList.remove('flex');
    playlistView.classList.add('hidden');
    playlistView.classList.remove('flex');
    playerView.classList.add('hidden');
    playerView.classList.remove('flex');

    headerTitle.innerText = "AUDIFY";

    if (screen === 'home') {
        homeView.classList.remove('hidden');
        homeView.classList.add('flex', 'screen-fade');
        backBtn.disabled = true;
        backBtn.classList.add('opacity-0', 'pointer-events-none');
        backBtn.classList.remove('opacity-100');
    } else if (screen === 'playlist') {
        playlistView.classList.remove('hidden');
        playlistView.classList.add('flex', 'screen-fade');
        backBtn.disabled = false;
        backBtn.classList.remove('opacity-0', 'pointer-events-none');
        backBtn.classList.add('opacity-100');
        renderPlaylist();
    } else if (screen === 'player') {
        playerView.classList.remove('hidden');
        playerView.classList.add('flex', 'screen-fade');
        backBtn.disabled = false;
        backBtn.classList.remove('opacity-0', 'pointer-events-none');
        backBtn.classList.add('opacity-100');
    }
}

function startListening() {
    switchScreen('playlist');
}

function goBack() {
    if (currentScreen === 'playlist') {
        switchScreen('home');
    } else if (currentScreen === 'player') {
        switchScreen('playlist');
    }
}

// Playback Functions
function selectAndPlay(index) {
    currentTrackIndex = index;
    updatePlayerUI();
    playTrack();
    switchScreen('player');
}

function playTrack() {
    if(currentTrackIndex === -1) return;

    const track = tracks[currentTrackIndex];
    if (!audioElement.src.includes(track.src)) {
        audioElement.src = track.src;
    }
    isPlaying = true;
    updatePlayButtonIcon();
    startTimer();
    audioElement.play().catch(e => console.log("Audio play initiated"));
}

function pauseTrack() {
    isPlaying = false;
    audioElement.pause();
    stopTimer();
    updatePlayButtonIcon();
}

function togglePlayPause() {
    if(currentTrackIndex === -1) return;
    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
}

function nextTrack() {
    if(currentTrackIndex === -1) return;
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    audioElement.src = tracks[currentTrackIndex].src;
    updatePlayerUI();
    playTrack();
}

function prevTrack() {
    if(currentTrackIndex === -1) return;
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    audioElement.src = tracks[currentTrackIndex].src;
    updatePlayerUI();
    playTrack();
}

// Timer & Progress UI
function startTimer() {
    stopTimer();
    timerInterval = setInterval(() => {
        if (isPlaying && !audioElement.paused && currentTrackIndex !== -1) {
            const track = tracks[currentTrackIndex];
            if (audioElement.currentTime >= track.durationSec || audioElement.ended) {
                nextTrack();
                return;
            }
            updateProgressUI();
        }
    }, 500);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateProgressUI() {
    if(currentTrackIndex === -1) return;
    const track = tracks[currentTrackIndex];
    const currentSec = audioElement.currentTime || 0;
    
    const curMins = Math.floor(currentSec / 60);
    const curSecs = Math.floor(currentSec % 60);
    document.getElementById('current-time').innerText = `${curMins}:${curSecs < 10 ? '0' : ''}${curSecs}`;

    const percent = (currentSec / track.durationSec) * 100;
    if (songProgress) {
        songProgress.value = percent || 0;
        updateSliderTrack(songProgress);
    }
}

// Event Listeners for Sliders
songProgress.addEventListener('input', (e) => {
    if(currentTrackIndex === -1) return;
    const val = e.target.value;
    const track = tracks[currentTrackIndex];
    const newTime = (val / 100) * track.durationSec;
    audioElement.currentTime = newTime;
    updateProgressUI();
});

volumeSlider.addEventListener('input', (e) => {
    const vol = e.target.value;
    audioElement.volume = vol / 100;
    updateSliderTrack(volumeSlider);
    
    const volIcon = document.getElementById('volume-icon');
    if (vol == 0) {
        volIcon.className = "fa-solid fa-volume-xmark text-orange-500 text-xs";
    } else if (vol < 50) {
        volIcon.className = "fa-solid fa-volume-low text-xs";
    } else {
        volIcon.className = "fa-solid fa-volume-high text-xs";
    }
});

function toggleMute() {
    const volIcon = document.getElementById('volume-icon');
    if (audioElement.volume > 0) {
        previousVolume = audioElement.volume;
        audioElement.volume = 0;
        volumeSlider.value = 0;
        volIcon.className = "fa-solid fa-volume-xmark text-orange-500 text-xs";
    } else {
        audioElement.volume = previousVolume || 0.8;
        volumeSlider.value = (previousVolume || 0.8) * 100;
        volIcon.className = "fa-solid fa-volume-high text-xs";
    }
    updateSliderTrack(volumeSlider);
}

// Update UI Functions
function updatePlayerUI() {
    if(currentTrackIndex === -1) return;
    const track = tracks[currentTrackIndex];
    document.getElementById('player-song-title').innerText = track.title;
    document.getElementById('player-song-artist').innerText = track.artist;
    document.getElementById('player-cover').src = track.cover;
    document.getElementById('total-duration').innerText = track.durationStr;
}

function updatePlayButtonIcon() {
    const icon = document.getElementById('player-play-icon');
    icon.className = isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play ml-0.5";
    if (!playlistView.classList.contains('hidden')) {
        renderPlaylist();
    }
}

function toggleLikeActive(btn) {
    const icon = btn.querySelector('i');
    icon.classList.toggle('text-orange-500');
}

// Initialize App
window.onload = function() {
    audioElement.volume = 0.8;
    volumeSlider.value = 80;
    updateSliderTrack(volumeSlider);
    switchScreen('home');
};