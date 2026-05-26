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


// --- LOGIKA NAVIGASI MENU SIDEBAR (SPA) - VERSI FIX GRAPH BLANK ---
function switchPage(pageId, element) {
    const pages = document.querySelectorAll('.page-section');
    pages.forEach(page => { page.style.display = 'none'; });

    const activePage = document.getElementById(`page-${pageId}`);
    if (activePage) { 
        activePage.style.display = 'block'; 
    }

    const menuItems = document.querySelectorAll('.nav-item');
    menuItems.forEach(item => { item.classList.remove('active'); });
    element.classList.add('active');
     
    // TRICK UTAMA: Jika user masuk ke dashboard, gambar ulang grafiknya secara instan!
    if (pageId === 'dashboard') {
        // Beri jeda 50ms agar browser selesai mengubah display: none menjadi block terlebih dahulu
        setTimeout(inisialisasiGrafik, 50); 
    }

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

// --- LOGIKA EMULASI GABUNGAN GRAFIK (TRENDLINE & DONUT) ---
function inisialisasiGrafik() {
    // 1. INISIALISASI YIELD TRENDLINE CHART
    const elemenLineChart = document.querySelector("#yieldChart");
    if (elemenLineChart) {
        const lineOptions = {
            series: [{
                name: "Yield Earnings",
                data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 142]
            }],
            chart: {
                type: 'area',
                height: 240,
                width: '100%',
                toolbar: { show: false },
                background: 'transparent'
            },
            colors: ['#22d3ee'],
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
            stroke: { curve: 'smooth', width: 3 },
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
            tooltip: { theme: 'dark' }
        };
        elemenLineChart.innerHTML = "";
        const lineChart = new ApexCharts(elemenLineChart, lineOptions);
        lineChart.render();
    }

    // 2. INISIALISASI ASSET ALLOCATION DONUT CHART
    const elemenDonutChart = document.querySelector("#assetDonutChart");
    if (elemenDonutChart) {
        const donutOptions = {
            // Persentase porsi masing-masing aset (Vaults, Governance, Wallet)
            series: [54.2, 25.8, 20.0], 
            chart: {
                type: 'donut',
                height: 160,
                background: 'transparent'
            },
            // Sembunyikan legenda bawaan ApexCharts karena kita sudah membuat legenda kustom di HTML bawahnya
            legend: { show: false }, 
            dataLabels: { enabled: false },
            // Mencocokkan warna neon dengan tema dApp PROVIZTO Anda
            colors: ['#a855f7', '#22d3ee', '#3b82f6'], 
            stroke: {
                show: true,
                colors: ['#0f131c'], // Memberikan batas pemisah gelap antar potongan donut
                width: 3
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%', // Ketebalan lingkaran donut
                        background: 'transparent',
                        labels: {
                            show: true,
                            name: { show: false },
                            value: {
                                show: true,
                                fontSize: '16px',
                                fontWeight: '700',
                                color: '#ffffff',
                                offsetY: 5,
                                formatter: function (val) { return val + "%"; }
                            }
                        }
                    }
                }
            },
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: function (val) { return val + "% of Portfolio"; }
                }
            },
            // Menentukan label saat kursor diarahkan ke potongan donut
            labels: ['Vaults Optimizer', 'veVZT Governance', 'Wallet Liquid']
        };
        elemenDonutChart.innerHTML = "";
        const donutChart = new ApexCharts(elemenDonutChart, donutOptions);
        donutChart.render();
    }
}

// Menjaga agar pemanggilan fungsi grafik tetap aman dan anti-blank saat refresh
if (document.readyState === "complete" || document.readyState === "interactive") {
    inisialisasiGrafik();
} else {
    document.addEventListener("DOMContentLoaded", inisialisasiGrafik);
}

// --- JALAN PINTAS LOGIKA SWAP (ANTI-GAGAL) ---
function aktifkanFiturSwap() {
    const inFrom = document.getElementById('swapInputFrom');
    const inTo = document.getElementById('swapInputTo');
    const lblFrom = document.getElementById('swapLabelFrom');
    const lblTo = document.getElementById('swapLabelTo');
    const btnRev = document.getElementById('btnReverseSwap');

    if (!inFrom || !inTo) return; // Mencegah error jika element belum ada

    const KURS = 3450;
    let isEthToUsdc = true;

    // Fungsi hitung instan
    inFrom.oninput = function() {
        let val = parseFloat(inFrom.value);
        if (isNaN(val) || val <= 0) {
            inTo.value = "";
            return;
        }
        
        if (isEthToUsdc) {
            inTo.value = (val * KURS).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
            inTo.value = (val / KURS).toFixed(5);
        }
    };

    // Fungsi klik balik posisi token
    if (btnRev) {
        btnRev.onclick = function(e) {
            e.preventDefault(); // Mencegah halaman reload otomatis
            isEthToUsdc = !isEthToUsdc;

            if (isEthToUsdc) {
                lblFrom.innerText = "ETH";
                lblTo.innerText = "USDC";
                btnRev.innerText = "⬇";
            } else {
                lblFrom.innerText = "USDC";
                lblTo.innerText = "ETH";
                btnRev.innerText = "⬆";
            }

            // Tukar angka nilainya
            inFrom.value = inTo.value.replace(/,/g, '');
            inFrom.dispatchEvent(new Event('input')); // Paksa hitung ulang
        };
    }
}

// Jalankan paksa tanpa menunggu DOMContentLoaded jika browser lambat
setTimeout(aktifkanFiturSwap, 500);

// 1. Data Token Internal Platform Provizto
const tokenList = [
  { symbol: "ETH", name: "Ethereum", address: "0x0000000000000000000000000000000000000000" },
  { symbol: "USDC", name: "USD Coin", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bda02913" },
  { symbol: "USDt", name: "Tether USD", address: "0x50c5771a796635218ee92c92a401697e113a936d" },
  { symbol: "WETH", name: "Wrapped Ether", address: "0x4200000000000000000000000000000000000006" },
  { symbol: "VZT", name: "Provizto Governance Token", address: "0x1234567890abcdef1234567890abcdef12345678" } // Ganti CA asli Anda nanti
];

let activeSelectionDirection = ""; // Mencatat apakah mengedit kolom 'from' atau 'to'

// 2. Fungsi Membuka Modal
function openTokenModal(direction) {
  activeSelectionDirection = direction;
  document.getElementById("tokenModal").style.display = "flex";
  document.getElementById("tokenSearchInput").value = ""; // Reset kolom pencarian
  renderTokenList(tokenList);
}

// 3. Fungsi Menutup Modal
function closeTokenModal() {
  document.getElementById("tokenModal").style.display = "none";
}

// 4. Fungsi Me-render Item Token ke dalam Modal
function renderTokenList(tokens) {
  const container = document.getElementById("tokenListContainer");
  container.innerHTML = ""; // Bersihkan daftar lama

  if(tokens.length === 0) {
    container.innerHTML = `<div style="color: #8b949e; text-align: center; padding: 20px;">No tokens found.</div>`;
    return;
  }

  tokens.forEach(token => {
    const row = document.createElement("div");
    row.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 5px; border-radius: 8px; cursor: pointer; transition: background 0.2s;";
    
    // Efek hover sederhana
    row.onmouseover = () => row.style.background = "#21262d";
    row.onmouseout = () => row.style.background = "transparent";
    
    // Ketika token dipilih
    row.onclick = () => selectToken(token.symbol);

    row.innerHTML = `
      <div>
        <strong style="color: white; display: block;">${token.symbol}</strong>
        <span style="color: #8b949e; font-size: 12px;">${token.name}</span>
      </div>
      <span style="color: #30363d; font-size: 11px;">${token.address.substring(0, 6)}...${token.address.substring(token.address.length - 4)}</span>
    `;
    container.appendChild(row);
  });
}

// 5. Fungsi Memilih Token & Mengupdate Tampilan Swap
function selectToken(symbol) {
  if (activeSelectionDirection === "from") {
    document.getElementById("fromTokenSymbol").innerText = symbol;
  } else if (activeSelectionDirection === "to") {
    document.getElementById("toTokenSymbol").innerText = symbol;
  }
  closeTokenModal();
}

// 6. Fungsi Pencarian (Filter Berdasarkan Simbol atau Alamat Kontrak)
function filterTokens() {
  const query = document.getElementById("tokenSearchInput").value.toLowerCase().trim();
  
  // Jika mendeteksi input adalah alamat kontrak penuh (0x + 40 karakter hex)
  if (query.startsWith("0x") && query.length === 42) {
    // Di sini nanti Anda bisa menyisipkan fungsi Web3/ethers.js untuk call contract secara dinamis.
    // Sementara kita filter dari list lokal:
    const exactMatch = tokenList.filter(t => t.address.toLowerCase() === query);
    renderTokenList(exactMatch);
    return;
  }

  // Pencarian reguler berdasarkan simbol atau nama
  const filtered = tokenList.filter(token => 
    token.symbol.toLowerCase().includes(query) || 
    token.name.toLowerCase().includes(query)
  );
  
  renderTokenList(filtered);
}

// Menutup modal jika pengguna mengklik area luar modal (overlay)
window.onclick = function(event) {
  const modal = document.getElementById("tokenModal");
  if (event.target === modal) {
    closeTokenModal();
  }
}
