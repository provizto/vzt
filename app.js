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
// --- REPLACE THE OLD verifyReferralOnChain FUNCTION IN YOUR app.js WITH THIS ---
function verifyReferralOnChain() {
    const inputVal = document.getElementById('testReferrer').value.trim();
    const tierLabel = document.getElementById('tierLabel');
    const volLabel = document.getElementById('volLabel');

    // 1. Validasi jika user mencoba memasukkan alamat dompetnya sendiri (Anti-Self-Referral)
    if (inputVal === myWalletAddress) {
        showBanner("⚠️ [Smart Contract Error]: You cannot refer yourself! (SelfReferralNotAllowed)", "error");
        return;
    } 
    
    // 2. Validasi jika input kosong
    if (inputVal === "") {
        showBanner("Please enter a wallet address for simulation testing.", "warning");
        return;
    }

    // 3. SIMULASI GENERATE VOLUME ACAK (Untuk Keperluan Demo & Pengajuan Grants)
    // Menghasilkan angka acak antara $5,000 sampai $150,000 secara otomatis
    const simulatedVolume = Math.floor(Math.random() * 145000) + 5000; 
    
    // Cetak volume ke layar dApp dengan format mata uang USD yang rapi
    volLabel.innerText = `$${simulatedVolume.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

    // 4. LOGIKA EVALUASI TIER SECARA ON-CHAIN BERDASARKAN VOLUME
    if (simulatedVolume <= 10000) {
        // Jika volume rujukan di bawah $10,000 -> Set ke Bronze Tier
        tierLabel.innerText = "Bronze (10%)";
        tierLabel.style.color = "#14b8a6"; // Mengubah warna teks menjadi Teal khas Bronze
        showBanner(`✅ [Success]: Active Regular User verified. Allocated to Bronze Tier (10% Commission).`, "success");
    } 
    else if (simulatedVolume > 10000 && simulatedVolume <= 100000) {
        // Jika volume rujukan antara $10,001 - $100,000 -> Upgrade ke Silver Tier
        tierLabel.innerText = "Silver (18%)";
        tierLabel.style.color = "#3b82f6"; // Mengubah warna teks menjadi Biru cerah
        showBanner(`🔥 [Success]: High-Volume Creator verified! Upgraded to Silver Tier (18% Commission).`, "success");
    } 
    else {
        // Jika volume rujukan di atas $100,000 -> Upgrade ke Gold VIP Tier
        tierLabel.innerText = "Gold (25%)";
        tierLabel.style.color = "#a855f7"; // Mengubah warna teks menjadi Ungu premium
        showBanner(`👑 [Success]: Top-Tier VIP KOL verified! Upgraded to Premium Gold Tier (25% Commission).`, "success");
    }
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
