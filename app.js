// ==========================================================================
// 1. IMPORT & INISIALISASI WALLETCONNECT (WEB3MODAL ES MODULES)
// ==========================================================================
import { createWeb3Modal, defaultWagmiConfig } from 'https://esm.sh/@web3modal/wagmi@3.5.0';
import { watchAccount } from 'https://esm.sh/@wagmi/core@2.0.0';
import { mainnet, polygon, bsc } from 'https://esm.sh/@wagmi/core/chains';

// Konfigurasi Project ID Anda (Dapatkan di https://cloud.walletconnect.com/)
const projectId = 'PASTE_YOUR_PROJECT_ID_HERE'; 

if (projectId === 'PASTE_YOUR_PROJECT_ID_HERE') {
    console.warn('Perhatian: Harap masukkan WalletConnect Project ID Anda agar tombol berfungsi.');
}

// Tentukan Blockchain yang didukung oleh DeFi Anda
const chains = [mainnet, polygon, bsc];
 
// Metadata Aplikasi yang muncul di layar HP user saat scan/pairing
const metadata = {
    name: 'vVZT DeFi Platform',
    description: 'DEX, Vaults, Governance and Affiliate Protocol',
    url: window.location.origin,
    icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// Inisialisasi Modal Utama Web3Modal
const modal = createWeb3Modal({
    wagmiConfig,
    projectId,
    chains,
    themeMode: 'dark', // Menyesuaikan tema gelap PROVIZTO
    themeVariables: {
        '--w3m-accent': '#3861fb', // Warna aksen utama
        '--w3m-border-radius-master': '12px'
    }
});


// ==========================================================================
// 2. LOGIKA INTEGRASI INTERFASE WALLET / DOM
// ==========================================================================
const connectBtn = document.getElementById('connect-btn');
const walletInfoDiv = document.getElementById('wallet-info');
const walletAddressSpan = document.getElementById('wallet-address');
const chainIdSpan = document.getElementById('chain-id');
const manageBtn = document.getElementById('btnDisconnectTrigger');

// Fungsi untuk mempersingkat alamat wallet (Contoh: 0x1234...abcd)
function truncateAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Menghubungkan fungsi klik tombol ke Modal Web3
if (connectBtn) {
    connectBtn.addEventListener('click', () => modal.open());
}
if (manageBtn) {
    manageBtn.addEventListener('click', () => modal.open());
}

// Watcher: Memantau perubahan status wallet secara Real-Time
watchAccount(wagmiConfig, {
    onChange(account) {
        if (account.isConnected) {
            // Update UI saat terkoneksi
            if (connectBtn) connectBtn.style.display = 'none';
            if (walletAddressSpan) walletAddressSpan.innerText = truncateAddress(account.address);
            if (chainIdSpan) chainIdSpan.innerText = account.chainId || '-';
            if (walletInfoDiv) walletInfoDiv.style.display = 'flex';
            
            console.log("Wallet Terhubung:", account.address);
        } else {
            // Reset UI jika disconnect
            if (connectBtn) connectBtn.style.display = 'block';
            if (walletInfoDiv) walletInfoDiv.style.display = 'none';
            
            console.log("Wallet Terputus");
        }
    }
});


// ==========================================================================
// 3. LOGIKA PERHITUNGAN GAUGE VOTING
// ==========================================================================
window.calculateTotalVotes = function() {
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
        if (event && event.target) {
            event.target.value = Math.max(0, parseInt(event.target.value) - excess);
        }
        total = 100;
    }

    if (totalText) totalText.innerText = total;
    if (progressFill) progressFill.style.width = total + '%';
};


// ==========================================================================
// 4. LOGIKA TOAST NOTIFIKASI
// ==========================================================================
function showNotification() {
    const toast = document.getElementById('transactionToast'); // Menyelaraskan ID dengan 'transactionToast' di HTML integrasi
    if (toast) {
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 4000);
    }
}
 
// Pemasangan Event Listener Notifikasi secara aman (Safe Check)
const bindNotification = (id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', showNotification);
};

bindNotification('executeBtn');
bindNotification('claimBtn');
bindNotification('swapActionBtn');
bindNotification('submitVotesBtn');

document.querySelectorAll('.id-vault-btn').forEach(btn => {
    btn.addEventListener('click', showNotification);
});


// ==========================================================================
// 5. LOGIKA PENGALIHAN DUA BAHASA (EN/ID)
// ==========================================================================
const langSwitcher = document.getElementById('appLangSwitcher');
if (langSwitcher) {
    langSwitcher.addEventListener('change', function(e) {
        const appNode = document.getElementById('appNode');
        if (appNode) appNode.setAttribute('lang', e.target.value);
    });
}


// ==========================================================================
// 6. SELEKSI TOMBOL DURASI
// ==========================================================================
const durationBtns = document.querySelectorAll('.duration-btn');
durationBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        durationBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});


// ==========================================================================
// 7. LOGIKA NAVIGASI MENU SIDEBAR (SPA / SINGLE PAGE APPLICATION)
// ==========================================================================
window.switchPage = function(pageId, element) {
    const pages = document.querySelectorAll('.page-section');
    pages.forEach(page => { page.style.display = 'none'; });

    const activePage = document.getElementById(`page-${pageId}`);
    if (activePage) { activePage.style.display = 'block'; }

    const menuItems = document.querySelectorAll('.nav-item');
    menuItems.forEach(item => { item.classList.remove('active'); });

    if (element) {
        element.classList.add('active');
    }
    
    if (window.innerWidth <= 768) toggleMobileMenu();
    
    // Integrasi langsung pemicu re-render grafik portofolio saat kembali ke dashboard
    if (pageId === 'dashboard') {
        setTimeout(renderPortfolioChart, 50); 
    }
};


// ==========================================================================
// 8. LOGIKA MENU HAMBURGER (RESPONSIF SMARTPHONE)
// ==========================================================================
const menuToggleBtn = document.getElementById('menuToggleBtn');
const appSidebar = document.getElementById('appSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function toggleMobileMenu() {
    if (!appSidebar || !sidebarOverlay || !menuToggleBtn) return;
    
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

if (menuToggleBtn) menuToggleBtn.addEventListener('click', toggleMobileMenu);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleMobileMenu);


// ==========================================================================
// 9. PERBAIKAN LOGIKA GRAFIK PORTOFOLIO RESPONSIF (CANVAS RENDERING)
// ==========================================================================
function renderPortfolioChart() {
    const canvas = document.getElementById('portfolioChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    
    // Ambil ukuran boks pembungkus asli secara real-time
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Menangani kerapatan piksel layar HP agar grafik tajam
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    // Titik koordinat proporsional berdasarkan lebar layar dinamis
    const points = [
        {x: 0, y: height * 0.8}, 
        {x: width * 0.15, y: height * 0.75}, 
        {x: width * 0.3, y: height * 0.78}, 
        {x: width * 0.45, y: height * 0.5}, 
        {x: width * 0.6, y: height * 0.6}, 
        {x: width * 0.8, y: height * 0.35}, 
        {x: width, y: height * 0.15}
    ];

    ctx.clearRect(0, 0, width, height);

    // Garis Pandu Horizontal (Grid)
    ctx.strokeStyle = 'rgba(30, 37, 51, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (height / 4) * i);
        ctx.lineTo(width, (height / 4) * i);
        ctx.stroke();
    }

    // Gradasi Area Bawah Grafik (Glow Fill)
    const gradientFill = ctx.createLinearGradient(0, 0, 0, height);
    gradientFill.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
    gradientFill.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, height);
    points.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.lineTo(points[points.length - 1].x, height);
    ctx.closePath();
    ctx.fillStyle = gradientFill;
    ctx.fill();

    // Garis Tren Utama
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for(let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Pin Bulatan Akhir
    const lastPt = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(lastPt.x - 2, lastPt.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#22d3ee';
    ctx.fill();
}

// Event trigger pemuatan & perubahan ukuran layar untuk chart
window.addEventListener('load', renderPortfolioChart);
window.addEventListener('resize', renderPortfolioChart);
