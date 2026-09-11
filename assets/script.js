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
