let isPlaying = false;

function playMusic() {
    const audio = document.getElementById('background-music');
    audio.volume = 0.1; // Set volume to 10%
    audio.play();
}

function stopMusic() {
    const audio = document.getElementById('background-music');
    audio.pause();
}

function toggleMusic() {
    const audio = document.getElementById('background-music');
    const playButton = document.getElementById('play-music');
    const stopButton = document.getElementById('stop-music');

    if (isPlaying) {
        audio.pause();
        playButton.style.display = 'block';
        stopButton.style.display = 'none';
    } else {
        audio.volume = 0.1; // Set volume to 10%
        audio.play();
        playButton.style.display = 'none';
        stopButton.style.display = 'block';
    }
    isPlaying = !isPlaying;
}

function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    const page = document.getElementById(pageId + '-page');
    page.classList.add('active');
    
    if (pageId === 'about') {
        adjustAboutImagePosition();
    }
}

function adjustAboutImagePosition() {
    const headerHeight = document.querySelector('header').offsetHeight;
    const aboutImage = document.getElementById('about-image');
    aboutImage.style.top = `${headerHeight}px`;
}

// Initialize the first page with a slight delay to apply transition
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('home-page').classList.add('active');
    }, 100);

    // Adjust the about image position if the about page is the first to be loaded
    if (document.getElementById('about-page').classList.contains('active')) {
        adjustAboutImagePosition();
    }

    // Initially hide the stop button
    document.getElementById('stop-music').style.display = 'none';
});