import { H as Hls } from './hls-vendor-dru42stk.js';

function setMessage(shell, message) {
    var messageElement = shell.querySelector('[data-video-message]');

    if (messageElement) {
        messageElement.textContent = message;
    }
}

function attachHls(video, url, shell) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });

        hls.loadSource(url);
        hls.attachMedia(video);
        shell._hlsInstance = hls;

        return new Promise(function (resolve) {
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                resolve();
            });
        });
    }

    return Promise.reject(new Error('当前浏览器不支持 HLS 播放'));
}

function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-video-play]');
    var url = shell.getAttribute('data-video-url');
    var initialized = false;

    if (!video || !button || !url) {
        return;
    }

    button.addEventListener('click', function () {
        setMessage(shell, '正在载入播放源...');

        var ready = initialized ? Promise.resolve() : attachHls(video, url, shell);
        initialized = true;

        ready.then(function () {
            shell.classList.add('is-ready');
            setMessage(shell, '播放源已就绪。');
            return video.play();
        }).catch(function (error) {
            shell.classList.remove('is-ready');
            initialized = false;
            setMessage(shell, error.message || '播放初始化失败，请刷新页面后重试。');
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-video-player]').forEach(setupPlayer);
});
