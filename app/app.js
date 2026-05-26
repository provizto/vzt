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
if (btnConnectTrigger) {
    btnConnectTrigger.addEventListener('click', () => {
        if (chkAgreeTerms) chkAgreeTerms.checked = false;
        walletOptions.forEach(opt => opt.classList.add('disabled-style'));
        if (walletModal) walletModal.classList.remove('style-hidden');
    });
}
 
if (btnCloseModal && walletModal) {
    btnCloseModal.addEventListener('click', () => walletModal.classList.add('style-hidden'));
}

if (chkAgreeTerms) {
    chkAgreeTerms.addEventListener('change', function() {
        if (this.checked) {
            walletOptions.forEach(opt => opt.classList.remove('disabled-style'));
        } else {
            walletOptions.forEach(opt => opt.classList.add('disabled-style'));
        }
    });
}

function toggleWalletUI(isConnected, address = "") {
    if (!btnConnectTrigger || !walletConnectedStatus || !userAddress) return;
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
    if (walletModal) walletModal.classList.add('style-hidden');
    toggleWalletUI(true, dummyAddress);
    showNotification();
}

// Helper untuk klik opsi wallet dengan aman
const bindWalletOption = (id, type, address) => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('click', function() {
            if (chkAgreeTerms && chkAgreeTerms.checked) {
                executeWalletConnection(type, address);
            }
        });
    }
};
bindWalletOption('optSmartAccount', "Smart Account", "0x71C231271f3b141151955F7a5c1A55f14A3B3a90");
bindWalletOption('optMetaMask', "MetaMask", "0x9E59A83b0B286d528bBAf38A1a65Cc68F019058b");
bindWalletOption('optWalletConnect', "WalletConnect", "0x3Fbc5601aCc8B928aA638fdf9872f2E908ba009a");

if (btnDisconnect) {
    btnDisconnect.addEventListener('click', () => toggleWalletUI(false));
}


// --- 2. LOGIKA PERHITUNGAN GAUGE VOTING ---
function calculateTotalVotes(e) {
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

    if (total > 100 && e && e.target) {
        alert("Total allocation exceeds 100%! The system has automatically capped the value.");
        let excess = total - 100;
        e.target.value = Math.max(0, parseInt(e.target.value) - excess);
        total = 100;
    }

    if (totalText) totalText.innerText = total;
    if (progressFill) progressFill.style.width = total + '%';
}


// --- 3. LOGIKA TOAST NOTIFIKASI ---
function showNotification() {
    if (!toast) return;
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 4000);
}
 
// Pengecekan elemen aman sebelum menambahkan Event Listener toast
const safeBindClick = (id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', showNotification);
};
safeBindClick('executeBtn');
safeBindClick('claimBtn');
safeBindClick('swapActionBtn');
safeBindClick('submitVotesBtn');
document.querySelectorAll('.id-vault-btn').forEach(btn => btn.addEventListener('click', showNotification));


// --- 4. LOGIKA PENGALIHAN DUA BAHASA (EN/ID) ---
const langSwitcher = document.getElementById('appLangSwitcher');
if (langSwitcher) {
    langSwitcher.addEventListener('change', function(e) {
        const appNode = document.getElementById('appNode');
        if (appNode) appNode.setAttribute('lang', e.target.value);
    });
}


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
    if (element) element.classList.add('active');
     
    if (pageId === 'dashboard') {
        setTimeout(inisialisasiGrafik, 50); 
    }

    if(window.innerWidth <= 768) toggleMobileMenu();
}


// --- 7. LOGIKA MENU HAMBURGER (RESPONSIF HP) ---
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


// --- LOGIKA EMULASI GABUNGAN GRAFIK (TRENDLINE & DONUT) ---
function inisialisasiGrafik() {
    // 1. INISIALISASI YIELD TRENDLINE CHART
    const elemenLineChart = document.querySelector("#yieldChart");
    if (elemenLineChart && typeof ApexCharts !== 'undefined') {
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
    if (elemenDonutChart && typeof ApexCharts !== 'undefined') {
        const donutOptions = {
            series: [54.2, 25.8, 20.0], 
            chart: {
                type: 'donut',
                height: 160,
                background: 'transparent'
            },
            legend: { show: false }, 
            dataLabels: { enabled: false },
            colors: ['#a855f7', '#22d3ee', '#3b82f6'], 
            stroke: {
                show: true,
                colors: ['#0f131c'], 
                width: 3
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%', 
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
            labels: ['Vaults Optimizer', 'veVZT Governance', 'Wallet Liquid']
        };
        elemenDonutChart.innerHTML = "";
        const donutChart = new ApexCharts(elemenDonutChart, donutOptions);
        donutChart.render();
    }
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    inisialisasiGrafik();
} else {
    document.addEventListener("DOMContentLoaded", inisialisasiGrafik);
}


// --- JALAN PINTAS LOGIKA SWAP ---
function aktifkanFiturSwap() {
    const inFrom = document.getElementById('swapInputFrom');
    const inTo = document.getElementById('swapInputTo');
    const lblFrom = document.getElementById('swapLabelFrom');
    const lblTo = document.getElementById('swapLabelTo');
    const btnRev = document.getElementById('btnReverseSwap');

    if (!inFrom || !inTo) return; 

    const KURS = 3450;
    let isEthToUsdc = true;

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

    if (btnRev) {
        btnRev.onclick = function(e) {
            e.preventDefault(); 
            isEthToUsdc = !isEthToUsdc;

            if (isEthToUsdc) {
                if (lblFrom) lblFrom.innerText = "ETH";
                if (lblTo) lblTo.innerText = "USDC";
                btnRev.innerText = "⬇";
            } else {
                if (lblFrom) lblFrom.innerText = "USDC";
                if (lblTo) lblTo.innerText = "ETH";
                btnRev.innerText = "⬆";
            }

            inFrom.value = inTo.value.replace(/,/g, '');
            inFrom.dispatchEvent(new Event('input')); 
        };
    }
}
setTimeout(aktifkanFiturSwap, 500);


// --- LOGIKA MODAL SELEKSI TOKEN (PROVIZTO EKOSISTEM) ---
const tokenList = [
  { symbol: "ETH", name: "Ethereum", address: "0x0000000000000000000000000000000000000000" },
  { symbol: "USDC", name: "USD Coin", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bda02913" },
  { symbol: "USDt", name: "Tether USD", address: "0x50c5771a796635218ee92c92a401697e113a936d" },
  { symbol: "WETH", name: "Wrapped Ether", address: "0x4200000000000000000000000000000000000006" },
  { symbol: "VZT", name: "Provizto Governance Token", address: "0x1234567890abcdef1234567890abcdef12345678" }
];

let activeSelectionDirection = ""; 

function openTokenModal(direction) {
  activeSelectionDirection = direction;
  const tModal = document.getElementById("tokenModal");
  if (tModal) tModal.style.display = "flex";
  const sInput = document.getElementById("tokenSearchInput");
  if (sInput) sInput.value = ""; 
  renderTokenList(tokenList);
}

function closeTokenModal() {
  const tModal = document.getElementById("tokenModal");
  if (tModal) tModal.style.display = "none";
}

function renderTokenList(tokens) {
  const container = document.getElementById("tokenListContainer");
  if (!container) return;
  container.innerHTML = ""; 

  if(tokens.length === 0) {
    container.innerHTML = `<div style="color: #8b949e; text-align: center; padding: 20px;">No tokens found.</div>`;
    return;
  }

  tokens.forEach(token => {
    const row = document.createElement("div");
    row.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 5px; border-radius: 8px; cursor: pointer; transition: background 0.2s;";
    
    row.onmouseover = () => row.style.background = "#21262d";
    row.onmouseout = () => row.style.background = "transparent";
    row.onclick = () => selectToken(token.symbol);

    row.innerHTML = `
      <div>
        <strong style="color: white; display: block;">${token.symbol}</strong>
        <span style="color: #8b949e; font-size: 12px;">${token.name}</span>
      </div>
      <span style="color: #58a6ff; font-size: 11px;">${token.address.substring(0, 6)}...${token.address.substring(token.address.length - 4)}</span>
    `;
    container.appendChild(row);
  });
}

function selectToken(symbol) {
  if (activeSelectionDirection === "from") {
    const fSymbol = document.getElementById("fromTokenSymbol");
    if (fSymbol) fSymbol.innerText = symbol;
  } else if (activeSelectionDirection === "to") {
    const tSymbol = document.getElementById("toTokenSymbol");
    if (tSymbol) tSymbol.innerText = symbol;
  }
  closeTokenModal();
}

function filterTokens() {
  const sInput = document.getElementById("tokenSearchInput");
  if (!sInput) return;
  const query = sInput.value.toLowerCase().trim();
  
  if (query.startsWith("0x") && query.length === 42) {
    const exactMatch = tokenList.filter(t => t.address.toLowerCase() === query);
    renderTokenList(exactMatch);
    return;
  }

  const filtered = tokenList.filter(token => 
    token.symbol.toLowerCase().includes(query) || 
    token.name.toLowerCase().includes(query)
  );
  
  renderTokenList(filtered);
}

// --- CENTRALIZED WINDOW CLICK LISTENER (MENYATUKAN KEDUA MODAL KETIKA DIKLIK LUAR) ---
window.onclick = function(event) {
  const tModal = document.getElementById("tokenModal");
  const wModal = document.getElementById("walletModal");
  
  // Jika user mengklik overlay token modal
  if (tModal && event.target === tModal) {
    closeTokenModal();
  }
  // Jika user mengklik overlay wallet modal
  if (wModal && event.target === wModal) {
    wModal.classList.add('style-hidden');
  }
};
