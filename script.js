// Mobil Menü Aç/Kapat
        function toggleMobileMenu() {
            const nav = document.getElementById('navMenu');
            nav.classList.toggle('active');
        }

        function closeMobileMenu() {
            const nav = document.getElementById('navMenu');
            nav.classList.remove('active');
        }

        // Modal Açma Fonksiyonu
        function openPlayerModal(data) {
            document.getElementById('mName').innerText = data.name + ' (' + data.realName + ')';
            document.getElementById('mRole').innerText = data.role;
            document.getElementById('mAvatar').src = data.img;
            document.getElementById('mSinif').innerText = data.sinif;
            document.getElementById('mCinsiyet').innerText = data.cinsiyet;
            document.getElementById('mBeceri').innerText = data.beceri;
            document.getElementById('mKrallik').innerText = data.krallik;
            document.getElementById('mDiscord').innerText = data.discord;
            document.getElementById('mCodeId').innerText = '// Oyuncu Özel Kod Bloğu\nID: ' + data.codeId + '\nNick: ' + data.name + '\nReal: ' + data.realName + '\nDiscord: ' + data.discord;

            document.getElementById('playerModal').classList.add('active');
        }

        // Modal Kapatma Fonksiyonu
        function closePlayerModal() {
            document.getElementById('playerModal').classList.remove('active');
        }

        // Dışarıya tıklayınca kapatma
        function closeModalOnOutside(e) {
            if (e.target.id === 'playerModal') {
                closePlayerModal();
            }
        }

        // ESC tuşu ile kapatma
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closePlayerModal();
            }
        });

        // Sınıf Filtreleme Fonksiyonu
        function filterClass(className) {
            const buttons = document.querySelectorAll('.tab-btn');
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            const cards = document.querySelectorAll('.player-grid .p-card');
            cards.forEach(card => {
                if (className === 'all' || card.getAttribute('data-class') === className) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        }

// ------------------------------------------------------------
// Ravix arka plan müziği (YouTube)
// Video: https://www.youtube.com/watch?v=bn1YCClRF-g
// Tarayıcıların sesli autoplay kısıtlamaları nedeniyle müzik ilk
// kullanıcı etkileşiminden sonra başlar. Sayfalar arasında konum ve
// açık/kapalı durumu localStorage ile korunur.
// ------------------------------------------------------------
(function () {
    const MUSIC_VIDEO_ID = 'bn1YCClRF-g';
    const STORAGE_ENABLED = 'ravixMusicEnabled';
    const STORAGE_POSITION = 'ravixMusicPosition';

    let player = null;
    let apiReady = false;
    let pendingStart = false;
    let hasUserGesture = false;

    // İlk ziyaret için müzik açık kabul edilir; kullanıcı isterse kapatabilir.
    if (localStorage.getItem(STORAGE_ENABLED) === null) {
        localStorage.setItem(STORAGE_ENABLED, 'true');
    }

    function musicEnabled() {
        return localStorage.getItem(STORAGE_ENABLED) !== 'false';
    }

    function savedPosition() {
        const value = Number(localStorage.getItem(STORAGE_POSITION) || '0');
        return Number.isFinite(value) && value >= 0 ? value : 0;
    }

    function savePosition() {
        if (!player || typeof player.getCurrentTime !== 'function') return;
        try {
            const time = player.getCurrentTime();
            if (Number.isFinite(time) && time >= 0) {
                localStorage.setItem(STORAGE_POSITION, String(time));
            }
        } catch (_) {}
    }

    function updateMusicButton(isPlaying) {
        const button = document.getElementById('ravixMusicToggle');
        if (!button) return;

        const enabled = musicEnabled();
        const active = typeof isPlaying === 'boolean' ? isPlaying : enabled;
        button.classList.toggle('is-playing', active && enabled);
        button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
        button.title = enabled ? 'Müziği kapat' : 'Müziği aç';
        button.innerHTML = enabled
            ? '<i class="fa-solid fa-volume-high"></i><span>Müzik</span>'
            : '<i class="fa-solid fa-volume-xmark"></i><span>Müzik</span>';
    }

    function createUi() {
        if (document.getElementById('ravixMusicToggle')) return;

        const button = document.createElement('button');
        button.id = 'ravixMusicToggle';
        button.className = 'ravix-music-toggle';
        button.type = 'button';
        button.setAttribute('aria-label', 'Arka plan müziğini aç veya kapat');
        button.addEventListener('click', function (event) {
            event.stopPropagation();
            hasUserGesture = true;

            if (musicEnabled()) {
                localStorage.setItem(STORAGE_ENABLED, 'false');
                savePosition();
                if (player && typeof player.pauseVideo === 'function') {
                    try { player.pauseVideo(); } catch (_) {}
                }
                updateMusicButton(false);
            } else {
                localStorage.setItem(STORAGE_ENABLED, 'true');
                updateMusicButton(true);
                startMusic();
            }
        });
        document.body.appendChild(button);

        const playerHost = document.createElement('div');
        playerHost.id = 'ravixMusicPlayer';
        playerHost.className = 'ravix-music-player';
        playerHost.setAttribute('aria-hidden', 'true');
        document.body.appendChild(playerHost);

        updateMusicButton(false);
    }

    function loadYoutubeApi() {
        if (window.YT && window.YT.Player) {
            apiReady = true;
            buildPlayer();
            return;
        }

        if (!document.querySelector('script[data-ravix-youtube-api]')) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            tag.async = true;
            tag.dataset.ravixYoutubeApi = 'true';
            document.head.appendChild(tag);
        }

        const previousReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = function () {
            if (typeof previousReady === 'function') {
                try { previousReady(); } catch (_) {}
            }
            apiReady = true;
            buildPlayer();
        };
    }

    function buildPlayer() {
        if (!apiReady || player || !document.getElementById('ravixMusicPlayer')) return;

        player = new YT.Player('ravixMusicPlayer', {
            width: '200',
            height: '200',
            videoId: MUSIC_VIDEO_ID,
            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                playsinline: 1,
                rel: 0,
                loop: 1,
                playlist: MUSIC_VIDEO_ID
            },
            events: {
                onReady: function () {
                    const position = savedPosition();
                    if (position > 0) {
                        try { player.seekTo(position, true); } catch (_) {}
                    }
                    if (pendingStart && hasUserGesture && musicEnabled()) {
                        pendingStart = false;
                        startMusic();
                    }
                },
                onStateChange: function (event) {
                    if (!window.YT || !YT.PlayerState) return;
                    if (event.data === YT.PlayerState.PLAYING) updateMusicButton(true);
                    if (event.data === YT.PlayerState.PAUSED) updateMusicButton(false);
                    if (event.data === YT.PlayerState.ENDED) {
                        localStorage.setItem(STORAGE_POSITION, '0');
                    }
                }
            }
        });
    }

    function startMusic() {
        if (!musicEnabled()) return;
        if (!hasUserGesture) {
            pendingStart = true;
            return;
        }
        if (!player || typeof player.playVideo !== 'function') {
            pendingStart = true;
            return;
        }

        try {
            const position = savedPosition();
            if (position > 0) player.seekTo(position, true);
            player.playVideo();
        } catch (_) {
            pendingStart = true;
        }
    }

    function firstInteraction() {
        hasUserGesture = true;
        if (musicEnabled()) startMusic();
    }

    document.addEventListener('DOMContentLoaded', function () {
        createUi();
        loadYoutubeApi();

        // İlk tıklama/dokunma/tuş ile tarayıcının ses izin şartını karşıla.
        document.addEventListener('pointerdown', firstInteraction, { once: true, capture: true });
        document.addEventListener('keydown', firstInteraction, { once: true, capture: true });

        // Konumu periyodik olarak sakla; sayfa değişiminde kaldığı yer korunur.
        window.setInterval(function () {
            if (musicEnabled()) savePosition();
        }, 2000);

        window.addEventListener('pagehide', savePosition);
        window.addEventListener('beforeunload', savePosition);
    });
})();
