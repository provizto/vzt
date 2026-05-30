/* --- PROVIZTO DAPP LOGIC (MULTI-WALLET SUPPORT) --- */
let isConnected = false;
let myWalletAddress = ""; 
let lastTransactionTime = 0;
let activeProvider = null; // Menyimpan dompet yang sedang aktif digunakan

document.getElementById('copyrightYear').innerText = new Date().getFullYear();

// --- LOGIKA CONTROL UTAMA POP-UP MODAL ---
function openWalletModal() {
    // Jika wallet sudah terkoneksi, klik tombol akan langsung memutuskan koneksi (Disconnect)
    if (isConnected) {
        disconnectWallet();
    } else {
        document.getElementById('walletModal').style.display = 'flex';
    }
}

function closeWalletModal() {
    document.getElementById('walletModal').style.display = 'none';
}

// --- PEMILIHAN PROVIDER DOMPET ---
function selectWallet(walletType) {
    closeWalletModal();
    
    if (walletType === 'phantom') {
        if (window.solana && window.solana.isPhantom) {
            activeProvider = window.solana;
            connectWallet("Phantom");
        } else {
            alert("Phantom Wallet not found! Please install the Phantom extension.");
            window.open("https://phantom.app/", "_blank");
        }
    } 
    else if (walletType === 'solflare') {
        if (window.solflare && window.solflare.isSolflare) {
            activeProvider = window.solflare;
            connectWallet("Solflare");
        } else {
            alert("Solflare Wallet not found! Please install the Solflare extension.");
            window.open("https://solflare.com/", "_blank");
        }
    }
}

// --- PROSES HUBUNGKAN DOMPET ---
async function connectWallet(walletName) {
    const walletBtn = document.getElementById('walletBtn');
    const status = document.getElementById('walletStatus');
    const actionButtons = document.querySelectorAll('.btn-action');
    const testBtn = document.getElementById('testBtn');
    const refLink = document.getElementById('refLink');

    if (!activeProvider) return;

    try {
        // Melakukan request on-chain koneksi ke dompet terpilih
        const response = await activeProvider.connect();
        
        // Kompatibilitas alamat: Solflare dan Phantom mengembalikan struktur data pubkey yang sedikit berbeda pada vanilla JS
        const pubKey = response.publicKey ? response.publicKey.toString() : activeProvider.publicKey.toString();
        myWalletAddress = pubKey;

        // Ubah UI menjadi status Terhubung
        walletBtn.innerText = `Connected (${walletName}): ${myWalletAddress.slice(0, 4)}...${myWalletAddress.slice(-4)}`;
        walletBtn.style.background = "#22c55e";
        
        status.innerText = `Wallet Status: Connected to Solana Mainnet via ${walletName}`;
        status.style.color = "#22c55e";
        
        refLink.value = `https://provizto.hub/${myWalletAddress}`;
        
        // Aktifkan interaksi dApp
        actionButtons.forEach(b => b.removeAttribute('disabled'));
        testBtn.removeAttribute('disabled');
        
        isConnected = true;
    } catch (err) {
        console.error(`${walletName} connection rejected:`, err);
    }
}

// --- PROSES PUTUSKAN DOMPET ---
async function disconnectWallet() {
    const walletBtn = document.getElementById('walletBtn');
    const status = document.getElementById('walletStatus');
    const actionButtons = document.querySelectorAll('.btn-action');
    const testBtn = document.getElementById('testBtn');
    const refLink = document.getElementById('refLink');

    if (!activeProvider) return;

    try {
        await activeProvider.disconnect();
        
        // Reset UI ke kondisi awal terputus
        walletBtn.innerText = "Connect Wallet";
        walletBtn.style.background = "linear-gradient(135deg, #8b5cf6, #3b82f6)";
        
        status.innerText = "Wallet Status: Disconnected (Network: Solana)";
        status.style.color = "#94a3b8";
        
        refLink.value = "https://provizto.hub";
        
        actionButtons.forEach(b => b.setAttribute('disabled', 'true'));
        testBtn.setAttribute('disabled', 'true');
        
        hideBanner();
        isConnected = false;
        activeProvider = null; // hapus provider aktif
    } catch (err) {
        console.error("Disconnection failed:", err);
    }
}

// --- LOGIKA SIMULASI RUST / SMART CONTRACT TETAP SAMA ---
function verifyReferralOnChain() {
    const inputVal = document.getElementById('testReferrer').value.trim();
    if (inputVal === myWalletAddress) {
        showBanner("⚠️ [Smart Contract Error]: You cannot refer yourself! (SelfReferralNotAllowed)", "error");
    } else if (inputVal === "") {
        showBanner("Please enter a wallet address for simulation testing.", "warning");
    } else {
        showBanner("✅ [Smart Contract Success]: Referrer address is valid and recorded securely on-chain.", "success");
    }
}

function executeSecureTx(actionName) {
    const now = Math.floor(Date.now() / 1000);
    if (now - lastTransactionTime < 10) {
        showBanner("⚠️ [Smart Contract Error]: Repetitive transaction detected too fast! Per Rust code rules, please wait 10 seconds.", "error");
        return;
    }
    lastTransactionTime = now;
    showBanner(`✅ Transaction [${actionName}] executed successfully on the Solana network.`, "success");
}

function showBanner(text, type) {
    const banner = document.getElementById('securityBanner');
    banner.innerText = text;
    banner.style.display = "block";
    if (type === "error") {
        banner.style.background = "#ef4444";
        banner.style.borderColor = "#b91c1c";
    } else if (type === "success") {
        banner.style.background = "#22c55e";
        banner.style.borderColor = "#15803d";
    } else {
        banner.style.background = "#eab308";
        banner.style.borderColor = "#a16207";
    }
}

function hideBanner() {
    document.getElementById('securityBanner').style.display = "none";
}

function copyLink() {
    const copyText = document.getElementById("refLink");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    alert("Referral Link copied successfully!");
}

/* --- ADD THIS TO THE VERY BOTTOM OF YOUR style.css --- */
.tier-stats {
    display: flex;
    gap: 40px;
    font-size: 0.95rem;
    color: #94a3b8;
    background-color: #0b0f19;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #1f2937;
    margin-top: 15px;
}

.tier-item span {
    font-weight: 700;
    transition: color 0.3s ease-in-out; /* Memberikan efek animasi smooth saat warna teks tier berubah */
}
