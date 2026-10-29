# Audify – Music Player

Audify is a music player web app built during my **CodeAlpha Internship** using HTML, CSS and JavaScript. It has a dark neumorphic interface, a local playlist and a full player screen with smooth transitions between screens.

## Features

- **Welcome screen** with an animated glowing headphone and a Get Started button
- **Playlist of 12 tracks** with cover art, title and artist
- **Full player screen** with album art, song details and elapsed/total time
- **Playback controls**: play, pause, next and previous, with the next track starting automatically
- **Seek bar** to jump to any point in the song
- **Volume slider** with a mute toggle
- **Animated equalizer** on the track that is currently playing
- **Neumorphic design** with hover effects and fade animations

## Tech Stack

- HTML5
- CSS3 (custom neumorphic styles)
- JavaScript (ES6)
- Tailwind CSS via CDN
- Font Awesome icons
- Google Fonts: Orbitron and Inter

## Project Structure

```
Audify/
├── index.html
├── style.css
├── script.js
├── images/      # album covers
└── audio/       # music files
```

## How to Run

1. Download or clone the project and open the `Audify` folder in VS Code
2. Right-click `index.html` and choose **Open with Live Server**

An internet connection is needed for Tailwind CSS, Font Awesome and Google Fonts, because they load from a CDN.

## Adding Your Own Songs

1. Put your audio files in the `audio/` folder and the covers in `images/`
2. Add a new entry to the `tracks` array in `script.js`:

```js
{ id: 13, title: "Song Name", artist: "Artist Name", durationSec: 200, durationStr: "3:20",
  cover: "images/cover.jpg", src: "audio/song.mp3" }
```

> **Note:** The audio files are not included in this repository. Please add your own music files, and only use songs you have the rights to share.

## What I Learned

- Controlling audio with the HTML5 `Audio` element and JavaScript
- Switching between screens without reloading the page
- Building custom range sliders and a CSS equalizer animation
- Creating a neumorphic UI with Tailwind CSS and custom styles

## Future Improvements

- Add shuffle and repeat modes
- Add a search bar and favorite songs
- Let users upload their own songs from the browser

## About

Created as part of the CodeAlpha Internship.