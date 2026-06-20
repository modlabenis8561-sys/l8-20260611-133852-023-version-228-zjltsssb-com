import { H as Hls } from "./hls-vendor.js";

export function setupMoviePlayer(source, videoId, overlayId) {
    const video = document.getElementById(videoId);
    const overlay = document.getElementById(overlayId);
    let hls = null;
    let attached = false;

    if (!video || !source) {
        return;
    }

    const attach = () => {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
            video.src = source;
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                maxBufferLength: 30,
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    };

    const play = () => {
        attach();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        const request = video.play();
        if (request && typeof request.catch === "function") {
            request.catch(() => {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        }
    };

    if (overlay) {
        overlay.addEventListener("click", play);
    }

    video.addEventListener("click", () => {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener("play", () => {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    window.addEventListener("pagehide", () => {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}
