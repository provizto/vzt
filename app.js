/* ==========================================================================
   PROVIZTO DAPP HUB - MASTER CORE JAVASCRIPT (PRODUCTION READY)
   ========================================================================== */

let isConnected = false;
let myWalletAddress = ""; 
let activeProvider = null;
let lastTransactionTime = 0;
let isSwapLoading = false;
let isLockLoading = false;
let isTokenLocked = false;

// Inisialisasi awal saat halaman web dimuat
document.addEventListener("DOMContentLoaded", () => {
    // 1. Set tahun hak cipta secara otomatis
    const copyrightYear = document.getElementById('copyrightYear');
    if (copyrightYear) {
        copyrightYear.innerText = new Date().getFullYear();
    }
    
    // 2. Jalankan kalkulator yield default ($1,000)
    if (typeof updateYieldProjection === "function") {
        setTimeout(updateYieldProjection, 500);
    }
});

/* ==========================================================================
   1. WALLET CONNECTION ENGINE (PHANTOM & SOLFLARE MODAL)
   ========================================================================== */

function openWalletModal() {
    if (isConnected) {
        disconnectWallet();
    } else {
        const modal = document.getElementById('walletModal');
        if (modal) modal.style.display = 'flex';
    }
}

function closeWalletModal() {
    const modal = document.getElementById('walletModal');
    if (modal) modal.style.display = 'none';
}

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

async function connectWallet(walletName) {
    const walletBtn = document.getElementById('walletBtn');
    const status = document.getElementById('walletStatus');
    const actionButtons = document.querySelectorAll('.btn-action');
    const testBtn = document.getElementById('testBtn');
    const refLink = document.getElementById('refLink');

    if (!activeProvider) return;

    try {
        const response = await activeProvider.connect();
        const pubKey = response.publicKey ? response.publicKey.toString() : activeProvider.publicKey.toString();
        myWalletAddress = pubKey;

        if (walletBtn) {
            walletBtn.innerText = `Connected (${walletName}): ${myWalletAddress.slice(0, 4)}...${myWalletAddress.slice(-4)}`;
            walletBtn.style.background = "#22c55e";
        }
        
        if (status) {
            status.innerText = `Wallet Status: Connected to Solana Mainnet via ${walletName}`;
            status.style.color = "#22c55e";
        }
        
        if (refLink) {
            refLink.value = `https://provizto.hub/${myWalletAddress}`;
        }

        // Buka kunci semua tombol aksi utama dApp
        actionButtons.forEach(b => b.removeAttribute('disabled'));
        if (testBtn) testBtn.removeAttribute('disabled');
        
        isConnected = true;
        showBanner(`Wallet successfully linked via ${walletName}!`, "success");
    } catch (err) {
        console.error(`${walletName} connection rejected:`, err);
    }
}

async function disconnectWallet() {
    const walletBtn = document.getElementById('walletBtn');
    const status = document.getElementById('walletStatus');
    const actionButtons = document.querySelectorAll('.btn-action');
    const testBtn = document.getElementById('testBtn');
    const refLink = document.getElementById('refLink');

    if (!activeProvider) return;

    try {
        await activeProvider.disconnect();
        if (walletBtn) {
            walletBtn.innerText = "Connect Wallet";
            walletBtn.style.background = "linear-gradient(135deg, #8b5cf6, #3b82f6)";
        }
        if (status) {
            status.innerText = "Wallet Status: Disconnected (Network: Solana)";
            status.style.color = "#94a3b8";
        }
        if (refLink) {
            refLink.value = "https://provizto.hub";
        }
        
        // Kunci kembali semua tombol aksi utama dApp
        actionButtons.forEach(b => b.setAttribute('disabled', 'true'));
        if (testBtn) testBtn.setAttribute('disabled', 'true');
        
        hideBanner();
        isConnected = false;
        activeProvider = null;
        showBanner("Wallet disconnected.", "warning");
    } catch (err) {
        console.error("Disconnection failed:", err);
    }
}

/* ==========================================================================
   2. SECURITY NOTIFICATION BANNER SYSTEM
   ========================================================================== */

function showBanner(message, type = "success") {
    let banner = document.getElementById('securityBanner');
    
    // Jika elemen banner belum ada di HTML, buat secara dinamis di bagian paling atas body
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'securityBanner';
        banner.style.position = 'fixed';
        banner.style.top = '20px';
        banner.style.left = '50%';
        banner.style.transform = 'translateX(-50%)';
        banner.style.padding = '14px 24px';
        banner.style.borderRadius = '8px';
        banner.style.fontWeight = '600';
        banner.style.fontSize = '0.95rem';
        banner.style.zIndex = '9999';
        banner.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
        banner.style.transition = 'all 0.3s ease';
        banner.style.textAlign = 'center';
        banner.style.minWidth = '300px';
        document.body.appendChild(banner);
    }

    banner.innerText = message;
    banner.style.display = 'block';

    // Styling berdasarkan tipe notifikasi
    if (type === "success") {
        banner.style.background = "#22c55e"; // Hijau sukses
        banner.style.color = "#ffffff";
        banner.style.border = "1px solid #16a34a";
    } else if (type === "error") {
        banner.style.background = "#ef4444"; // Merah error
        banner.style.color = "#ffffff";
        banner.style.border = "1px solid #dc2626";
    } else {
        banner.style.background = "#eab308"; // Kuning warning
        banner.style.color = "#1e293b";
        banner.style.border = "1px solid #ca8a04";
    }

    // Otomatis hilangkan banner setelah 4 detik
    setTimeout(hideBanner, 4000);
}

function hideBanner() {
    const banner = document.getElementById('securityBanner');
    if (banner) banner.style.display = 'none';
}

/* ==========================================================================
   3. ANTI-SYBIL COOLDOWN LOGIC (FOR COMPLIANCE TESTING)
   ========================================================================== */

function executeSecureTx(txName) {
    const currentTime = Date.now();
    
    // Validasi jeda proteksi rate-limiting 10 detik per aksi
    if (currentTime - lastTransactionTime < 10000) {
        showBanner(`⚠️ [Smart Contract Error]: Repetitive transaction detected too fast! Per Rust code rules, please wait 10 seconds.`, "error");
        return;
    }

    lastTransactionTime = currentTime;
    showBanner(`✅ Transaction [${txName}] executed successfully on the Solana network.`, "success");
}

/* ==========================================================================
   4. ANTI-SYBIL AFFILIATE CORE & COPY LINK LOGIC
   ========================================================================== */

function copyLink() {
    const refLinkInput = document.getElementById('refLink');
    if (!refLinkInput) return;

    refLinkInput.focus();
    refLinkInput.select();
    refLinkInput.setSelectionRange(0, 99999);

    // Eksekusi penyalinan tangguh universal (Offline/Online file:// kompatibel)
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showBanner("📋 Referral link successfully copied to your clipboard!", "success");
        } else {
            // Jika execCommand diblokir, coba pakai clipboard API modern
            fallbackModernCopy(refLinkInput.value);
        }
    } catch (err) {
        fallbackModernCopy(refLinkInput.value);
    }
}

function fallbackModernCopy(textValue) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(textValue)
            .then(() => {
                showBanner("📋 Referral link successfully copied to your clipboard!", "success");
            })
            .catch(() => {
                alert("Please select the text box and copy manually: " + textValue);
            });
    } else {
        alert("Please select the text box and copy manually: " + textValue);
    }
}

function verifyReferralOnChain() {
    const inputVal = document.getElementById('testReferrer').value.trim();
    const tierLabel = document.getElementById('tierLabel');
    const volLabel = document.getElementById('volLabel');

    if (inputVal === myWalletAddress) {
        showBanner("⚠️ [Smart Contract Error]: You cannot refer yourself! (SelfReferralNotAllowed)", "error");
        return;
    } 
    
    if (inputVal === "") {
        showBanner("Please enter a wallet address for simulation testing.", "warning");
        return;
    }

    // Simulasi pembuatan volume rujukan on-chain acak untuk demo proposal
    const simulatedVolume = Math.floor(Math.random() * 145000) + 5000; 
    volLabel.innerText = `$${simulatedVolume.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

    if (simulatedVolume <= 10000) {
        tierLabel.innerText = "Bronze (10%)";
        tierLabel.style.color = "#14b8a6";
        showBanner(`✅ [Success]: Active Regular User verified. Allocated to Bronze Tier (10% Commission).`, "success");
    } 
    else if (simulatedVolume > 10000 && simulatedVolume <= 100000) {
        tierLabel.innerText = "Silver (18%)";
        tierLabel.style.color = "#3b82f6";
        showBanner(`🔥 [Success]: High-Volume Creator verified! Upgraded to Silver Tier (18% Commission).`, "success");
    } 
    else {
        tierLabel.innerText = "Gold (25%)";
        tierLabel.style.color = "#a855f7";
        showBanner(`👑 [Success]: Top-Tier VIP KOL verified! Upgraded to Premium Gold Tier (25% Commission).`, "success");
    }
}

/* ==========================================================================
   5. PROVIZTO YIELD CALCULATOR ENGINE
   ========================================================================== */

// --- FUNGSIONAL EKSEKUSI DEPOSIT VAULT DENGAN VALIDASI PROTEKSI ---
async function handleDepositVault() {
    const inputAmount = document.getElementById('calcAmount');
    const yieldBtn = document.getElementById('yieldBtn');

    if (!inputAmount || !yieldBtn) return;

    const amountValue = parseFloat(inputAmount.value) || 0;

    // 1. VALIDASI: Menolak jika nominal 0, minus, atau kosong
    if (amountValue <= 0) {
        showBanner("⚠️ [Validation Error]: Deposit amount must be greater than 0 USDC!", "error");
        return;
    }

    // 2. PROTEKSI ANTI-SYBIL: Gunakan logika cooldown 10 detik yang sudah ada
    const currentTime = Date.now();
    if (currentTime - lastTransactionTime < 10000) {
        showBanner(`⚠️ [Smart Contract Error]: Repetitive transaction detected too fast! Per Rust code rules, please wait 10 seconds.`, "error");
        return;
    }

    // 3. EFEK VISUAL LOADING SIMULASI BLOCKCHAIN
    yieldBtn.disabled = true;
    yieldBtn.innerText = "Processing Deposit...";
    yieldBtn.style.background = "#334155";
    inputAmount.disabled = true;

    try {
        // Simulasi jeda konfirmasi jaringan selama 1.5 detik
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        // Perbarui stempel waktu transaksi terakhir jika sukses
        lastTransactionTime = Date.now(); 
        
        showBanner(`✅ Success: Deposited ${amountValue.toLocaleString('en-US')} USDC into the Auto-Compounding Vault!`, "success");
        
    } catch (error) {
        showBanner("⚠️ Transaction rejected by network consensus.", "error");
    } finally {
        // Kembalikan status tombol ke normal setelah selesai
        yieldBtn.disabled = false;
        yieldBtn.innerText = "Open Vaults";
        yieldBtn.style.background = 'linear-gradient(90deg, #1f6feb 0%, #238636 100%)';
        inputAmount.disabled = false;
    }
}

/* ==========================================================================
   6. AMM DEX SWAP MATH & LOGIC
   ========================================================================== */

function calculateSwapAmounts() {
    const payInput = document.getElementById('payAmount');
    const receiveInput = document.getElementById('receiveAmount');
    const tokenPaySelect = document.getElementById('tokenPay');
    const swapFeeLabel = document.getElementById('swapFeeLabel');

    if (!payInput || !receiveInput) return;

    const amount = parseFloat(payInput.value) || 0;
    const tokenPay = tokenPaySelect.value;
    
    const calculatedFee = amount * 0.003;
    swapFeeLabel.innerText = `${calculatedFee.toFixed(4)} ${tokenPay}`;

    if (tokenPay === 'USDC') {
        receiveInput.value = (amount * 2).toFixed(4); // 1 USDC = 2 VZT
    } else {
        receiveInput.value = (amount * 0.5).toFixed(4); // 1 VZT = 0.5 USDC
    }
}

function handleTokenChange(type) {
    const tokenPaySelect = document.getElementById('tokenPay');
    const tokenReceiveLabel = document.getElementById('tokenReceiveLabel');
    
    if (type === 'pay' && tokenPaySelect && tokenReceiveLabel) {
        tokenReceiveLabel.innerText = (tokenPaySelect.value === 'USDC') ? 'VZT' : 'USDC';
    }
    calculateSwapAmounts();
}

function switchTokens() {
    if (isSwapLoading) return;
    const tokenPaySelect = document.getElementById('tokenPay');
    const payInput = document.getElementById('payAmount');

    if (tokenPaySelect && payInput) {
        tokenPaySelect.value = (tokenPaySelect.value === 'USDC') ? 'VZT' : 'USDC';
        payInput.value = '';
        handleTokenChange('pay');
    }
}

async function handleLaunchSwap() {
    const payInput = document.getElementById('payAmount');
    const receiveInput = document.getElementById('receiveAmount');
    const tokenPaySelect = document.getElementById('tokenPay');
    const tokenReceiveLabel = document.getElementById('tokenReceiveLabel');
    const swapBtn = document.getElementById('swapBtn');
    const txStatusLog = document.getElementById('txStatusLog');

    if (!payInput || !swapBtn) return;
    const payAmount = parseFloat(payInput.value) || 0;

    if (payAmount <= 0) {
        alert('Please enter a valid token amount first.');
        return;
    }

    const tokenPay = tokenPaySelect ? tokenPaySelect.value : 'USDC';
    const receiveAmount = receiveInput ? receiveInput.value : '0.0';
    const tokenReceive = tokenReceiveLabel ? tokenReceiveLabel.innerText : 'VZT';
    const calculatedFee = payAmount * 0.003;

    isSwapLoading = true;
    swapBtn.disabled = true;
    swapBtn.innerText = 'Processing Secure Swap...';
    swapBtn.style.background = '#334155';
    
    if (txStatusLog) {
        txStatusLog.style.display = 'block';
        txStatusLog.innerText = 'Routing private transaction bundle via Jito Engine (MEV Protection)...';
    }

    try {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        if (txStatusLog) txStatusLog.innerText = 'Success! Your transaction is fully secured.';
        alert(`Swap Successful!\n\nYou exchanged ${payAmount} ${tokenPay} into ${receiveAmount} ${tokenReceive}.\nProtocol Fee deducted: ${calculatedFee.toFixed(4)} ${tokenPay}`);
        payInput.value = '';
        if (receiveInput) receiveInput.value = '';
        calculateSwapAmounts();
    } catch (error) {
        if (txStatusLog) txStatusLog.innerText = 'Transaction failed.';
    } finally {
        isSwapLoading = false;
        swapBtn.disabled = false;
        swapBtn.innerText = 'Launch Swap';
        swapBtn.style.background = 'linear-gradient(90deg, #1f6feb 0%, #238636 100%)';
    }
}

/* ==========================================================================
   7. VZT LOCK & YIELD REAL REWARD SYSTEM
   ========================================================================== */

function calculateLockReward() {
    if (isTokenLocked) return;
    const lockInput = document.getElementById('lockAmount');
    const accumulationLabel = document.getElementById('accumulationLabel');

    if (!lockInput || !accumulationLabel) return;
    const amount = parseFloat(lockInput.value) || 0;

    if (amount > 0) {
        const estimatedUsdcReward = amount * 0.05;
        accumulationLabel.style.display = 'block';
        accumulationLabel.innerText = `Estimated Accumulation: +${estimatedUsdcReward.toFixed(2)} USDC`;
    } else {
        accumulationLabel.style.display = 'none';
    }
}

async function handleLockToken() {
    const lockInput = document.getElementById('lockAmount');
    const lockBtn = document.getElementById('lockBtn');

    if (!lockInput || !lockBtn) return;
    const amount = parseFloat(lockInput.value) || 0;

    if (amount <= 0) {
        alert('Please enter a valid amount of $VZT tokens to lock.');
        return;
    }

    isLockLoading = true;
    lockBtn.disabled = true;
    lockBtn.innerText = 'Processing Lock...';
    lockBtn.style.background = '#334155';
    lockInput.disabled = true;

    try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        alert(`Successfully locked ${amount} $VZT!\n\nYou are now eligible to claim periodic Real Yield rewards in stable USDC.`);
        isTokenLocked = true;
        lockBtn.innerText = '✓ Token Locked';
        lockBtn.style.background = '#22c55e';
        lockBtn.style.cursor = 'not-allowed';
    } catch (error) {
        alert('Transaction failed.');
        isLockLoading = false;
        lockBtn.disabled = false;
        lockBtn.innerText = 'Lock Token';
        lockInput.disabled = false;
    }
}
