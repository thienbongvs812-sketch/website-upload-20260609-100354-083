(function () {
    function start(source) {
        var video = document.getElementById("videoPlayer");
        var overlay = document.getElementById("playOverlay");
        var attached = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        function revealOverlay() {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        }

        function playVideo() {
            attach();
            hideOverlay();
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {
                    revealOverlay();
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", playVideo);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener("play", hideOverlay);
        video.addEventListener("pause", revealOverlay);
        video.addEventListener("ended", revealOverlay);
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.SitePlayer = {
        start: start
    };
})();
