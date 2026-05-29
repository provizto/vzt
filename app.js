// --- KAMUS MULTIBAHASA (DEFAULT: EN) ---
const translations = {
    en: {
        navHome: "Back to Home",
        btnConnect: "Connect Wallet",
        statusDisconnected: "Wallet Status: Disconnected (Network: Solana)",
        statusConnected: "Wallet Status: Connected to Solana Mainnet",
        cardSwapTitle: "AMM DEX Swap",
        cardSwapDesc: "Instant asset swapping with MEV protection and daily Anti-Wash Trading features.",
        tradingFee: "Trading Fee",
        btnLaunchSwap: "Launch Swap",
        cardVaultTitle: "Yield Optimizer",
        cardVaultDesc: "Deposit once, the system automatically executes periodic auto-compounding optimization.",
        btnOpenVaults: "Open Vaults",
        cardLockTitle: "VZT Lock & Yield",
        cardLockDesc: "Lock your $VZT tokens to claim Real Yield paid out in stable USDC.",
        rewardType: "Reward",
        btnLockToken: "Lock Token",
        affiliateTitle: "Secure On-Chain Affiliate",
        badgeSybil: "🛡️ Anti-Sybil Active",
        affiliateDesc: "Share your unique link. The system restricts repetitive transactional manipulation (max 1 tx/10s).",
        btnCopy: "Copy Link",
        testLabel: "Simulated Referrer Input (Rust Code Verification Mockup):",
        testPlaceholder: "Enter referrer wallet address...",
        btnVerify: "Verify Link",
        currentTier: "Current Tier",
        totalVol: "Total Referral Volume",
        footerText: "All Rights Reserved. Secure Protocol Edition.",
        alertNoWallet: "Solana Wallet not found! Please install Phantom Wallet first.",
        alertCopied: "Referral Link copied successfully!",
        errSelfRef: "⚠️ [Smart Contract Error]: You cannot refer yourself! (SelfReferralNotAllowed)",
        errEmptyRef: "Please enter a wallet address for simulation testing.",
        successRef: "✅ [Smart Contract Success]: Referrer address is valid and recorded securely on-chain.",
        errRateLimit: "⚠️ [Smart Contract Error]: Repetitive transaction detected too fast! Per Rust code rules, please wait 10 seconds.",
        successTx: "✅ Transaction [ACTION] executed successfully on the Solana network."
    },
    id: {
        navHome: "Kembali ke Beranda",
        btnConnect: "Hubungkan Dompet",
        statusDisconnected: "Status Dompet: Terputus (Jaringan: Solana)",
        statusConnected: "Status Dompet: Terhubung ke Solana Mainnet",
        cardSwapTitle: "AMM DEX Swap",
        cardSwapDesc: "Tukar aset instan dengan perlindungan MEV dan fitur harian Anti-Wash Trading.",
        tradingFee: "Biaya Transaksi",
        btnLaunchSwap: "Buka Swap",
        cardVaultTitle: "Pengoptimasi Hasil",
        cardVaultDesc: "Setor sekali, sistem mengeksekusi otomatisasi auto-compound secara berkala.",
        btnOpenVaults: "Buka Brankas",
        cardLockTitle: "Kunci & Hasil VZT",
        cardLockDesc: "Kunci token $VZT Anda untuk mengklaim Real Yield dalam bentuk USDC stabil.",
        rewardType: "Hadiah",
        btnLockToken: "Kunci Token",
        affiliateTitle: "Afiliasi On-Chain Aman",
        badgeSybil: "🛡️ Anti-Sybil Aktif",
        affiliateDesc: "Bagikan tautan unik Anda. Sistem membatasi manipulasi transaksi berulang (maks. 1 tx/10 detik).",
        btnCopy: "Salin Tautan",
        testLabel: "Uji Coba Input Referrer (Simulasi Verifikasi Kode Rust):",
        testPlaceholder: "Masukkan alamat dompet pengajak...",
        btnVerify: "Verifikasi Tautan",
        currentTier: "Tingkat Saat Ini",
        totalVol: "Total Volume Rujukan",
        footerText: "Hak Cipta Dilindungi Undang-Undang. Edisi Protokol Aman.",
        alertNoWallet: "Dompet Solana tidak ditemukan! Silakan instal Phantom Wallet terlebih dahulu.",
        alertCopied: "Referral Link berhasil disalin!",
        errSelfRef: "⚠️ [Smart Contract Error]: Anda tidak bisa merujuk diri sendiri! (SelfReferralNotAllowed)",
        errEmptyRef: "Silakan masukkan alamat dompet untuk simulasi tes.",
        successRef: "✅ [Smart Contract Success]: Alamat perujuk valid dan dicatat aman on-chain.",
        errRateLimit: "⚠️ [Smart Contract Error]: Deteksi transaksi berulang terlalu cepat! Sesuai aturan kode Rust, harap tunggu 10 detik.",
        successTx: "✅ Transaksi [ACTION] berhasil dieksekusi secara aman di jaringan Solana."
    }
};

let currentLang = "en"; // Default Bahasa Utama EN
let isConnected = false;
let myWalletAddress = "7xVZT...SolanaWallet";
let lastTransactionTime = 0;

// --- FUNGSI MENGGANTI BAHASA ---
function switchLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;

    // 1. Update elemen teks dengan atribut data-i18n
    document.querySelectorAll("[data-i18n]").forEach(element => {
        const key = element.getAttribute("data-i18n");
        if (translations[lang][key]) {
            element.innerText = translations[lang][key];
        }
    });

    // 2. Update placeholder khusus input text
    const testInput = document.getElementById("testReferrer");
    if (testInput) {
        testInput.placeholder = translations[lang].testPlaceholder;
    }

    // 3. Update kelas tombol aktif di UI header
    document.querySelectorAll(".lang-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelector(`.lang-${lang}`).classList.add("active");

    // 4. Sinkronisasi teks dinamis wallet status
    updateWalletStatusUI();
}

// Mengatur tahun hak cipta & inisialisasi bahasa awal saat dimuat
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('copyrightYear').innerText = new Date().getFullYear();
    switchLanguage(currentLang);
});


function toggleWallet() {
    connectWallet();
}

// --- LOGIKA UTAMA DOMPET REAL ---
async function connectWallet() {
    const walletBtn = document.getElementById('walletBtn');
    const actionButtons = document.querySelectorAll('.btn-action');
    const testBtn = document.getElementById('testBtn');
    const refLink = document.getElementById('refLink');

    const isSolanaAvailable = window.solana && window.solana.isPhantom;

    if (!isSolanaAvailable) {
        alert(translations[currentLang].alertNoWallet);
        window.open("https://phantom.app/", "_blank");
        return;
    }

    if (!isConnected) {
        try {
            const response = await window.solana.connect();
            const realWalletAddress = response.publicKey.toString();
            myWalletAddress = realWalletAddress;

            walletBtn.innerText = `Connected: ${realWalletAddress.slice(0, 4)}...${realWalletAddress.slice(-4)}`;
            walletBtn.style.background = "#22c55e";
            
            refLink.value = `https://provizto.hub/${realWalletAddress}`;
            
            actionButtons.forEach(b => b.removeAttribute('disabled'));
            testBtn.removeAttribute('disabled');
            
            isConnected = true;
            updateWalletStatusUI();
            
            if (typeof initJupiterSwap === "function") {
                initJupiterSwap();
            }
        } catch (err) {
            console.error("User rejected login:", err);
        }
    } else {
        try {
            await window.solana.disconnect();
            
            walletBtn.innerText = translations[currentLang].btnConnect;
            walletBtn.style.background = "linear-gradient(135deg, #8b5cf6, #3b82f6)";
            
            refLink.value = "https://provizto.hub";
            
            actionButtons.forEach(b => b.setAttribute('disabled', 'true'));
            testBtn.setAttribute('disabled', 'true');
            
            hideBanner();
            isConnected = false;
            updateWalletStatusUI();
        } catch (err) {
            console.error("Disconnect error:", err);
        }
    }
}

// Fungsi pembantu memperbarui teks status wallet dinamis sesuai bahasa aktif
function updateWalletStatusUI() {
    const status = document.getElementById('walletStatus');
    if (!isConnected) {
        status.innerText = translations[currentLang].statusDisconnected;
        status.style.color = "#94a3b8";
    } else {
        status.innerText = translations[currentLang].statusConnected;
        status.style.color = "#22c55e";
    }
}

// Simulasi Keamanan dengan Pesan Mengikuti Bahasa Aktif
function verifyReferralOnChain() {
    const inputVal = document.getElementById('testReferrer').value.trim();
    if (inputVal === myWalletAddress) {
        showBanner(translations[currentLang].errSelfRef, "error");
    } else if (inputVal === "") {
        showBanner(translations[currentLang].errEmptyRef, "warning");
    } else {
        showBanner(translations[currentLang].successRef, "success");
    }
}

function executeSecureTx(actionName) {
    const now = Math.floor(Date.now() / 1000);
    if (now - lastTransactionTime < 10) {
        showBanner(translations[currentLang].errRateLimit, "error");
        return;
    }
    lastTransactionTime = now;
    
    // Mengganti placeholder nama aksi di dApp teks sukses
    const successMsg = translations[currentLang].successTx.replace("[ACTION]", actionName);
    showBanner(successMsg, "success");
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
    alert(translations[currentLang].alertCopied);
}
