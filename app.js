// --- AMBIL ELEMEN DOM ---
const btnConnectTrigger = document.getElementById('btnConnectTrigger');
const walletModal = document.getElementById('walletModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const walletConnectedStatus = document.getElementById('walletConnectedStatus');
const userAddress = document.getElementById('userAddress');
const btnDisconnect = document.getElementById('btnDisconnect');
const toast = document.getElementById('transactionToast');
 
const chkAgreeTerms = document.getElementById('chkAgreeTerms');
const walletOptions = document.querySelectorAll('.wallet-option-item');

// --- 1. LOGIKA INTERAKSI WALLET MODAL ---
btnConnectTrigger.addEventListener('click', () => {
    chkAgreeTerms.checked = false;
    walletOptions.forEach(opt => opt.classList.add('disabled-style'));
    walletModal.classList.remove('style-hidden');
});
 
btnCloseModal.addEventListener('click', () => walletModal.classList.add('style-hidden'));
walletModal.addEventListener('click', (e) => { if (e.target === walletModal) walletModal.classList.add('style-hidden'); });

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
        // Diganti menggunakan global window.event agar aman saat di-trigger dari oninput HTML
        let excess = total - 100;
        window.event.target.value = Math.max(0, parseInt(window.event.target.value) - excess);
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


// --- 6. LOGIKA NAVIGASI MENU SIDEBAR (SPA) ---
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


// --- 7. LOGIKA MENU HAMBURGER (RESPONSIF HP) ---
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

// --- LOGIKA ANTI-BLANK GRAFIK APEXCHARTS ---
function inisialisasiGrafik() {
    const elemenChart = document.querySelector("#yieldChart");
    
    // Validasi: Jika elemen tidak ditemukan di halaman aktif, jangan jalankan script agar tidak error
    if (!elemenChart) return;

    const options = {
        series: [{
            name: "Yield Earnings",
            data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 142]
        }],
        chart: {
            type: 'area',
            height: 240,
            width: '100%',
            toolbar: { show: false },
            background: 'transparent',
            animations: { enabled: true } // Animasi saat grafik muncul
        },
        colors: ['#22d3ee'], // Warna cyan dApp PROVIZTO
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.0,
                stops: [0, 90, 100]
            }
        },
        dataLabels: { enabled: false },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        grid: {
            borderColor: '#1e2533',
            strokeDashArray: 4,
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: true } }
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
            labels: { style: { colors: '#6b7280' } },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: {
                style: { colors: '#6b7280' },
                formatter: function (value) { return "$" + value; }
            }
        },
        tooltip: {
            theme: 'dark'
        }
    };

    // Reset isi kontainer terlebih dahulu sebelum di-render ulang (mencegah tumpang tindih)
    elemenChart.innerHTML = "";
    const chart = new ApexCharts(elemenChart, options);
    chart.render();
}

// Jalankan fungsi grafik setelah seluruh dokumen selesai dimuat secara sempurna
if (document.readyState === "complete" || document.readyState === "interactive") {
    inisialisasiGrafik();
} else {
    document.addEventListener("DOMContentLoaded", inisialisasiGrafik);
}
