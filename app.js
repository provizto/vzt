// --- CONFIGURATION URL ---
const DAPP_URL = "https://zoniqfi.com"; 

// --- GLOBAL WEB3 STATE VARIABLES ---
let web3Provider = null;
let connectedWalletAddress = null;

// --- AMBIL ELEMEN DOM ---
const btnConnectTrigger = document.getElementById('btnConnectTrigger');
const walletModal = document.getElementById('walletModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const walletConnectedStatus = document.getElementById('walletConnectedStatus');
const userAddress = document.getElementById('userAddress');
const btnDisconnect = document.getElementById('btnDisconnect');
const toast = document.getElementById('transactionToast');
 
// Komponen Gate-Locking Konten Utama dApp
const lockoutScreen = document.getElementById('lockoutScreen');
const authenticatedContent = document.getElementById('authenticatedContent');

// Elemen Disclaimer Interlock Popup
const disclaimerModal = document.getElementById('disclaimerModal');
const chkAgreeDisclaimer = document.getElementById('chkAgreeDisclaimer');
const btnDisclaimerCancel = document.getElementById('btnDisclaimerCancel');
const btnDisclaimerAccept = document.getElementById('btnDisclaimerAccept');
 
// Elemen Geofencing
const geofenceBlocker = document.getElementById('geofenceBlocker');

function isMobileDevice() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// ==========================================================================
// LANGKAH 1: DETEKSI GEOFENCING (LATAR BELAKANG)
// ==========================================================================
async function runGeofenceInspection() {
    const BANNED_REGIONS = ['US', 'CN']; // Amerika Serikat & Tiongkok
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (BANNED_REGIONS.includes(data.country_code)) {
            geofenceBlocker.classList.remove('style-hidden');
            lockoutScreen.classList.add('style-hidden');
            btnConnectTrigger.disabled = true;
        }
    } catch (error) {
        console.warn("Geofencing verification bypassed due to connectivity drop:", error);
    }
}
// Jalankan pemeriksaan geofence saat dApp dibuka
runGeofenceInspection();

// ==========================================================================
// LANGKAH 2 & 3: INTERLOCK LOGIC POP-UP DISCLAIMER & WALLET SELECT
// ==========================================================================
function triggerWalletFlow() {
    if (localStorage.getItem('zoniqfi_legal_accepted') === 'true') {
        walletModal.classList.remove('style-hidden');
    } else {
        disclaimerModal.classList.remove('style-hidden');
    }
}

btnConnectTrigger.addEventListener('click', triggerWalletFlow);

chkAgreeDisclaimer.addEventListener('change', (e) => {
    btnDisclaimerAccept.disabled = !e.target.checked;
});

btnDisclaimerCancel.addEventListener('click', () => {
    disclaimerModal.classList.add('style-hidden');
    chkAgreeDisclaimer.checked = false;
    btnDisclaimerAccept.disabled = true;
});

btnDisclaimerAccept.addEventListener('click', () => {
    localStorage.setItem('zoniqfi_legal_accepted', 'true');
    disclaimerModal.classList.add('style-hidden');
    walletModal.classList.remove('style-hidden');
});

btnCloseModal.addEventListener('click', () => walletModal.classList.add('style-hidden'));
walletModal.addEventListener('click', (e) => { if (e.target === walletModal) walletModal.classList.add('style-hidden'); });

// ==========================================================================
// LANGKAH 4 & 5: KONEKSI WEB3 ASLI & TANDA TANGAN PESAN KRIPTOGRAFIS (ETHERS.JS)
// ==========================================================================
async function connectInjectedExtension() {
    if (!window.ethereum) {
        alert("Web3 Wallet browser extension not detected. Please install MetaMask or Trust Wallet extension.");
        return;
    }

    try {
        // Inisialisasi Ethers v6 Browser Provider
        const provider = new ethers.BrowserProvider(window.ethereum);
        // Memicu jendela pop-up otorisasi akses alamat dompet
        const accounts = await provider.send("eth_requestAccounts", []);
        const currentAddress = accounts[0];

        const signer = await provider.getSigner();
        const currentTimestamp = new Date().toISOString();

        // Rumusan Teks Pesan Legal Ramah Pengguna dApp ZoniqFi
        const challengeMessage = `Welcome to ZoniqFi!\n\nPlease sign this message to verify ownership of this wallet and accept our Terms of Service.\n\nThis request will not cost any gas fees.\n\nWallet: ${currentAddress}\nTimestamp: ${currentTimestamp}`;

        // Proses Eksekusi Penandatanganan Kriptografi (0 Gas Fee)
        const cryptographicSignature = await signer.signMessage(challengeMessage);
        
        console.log("Verified Signature Session:", cryptographicSignature);

        // Sukses Verifikasi, Ubah Tampilan Antarmuka dApp
        web3Provider = provider;
        connectedWalletAddress = currentAddress;
        
        walletModal.classList.add('style-hidden');
        toggleWalletUI(true, currentAddress);
        showNotification();

    } catch (error) {
        console.error("Web3 Authentication Flow Aborted:", error);
        alert("Autentikasi Dompet Gagal: Pengguna membatalkan proses verifikasi tanda tangan.");
    }
}

// Mengganti UI Status setelah Berhasil Terhubung
function toggleWalletUI(isConnected, address = "") {
    if (isConnected) {
        btnConnectTrigger.classList.add('style-hidden');
        walletConnectedStatus.classList.remove('style-hidden');
        userAddress.innerText = address.substring(0, 6) + "..." + address.substring(address.length - 4);
        
        // Membuka akses penuh dasbor platform dApp
        lockoutScreen.classList.add('style-hidden');
        authenticatedContent.classList.remove('style-hidden');
    } else {
        btnConnectTrigger.classList.remove('style-hidden');
        walletConnectedStatus.classList.add('style-hidden');
        
        // Mengunci kembali akses dasbor platform dApp
        lockoutScreen.classList.remove('style-hidden');
        authenticatedContent.classList.add('style-hidden');
    }
}

// --- MAP EVENT LISTENER TOMBOL PILIHAN DOMPET ---
document.getElementById('optMetaMask').addEventListener('click', () => {
    if (isMobileDevice()) {
        const cleanUrl = DAPP_URL.replace(/^https?:\/\//, '');
        window.open(`https://metamask.app.link/dapp/${cleanUrl}`, '_blank');
        walletModal.classList.add('style-hidden');
    } else {
        connectInjectedExtension();
    }
});

// Opsi Dompet Lainnya
document.getElementById('optSmartAccount').addEventListener('click', connectInjectedExtension);
document.getElementById('optTrustWallet').addEventListener('click', () => {
    if (isMobileDevice()) {
        const encodedUrl = encodeURIComponent(DAPP_URL);
        window.open(`https://link.trustwallet.com/open_url?url=${encodedUrl}`, '_blank');
        walletModal.classList.add('style-hidden');
    } else {
        connectInjectedExtension();
    }
});
document.getElementById('optWalletConnect').addEventListener('click', () => {
    if (isMobileDevice()) {
        window.location.href = "wc:00e4735a3d73d6115482b881@2?bridge=https%3A%2F%2Fwalletconnect.zoniqfi.com";
        walletModal.classList.add('style-hidden');
    } else {
        connectInjectedExtension();
    }
});

// PUTUSKAN KONEKSI DOMPET (Siklus Keamanan Hukum Reset)
btnDisconnect.addEventListener('click', () => {
    localStorage.removeItem('zoniqfi_legal_accepted');
    chkAgreeDisclaimer.checked = false;
    btnDisclaimerAccept.disabled = true;
    web3Provider = null;
    connectedWalletAddress = null;
    toggleWalletUI(false);
});

// ==========================================================================
// 2. LOGIKA PERHITUNGAN GAUGE VOTING
// ==========================================================================
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

// ==========================================================================
// 3. LOGIKA TOAST NOTIFIKASI
// ==========================================================================
function showNotification() {
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 4000);
}

document.getElementById('executeBtn').addEventListener('click', showNotification);
document.getElementById('claimBtn').addEventListener('click', showNotification);
document.getElementById('swapActionBtn').addEventListener('click', showNotification);
document.getElementById('submitVotesBtn').addEventListener('click', showNotification);
document.querySelectorAll('.id-vault-btn').forEach(btn => btn.addEventListener('click', showNotification));

// ==========================================================================
// 4. LOGIKA PENGALIHAN DUA BAHASA (EN/ID)
// ==========================================================================
document.getElementById('appLangSwitcher').addEventListener('change', function(e) {
    document.getElementById('appNode').setAttribute('lang', e.target.value);
});

// ==========================================================================
// 5. SELEKSI TOMBOL DURASI
// ==========================================================================
const durationBtns = document.querySelectorAll('.duration-btn');
durationBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        durationBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

// ==========================================================================
// 6. LOGIKA NAVIGASI MENU SIDEBAR (SPA)
// ==========================================================================
function switchPage(pageId, element) {
    const pages = document.querySelectorAll('.page-section');
    pages.forEach(page => { page.style.display = 'none'; });

    const activePage = document.getElementById(`page-${pageId}`);
    if (activePage) { activePage.style.display = 'block'; }

    const menuItems = document.querySelectorAll('.nav-item');
    menuItems.forEach(item => { item.classList.remove('active'); });
    element.classList.add('active');
    
    if(window.innerWidth <= 768) toggleMobileMenu();
}

// ==========================================================================
// 7. LOGIKA MENU HAMBURGER (RESPONSIF HP)
// ==========================================================================
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
