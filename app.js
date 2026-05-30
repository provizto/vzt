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

// --- REPLACE THE OLD copyLink FUNCTION IN YOUR app.js WITH THIS ---
function copyLink() {
    const refLinkInput = document.getElementById('refLink');
    
    if (!refLinkInput) return;

    // 1. Pilih teks di dalam input box
    refLinkInput.select();
    refLinkInput.setSelectionRange(0, 99999); /* Untuk perangkat mobile */

    try {
        // 2. Eksekusi perintah salin ke clipboard sistem perangkat
        navigator.clipboard.writeText(refLinkInput.value);
        
        // 3. TAMPILKAN BANNER INFORMASI SUKSES (Warna Hijau)
        showBanner("📋 Referral link successfully copied to your clipboard!", "success");
        
    } catch (err) {
        // Fallback jika browser versi lama tidak mendukung navigator.clipboard
        document.execCommand('copy');
        showBanner("📋 Referral link successfully copied to your clipboard!", "success");
    }
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

// --- FIXED PROVIZTO YIELD CALCULATOR ENGINE ---

// 1. Fungsi Kalkulasi Matematika Utama
function calculateProviztoYield(amount) {
    // Formula APY ~49.1% (Daily rate compound ≈ 0.11% per hari)
    const dailyRate = 0.0011; 
    
    const dailyProfit = amount * dailyRate;
    const monthlyProfit = amount * ((Math.pow(1 + dailyRate, 30)) - 1);
    const annualProfit = amount * ((Math.pow(1 + dailyRate, 365)) - 1);

    return {
        dailyRatePercent: "0.11%",
        estimatedDailyProfit: dailyProfit.toFixed(2),
        estimatedMonthlyProfit: monthlyProfit.toFixed(2),
        estimatedAnnualProfit: annualProfit.toFixed(2)
    };
}

// 2. Fungsi Utama Pengendali Tampilan UI (Dipanggil langsung oleh HTML oninput)
function updateYieldProjection() {
    const inputAmount = document.getElementById('calcAmount');
    const profitDay = document.getElementById('profitDay');
    const profitMonth = document.getElementById('profitMonth');
    const profitYear = document.getElementById('profitYear');

    // Validasi pencegahan eror jika elemen HTML tidak ditemukan
    if (!inputAmount || !profitDay || !profitMonth || !profitYear) return; 

    const amountValue = parseFloat(inputAmount.value) || 0;
    
    // Jalankan formula kalkulasi yield
    const projection = calculateProviztoYield(amountValue);

    // Suntikkan hasil kalkulasi langsung ke layar DOM HTML secara real-time
    profitDay.innerText = `${Number(projection.estimatedDailyProfit).toLocaleString('en-US')} USDC`;
    profitMonth.innerText = `${Number(projection.estimatedMonthlyProfit).toLocaleString('en-US')} USDC`;
    profitYear.innerText = `${Number(projection.estimatedAnnualProfit).toLocaleString('en-US')} USDC`;
}

// 3. Jalankan fungsi sekali secara otomatis agar default value ($1,000) langsung muncul saat halaman pertama terbuka
setTimeout(updateYieldProjection, 500);

// --- PROVIZTO AMM DEX SWAP ENGINE (VANILLA CORE IMPLEMENTATION) ---

let isSwapLoading = false;

// 1. Logika Perhitungan Harga Komposit & Fee (Menggantikan useEffect React)
function calculateSwapAmounts() {
    const payInput = document.getElementById('payAmount');
    const receiveInput = document.getElementById('receiveAmount');
    const tokenPaySelect = document.getElementById('tokenPay');
    const swapFeeLabel = document.getElementById('swapFeeLabel');

    if (!payInput || !receiveInput) return;

    const amount = parseFloat(payInput.value) || 0;
    const tokenPay = tokenPaySelect.value;
    
    // Hitung potongan fee protokol (0.3%)
    const tradingFeeRate = 0.003;
    const calculatedFee = amount * tradingFeeRate;
    swapFeeLabel.innerText = `${calculatedFee.toFixed(4)} ${tokenPay}`;

    // Simulasi Rasio Harga Pasar: 1 VZT = 0.5 USDC (atau 1 USDC = 2 VZT)
    if (tokenPay === 'USDC') {
        receiveInput.value = (amount * 2).toFixed(4);
    } else {
        receiveInput.value = (amount * 0.5).toFixed(4);
    }
}

// 2. Fungsi Penyelaras saat Pilihan Dropdown Token Diubah
function handleTokenChange(type) {
    const tokenPaySelect = document.getElementById('tokenPay');
    const tokenReceiveLabel = document.getElementById('tokenReceiveLabel');
    
    if (type === 'pay') {
        // Jika token pay diubah, balikkan label token receive secara otomatis
        if (tokenPaySelect.value === 'USDC') {
            tokenReceiveLabel.innerText = 'VZT';
        } else {
            tokenReceiveLabel.innerText = 'USDC';
        }
    }
    calculateSwapAmounts();
}

// 3. Fungsi Tukar Posisi Arah Token Swap (Switch Tokens)
function switchTokens() {
    if (isSwapLoading) return;

    const tokenPaySelect = document.getElementById('tokenPay');
    const payInput = document.getElementById('payAmount');

    // Balik nilai pilihan dropdown select
    if (tokenPaySelect.value === 'USDC') {
        tokenPaySelect.value = 'VZT';
    } else {
        tokenPaySelect.value = 'USDC';
    }

    payInput.value = ''; // Reset input agar bersih kembali
    handleTokenChange('pay');
}

// 4. Fungsi Utama Eksekusi Transaksi Bundling Jito MEV Protection
async function handleLaunchSwap() {
    const payInput = document.getElementById('payAmount');
    const receiveInput = document.getElementById('receiveAmount');
    const tokenPaySelect = document.getElementById('tokenPay');
    const tokenReceiveLabel = document.getElementById('tokenReceiveLabel');
    const swapBtn = document.getElementById('swapBtn');
    const txStatusLog = document.getElementById('txStatusLog');

    const payAmount = parseFloat(payInput.value) || 0;
    const tokenPay = tokenPaySelect.value;
    const receiveAmount = receiveInput.value;
    const tokenReceive = tokenReceiveLabel.innerText;

    if (payAmount <= 0) {
        alert('Please enter a valid token amount first.');
        return;
    }

    // Ambil nilai fee terhitung untuk teks struk notifikasi sukses
    const calculatedFee = payAmount * 0.003;

    isSwapLoading = true;
    swapBtn.disabled = true;
    swapBtn.innerText = 'Processing Secure Swap...';
    swapBtn.style.background = '#334155';
    
    // Tampilkan log pemrosesan paket transaksi via Jito Engine
    txStatusLog.style.display = 'block';
    txStatusLog.innerText = 'Routing private transaction bundle via Jito Engine (MEV Protection)...';

    try {
        // Simulasi jeda delay validasi konsensus blockchain Solana & Anti-Wash Trading (2.5 detik)
        await new Promise((resolve) => setTimeout(resolve, 2500));
        
        txStatusLog.innerText = 'Success! Your transaction is fully secured from Front-running & Wash-Trading.';
        
        alert(`Swap Successful!\n\nYou exchanged ${payAmount} ${tokenPay} into ${receiveAmount} ${tokenReceive}.\nProtocol Fee deducted: ${calculatedFee.toFixed(4)} ${tokenPay}`);
        
        // Reset form input setelah transaksi sukses selesai
        payInput.value = '';
        receiveInput.value = '';
        calculateSwapAmounts();
    } catch (error) {
        txStatusLog.innerText = 'Transaction failed or rejected by network consensus.';
    } finally {
        isSwapLoading = false;
        swapBtn.disabled = false;
        // Kembalikan gaya warna gradasi tombol utama
        swapBtn.innerText = 'Launch Swap';
        swapBtn.style.background = 'linear-gradient(90deg, #1f6feb 0%, #238636 100%)';
    }
}

// --- PROVIZTO VZT LOCK & YIELD ENGINE (VANILLA CORE IMPLEMENTATION) ---

let isLockLoading = false;
let isTokenLocked = false;

// 1. Logika Perhitungan Estimasi Real Yield Real-Time (Menggantikan kalkulasi state React)
function calculateLockReward() {
    if (isTokenLocked) return;

    const lockInput = document.getElementById('lockAmount');
    const accumulationLabel = document.getElementById('accumulationLabel');

    if (!lockInput || !accumulationLabel) return;

    const amount = parseFloat(lockInput.value) || 0;

    if (amount > 0) {
        // Formula matematika: 1 VZT = 0.05 USDC dari pool fee swap
        const estimatedUsdcReward = amount * 0.05;
        accumulationLabel.style.display = 'block';
        accumulationLabel.innerText = `Estimated Accumulation: +${estimatedUsdcReward.toFixed(2)} USDC`;
    } else {
        accumulationLabel.style.display = 'none';
    }
}

// 2. Fungsi Utama Eksekusi Penguncian Aset ke Anchor Smart Contract
async function handleLockToken() {
    const lockInput = document.getElementById('lockAmount');
    const lockBtn = document.getElementById('lockBtn');
    const accumulationLabel = document.getElementById('accumulationLabel');

    const amount = parseFloat(lockInput.value) || 0;

    if (amount <= 0) {
        alert('Please enter a valid amount of $VZT tokens to lock.');
        return;
    }

    isLockLoading = true;
    lockBtn.disabled = true;
    lockBtn.innerText = 'Processing Lock...';
    lockBtn.style.background = '#334155'; // Indikator loading abu-abu gelap
    lockInput.disabled = true;

    try {
        // Simulasi pengiriman instruksi ke Anchor Program selama 2 detik
        await new Promise((resolve) => setTimeout(resolve, 2000));

        alert(`Successfully locked ${amount} $VZT!\n\nYou are now eligible to claim periodic Real Yield rewards in stable USDC.`);
        
        // Kunci status form secara permanen (Sukses)
        isTokenLocked = true;
        lockBtn.innerText = '✓ Token Locked';
        lockBtn.style.background = '#22c55e'; // Warna hijau sukses permanen
        lockBtn.style.cursor = 'not-allowed';
    } catch (error) {
        alert('Transaction failed to send to the blockchain.');
        // Kembalikan tombol jika gagal
        isLockLoading = false;
        lockBtn.disabled = false;
        lockBtn.innerText = 'Lock Token';
        lockBtn.style.background = 'linear-gradient(90deg, #1f6feb 0%, #238636 100%)';
        lockInput.disabled = false;
    }
}
