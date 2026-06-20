document.addEventListener('DOMContentLoaded', function () {
    const video = document.querySelector('[data-player-video]');
    const overlay = document.querySelector('[data-player-overlay]');
    const streamUrl = typeof currentMovieStream === 'string' ? currentMovieStream : '';
    let mediaReady = false;
    let hlsInstance = null;

    if (!video || !overlay || !streamUrl) {
        return;
    }

    const prepareMedia = function () {
        if (mediaReady) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else {
            video.src = streamUrl;
        }

        video.controls = true;
        mediaReady = true;
    };

    const startPlayback = function () {
        prepareMedia();
        overlay.classList.add('is-hidden');
        const request = video.play();

        if (request && typeof request.catch === 'function') {
            request.catch(function () {});
        }
    };

    overlay.addEventListener('click', startPlayback);

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    window.addEventListener('pagehide', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
});
