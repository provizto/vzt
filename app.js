// --- AMBIL ELEMEN DOM ---
const btnConnectTrigger = document.getElementById('btnConnectTrigger');
const walletModal = document.getElementById('walletModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const walletConnectedStatus = document.getElementById('walletConnectedStatus');
const userAddress = document.getElementById('userAddress');
const btnDisconnect = document.getElementById('btnDisconnect');
const toast = document.getElementById('transactionToast');
 
// Elemen Validasi Checkbox Terms
const chkAgreeTerms = document.getElementById('chkAgreeTerms');
const walletOptions = document.querySelectorAll('.wallet-option-item');

// --- 1. LOGIKA INTERAKSI WALLET MODAL ---
btnConnectTrigger.addEventListener('click', () => {
    chkAgreeTerms.checked = false;
    walletOptions.forEach(opt => opt.classList.add('disabled-style'));
    walletModal.classList.remove('style-hidden');
});
 
btnCloseModal.addEventListener('click', () => walletModal.classList.add('style-hidden'));
walletModal.addEventListener('click', (e) => { 
    if (e.target === walletModal) walletModal.classList.add('style-hidden'); 
});

// Listener Checkbox Syarat & Ketentuan Modal
chkAgreeTerms.addEventListener('change', function() {
    if (this.checked) {
        walletOptions.forEach(opt => opt.classList.remove('disabled-style'));
    } else {
        walletOptions.forEach(opt => opt.classList.add('disabled-style'));
    }
});

function toggleWalletUI(isConnected, address = "") {
    if (isConnected) {
        btnConnectTrigger.classList.add('style-hidden');
        walletConnectedStatus.classList.remove('style-hidden');
        userAddress.innerText = address.substring(0, 6) + "..." + address.substring(address.length - 4);
    } else {
        btnConnectTrigger.classList.remove('style-hidden');
        walletConnectedStatus.classList.add('style-hidden');
    }
}

function executeWalletConnection(walletType, dummyAddress) {
    walletModal.classList.add('style-hidden');
    toggleWalletUI(true, dummyAddress);
    showNotification();
}

// Penanganan Klik Wallet Opsi Koneksi
document.getElementById('optSmartAccount').addEventListener('click', function(e) {
    if (chkAgreeTerms.checked) {
        executeWalletConnection("Smart Account", "0x71C231271f3b141151955F7a5c1A55f14A3B3a90");
    }
});
document.getElementById('optMetaMask').addEventListener('click', function(e) {
    if (chkAgreeTerms.checked) {
        executeWalletConnection("MetaMask", "0x9E59A83b0B286d528bBAf38A1a65Cc68F019058b");
    }
});
document.getElementById('optWalletConnect').addEventListener('click', function(e) {
    if (chkAgreeTerms.checked) {
        executeWalletConnection("WalletConnect", "0x3Fbc5601aCc8B928aA638fdf9872f2E908ba009a");
    }
});
btnDisconnect.addEventListener('click', () => toggleWalletUI(false));


// --- 2. LOGIKA PERHITUNGAN GAUGE VOTING ---
function calculateTotalVotes() {
    const inputs = document.querySelectorAll('.gauge-input');
    const progressFill = document.getElementById('govProgressBar');
    const totalText = document.getElementById('totalAllocatedPercent');
    
    let total = 0;
    inputs.forEach(input => {
        let value = parseInt(input.value) || 0;
        if (value < 0) value = 0;
        if (value > 100) value = 100;
        total += value;
    });

    if (total > 100) {
        alert("Total alokasi melebihi 100%! Sistem otomatis membatasi nilai.");
        let excess = total - 100;
        event.target.value = Math.max(0, parseInt(event.target.value) - excess);
        total = 100;
    }

    totalText.innerText = total;
    progressFill.style.width = total + '%';
}


// --- 3. LOGIKA TOAST NOTIFIKASI ---
function showNotification() {
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 4000);
}
 
document.getElementById('executeBtn').addEventListener('click', showNotification);
document.getElementById('claimBtn').addEventListener('click', showNotification);
document.getElementById('swapActionBtn').addEventListener('click', showNotification);
document.getElementById('submitVotesBtn').addEventListener('click', showNotification);
document.querySelectorAll('.id-vault-btn').forEach(btn => btn.addEventListener('click', showNotification));


// --- 4. LOGIKA PENGALIHAN DUA BAHASA (EN/ID) ---
document.getElementById('appLangSwitcher').addEventListener('change', function(e) {
    document.getElementById('appNode').setAttribute('lang', e.target.value);
});


// --- 5. SELEKSI TOMBOL DURASI ---
const durationBtns = document.querySelectorAll('.duration-btn');
durationBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        durationBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});


// --- 6. LOGIKA NAVIGASI MENU SIDEBAR (SPA / SINGLE PAGE APPLICATION) ---
function switchPage(pageId, element) {
    const pages = document.querySelectorAll('.page-section');
    pages.forEach(page => { page.style.display = 'none'; });

    const activePage = document.getElementById(`page-${pageId}`);
    if (activePage) { activePage.style.display = 'block'; }

    const menuItems = document.querySelectorAll('.nav-item');
    menuItems.forEach(item => { item.classList.remove('active'); });

    if (element) {
        element.classList.add('active');
    }
    
    if(window.innerWidth <= 768) toggleMobileMenu();
}


// --- 7. LOGIKA MENU HAMBURGER (RESPONSIF SMARTPHONE) ---
const menuToggleBtn = document.getElementById('menuToggleBtn');
const appSidebar = document.getElementById('appSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function toggleMobileMenu() {
    const isOpen = appSidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('active');
    if (isOpen) {
        menuToggleBtn.innerHTML = '✕';
        menuToggleBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)';
    } else {
        menuToggleBtn.innerHTML = '☰';
        menuToggleBtn.style.background = 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)';
    }
}
menuToggleBtn.addEventListener('click', toggleMobileMenu);
sidebarOverlay.addEventListener('click', toggleMobileMenu);

// --- LOGIKA EMULATOR GRAFIK PORTOFOLIO (MENGGUNAKAN CANVAS API MURNI) ---
function renderPortfolioChart() {
    const canvas = document.getElementById('portfolioChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Mengatur responsivitas ukuran canvas boks internal
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 300 * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = 280;

    // Titik poin koordinat simulasi data portofolio (tren naik)
    const points = [
        {x: 0, y: 220}, {x: width * 0.15, y: 200}, {x: width * 0.3, y: 210}, 
        {x: width * 0.45, y: 150}, {x: width * 0.6, y: 170}, {x: width * 0.8, y: 110}, 
        {x: width, y: 40}
    ];

    ctx.clearRect(0, 0, width, height);

    // 1. Gambar Garis Belakang Grid Horizontal Helper
    ctx.strokeStyle = 'rgba(30, 37, 51, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (height / 5) * i);
        ctx.lineTo(width, (height / 5) * i);
        ctx.stroke();
    }

    // 2. Gambar Efek Gradasi Area Bawah Garis Tren (Glow Fill)
    const gradientFill = ctx.createLinearGradient(0, 0, 0, height);
    gradientFill.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
    gradientFill.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, height);
    points.forEach(pt => ctx.lineTo(pt.x, pt.ptY ? pt.ptY : pt.y));
    ctx.lineTo(points[points.length - 1].x, height);
    ctx.closePath();
    ctx.fillStyle = gradientFill;
    ctx.fill();

    // 3. Gambar Garis Tren Utama (Stroke Line)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for(let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // 4. Gambar Pin Point Bulatan di Ujung Tren Terakhir
    const lastPt = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(lastPt.x - 4, lastPt.y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#22d3ee';
    ctx.fill();
}

// Jalankan fungsi penggambaran grafik otomatis saat halaman web dimuat pertama kali
window.addEventListener('load', () => {
    renderPortfolioChart();
});

// Jalankan ulang penggambaran grafik apabila user mengubah ukuran resolusi monitor/HP browser
window.addEventListener('resize', renderPortfolioChart);


// --- MODIFIKASI FUNGSI SWITCHPAGE SPA ---
// Pastikan fungsi switchPage Anda memicu re-render grafik saat halaman 'dashboard' diakses kembali oleh pengguna
const originalSwitchPage = switchPage;
switchPage = function(pageId, element) {
    originalSwitchPage(pageId, element);
    if (pageId === 'dashboard') {
        // Berikan sedikit jeda waktu render agar transisi dimensi boks halaman selesai dimuat sempurna
        setTimeout(renderPortfolioChart, 50); 
    }
};
