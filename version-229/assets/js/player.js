import { H as Hls } from './hls-vendor.js';

const players = Array.from(document.querySelectorAll('[data-player]'));

players.forEach((player) => {
    const video = player.querySelector('video');
    const trigger = player.querySelector('[data-play-trigger]');
    const stream = player.dataset.stream;
    let initialized = false;
    let hls = null;

    const start = async () => {
        if (!video || !stream) {
            return;
        }

        if (!initialized) {
            initialized = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (Hls && Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        if (trigger) {
            trigger.classList.add('is-hidden');
        }

        try {
            await video.play();
        } catch (error) {
            if (trigger) {
                trigger.classList.remove('is-hidden');
            }
        }
    };

    if (trigger) {
        trigger.addEventListener('click', start);
    }

    if (video) {
        video.addEventListener('click', () => {
            if (video.paused) {
                start();
            }
        });
    }

    window.addEventListener('pagehide', () => {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
});
