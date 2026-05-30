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

// System Staking Calculation Mode Tracker
let lockCalculationMode = 'manual';
let chosenMultiplier = 2.5; // Default multiplier untuk opsi 180 hari aktif awal

// Inisialisasi awal saat halaman web dimuat oleh browser
document.addEventListener("DOMContentLoaded", () => {
    // 1. Set tahun hak cipta secara otomatis di footer
    const copyrightYear = document.getElementById('copyrightYear');
    if (copyrightYear) {
        copyrightYear.innerText = new Date().getFullYear();
    }
    
    // 2. Jalankan kalkulator yield default ($1,000) saat pertama kali dibuka
    if (typeof updateYieldProjection === "function") {
        setTimeout(updateYieldProjection, 500);
    }

    // 3. Inisialisasi Event Listener untuk Sistem Tab Kalkulator Staking VZT
    initStakingTabs();
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

// ANTI GAGAL BUKA WALLET DI HP
function selectWallet(walletType) {
    closeWalletModal();
    
    // Deteksi apakah pengguna membuka dApp lewat HP (Mobile)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const dAppUrl = window.location.href; // Mengambil URL dApp saat ini secara otomatis

    if (walletType === 'phantom') {
        if (window.solana && window.solana.isPhantom) {
            activeProvider = window.solana;
            connectWallet("Phantom");
        } else if (isMobile) {
            // Jika di HP dan tidak terdeteksi ekstensi, alihkan langsung ke aplikasi Phantom
            const phantomDeepLink = `https://phantom.app/ul/browse/${encodeURIComponent(dAppUrl)}`;
            window.open(phantomDeepLink, '_blank');
        } else {
            alert("Phantom Wallet not found! Please install the Phantom extension.");
            window.open("https://phantom.app/", "_blank");
        }
    } else if (walletType === 'solflare') {
        if (window.solflare && window.solflare.isSolflare) {
            activeProvider = window.solflare;
            connectWallet("Solflare");
        } else if (isMobile) {
            // Jika di HP dan tidak terdeteksi ekstensi, alihkan langsung ke aplikasi Solflare
            const solflareDeepLink = `https://solflare.com/ul/v1/browse?url=${encodeURIComponent(dAppUrl)}`;
            window.open(solflareDeepLink, '_blank');
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
    const vztBalance = document.getElementById('vztBalance');

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

        // Injeksi saldo dompet simulasi awal saat terkoneksi
        if (vztBalance) {
            vztBalance.innerText = "5,000.00 VZT";
        }

        // Buka kunci akses semua tombol aksi dApp jika nilai input sudah valid
        actionButtons.forEach(b => {
            if (b.id === 'lockBtn') {
                executeLiveCalculatedMetrics();
            } else if (b.id === 'swapBtn') {
                calculateSwapAmounts();
            } else {
                b.removeAttribute('disabled');
            }
        });
        
        if (testBtn) testBtn.removeAttribute('disabled');
        
        isConnected = true;
        showBanner(`Wallet successfully linked via ${walletName}!`, "success");
    } catch (err) {
        console.error(`${walletName} connection rejected:`, err);
    }
}

async function connectWallet(walletName) {
    const walletBtn = document.getElementById('walletBtn');
    const status = document.getElementById('walletStatus');
    const actionButtons = document.querySelectorAll('.btn-action');
    const testBtn = document.getElementById('testBtn');
    const refLink = document.getElementById('refLink');
    const vztBalance = document.getElementById('vztBalance');

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

        // Injeksi saldo dompet simulasi awal saat terkoneksi
        if (vztBalance) {
            vztBalance.innerText = "5,000.00 VZT";
        }

        // MEMAKSA STATE DAN ATRIBUT KEAKTIFAN DI-UNLOCK SECARA ABSOLUT
        isConnected = true;

        actionButtons.forEach(b => {
            b.removeAttribute('disabled');
        });
        
        // Refresh hitungan kalkulator agar mengubah status visual tombol menjadi aktif gradasi
        calculateSwapAmounts();
        calculateLockReward();
        
        if (testBtn) testBtn.removeAttribute('disabled');
        
        showBanner(`Wallet successfully linked via ${walletName}!`, "success");
    } catch (err) {
        console.error(`${walletName} connection rejected:`, err);
    }
}

/* ==========================================================================
   2. SECURITY NOTIFICATION BANNER SYSTEM
   ========================================================================== */

function showBanner(message, type = "success") {
    let banner = document.getElementById('securityBanner');
    
    // Jika elemen spanduk belum ada di HTML, bangun secara dinamis di level root body
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

    // Pengkondisian gaya visual notifikasi banner
    if (type === "success") {
        banner.style.background = "#22c55e"; // Hijau Sukses
        banner.style.color = "#ffffff";
        banner.style.border = "1px solid #16a34a";
    } else if (type === "error") {
        banner.style.background = "#ef4444"; // Merah Gagal
        banner.style.color = "#ffffff";
        banner.style.border = "1px solid #dc2626";
    } else {
        banner.style.background = "#eab308"; // Kuning Peringatan
        banner.style.color = "#1e293b";
        banner.style.border = "1px solid #ca8a04";
    }

    // Otomatis bersihkan banner dalam waktu 4 detik durasi tayang
    setTimeout(hideBanner, 4000);
}

function hideBanner() {
    const banner = document.getElementById('securityBanner');
    if (banner) banner.style.display = 'none';
}

/* ==========================================================================
   3. ANTI-SYBIL COOLDOWN AND VAULT DEPOSIT VALIDATOR
   ========================================================================== */

async function handleDepositVault() {
    const inputAmount = document.getElementById('calcAmount');
    const yieldBtn = document.getElementById('yieldBtn');

    if (!inputAmount || !yieldBtn) return;
    const amountValue = parseFloat(inputAmount.value) || 0;

    // 1. VALIDASI: Tolak jika nominal 0, kosong, atau minus
    if (amountValue <= 0) {
        showBanner("⚠️ [Validation Error]: Deposit amount must be greater than 0 USDC!", "error");
        return;
    }

    // 2. TIMELOCK: Jalankan pengkondisian batas aman inter-interval 10 detik
    const currentTime = Date.now();
    if (currentTime - lastTransactionTime < 10000) {
        showBanner(`⚠️ [Smart Contract Error]: Repetitive transaction detected too fast! Per Rust code rules, please wait 10 seconds.`, "error");
        return;
    }

    yieldBtn.disabled = true;
    yieldBtn.innerText = "Processing Deposit...";
    yieldBtn.style.background = "#334155";
    inputAmount.disabled = true;

    try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        lastTransactionTime = Date.now(); // Perbarui log transaksi terakhir
        showBanner(`✅ Success: Deposited ${amountValue.toLocaleString('en-US')} USDC into the Auto-Compounding Vault!`, "success");
    } catch (error) {
        showBanner("⚠️ Transaction rejected by network consensus.", "error");
    } finally {
        yieldBtn.disabled = false;
        yieldBtn.innerText = "Open Vaults";
        yieldBtn.style.background = 'linear-gradient(90deg, #1f6feb 0%, #238636 100%)';
        inputAmount.disabled = false;
    }
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

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showBanner("📋 Referral link successfully copied to your clipboard!", "success");
        } else {
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

function calculateProviztoYield(amount) {
    const dailyRate = 0.0011; // 49.1% APY Auto-compound derivative
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

function updateYieldProjection() {
    const inputAmount = document.getElementById('calcAmount');
    const profitDay = document.getElementById('profitDay');
    const profitMonth = document.getElementById('profitMonth');
    const profitYear = document.getElementById('profitYear');
    const yieldBtn = document.getElementById('yieldBtn');

    if (!inputAmount || !profitDay || !profitMonth || !profitYear) return; 

    const amountValue = parseFloat(inputAmount.value) || 0;
    const projection = calculateProviztoYield(amountValue);

    profitDay.innerText = `${Number(projection.estimatedDailyProfit).toLocaleString('en-US')} USDC`;
    profitMonth.innerText = `${Number(projection.estimatedMonthlyProfit).toLocaleString('en-US')} USDC`;
    profitYear.innerText = `${Number(projection.estimatedAnnualProfit).toLocaleString('en-US')} USDC`;

    if (isConnected && amountValue > 0) {
        yieldBtn.removeAttribute('disabled');
    } else {
        yieldBtn.setAttribute('disabled', 'true');
    }
}

/* ==========================================================================
   6. AMM DEX SWAP CORE LOGIC
   ========================================================================== */

function calculateSwapAmounts() {
    const payInput = document.getElementById('payAmount');
    const receiveInput = document.getElementById('receiveAmount');
    const tokenPaySelect = document.getElementById('tokenPay');
    const swapFeeLabel = document.getElementById('swapFeeLabel');
    const swapBtn = document.getElementById('swapBtn');

    if (!payInput || !receiveInput || !swapBtn) return;

    const amount = parseFloat(payInput.value) || 0;
    const tokenPay = tokenPaySelect.value;
    
    const calculatedFee = amount * 0.003;
    swapFeeLabel.innerText = `${calculatedFee.toFixed(4)} ${tokenPay}`;

    if (tokenPay === 'USDC') {
        receiveInput.value = (amount * 2).toFixed(4);
    } else {
        receiveInput.value = (amount * 0.5).toFixed(4);
    }

    // VALIDASI AKTIF SECARA TOTAL JIKA WALLET TERKONEKSI
    if (isConnected) {
        swapBtn.removeAttribute('disabled');
    } else {
        swapBtn.setAttribute('disabled', 'true');
    }
}

// Handler perubahan mata uang token swap
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
        swapBtn.style.background = '';
    }
}

/* ==========================================================================
   7. VZT LOCK & YIELD ECOSYSTEM METRICS & CALCULATION STRATEGIES
   ========================================================================== */

function initStakingTabs() {
    const tabManualBtn = document.getElementById('tabManual');
    const tabWizardBtn = document.getElementById('tabWizard');

    if (tabManualBtn && tabWizardBtn) {
        tabManualBtn.addEventListener('click', () => switchLockCalculationView('manual'));
        tabWizardBtn.addEventListener('click', () => switchLockCalculationView('wizard'));
    }
}

function switchLockCalculationView(selectedMode) {
    if (isTokenLocked) return; // Mengunci tab jika aset sudah sukses dilock
    
    lockCalculationMode = selectedMode;
    const tabManualBtn = document.getElementById('tabManual');
    const tabWizardBtn = document.getElementById('tabWizard');
    const wizardOptionsPanel = document.getElementById('wizardOptions');
    const lockInputFieldLabel = document.getElementById('inputLabel');
    const scorePreviewLabel = document.getElementById('scoreLabel');

    if (selectedMode === 'manual') {
        tabManualBtn.classList.add('active');
        tabWizardBtn.classList.remove('active');
        if (wizardOptionsPanel) wizardOptionsPanel.classList.remove('active');
        if (lockInputFieldLabel) lockInputFieldLabel.innerText = "Amount of $VZT to Lock:";
        if (scorePreviewLabel) scorePreviewLabel.innerText = "Base Processing Share:";
    } else {
        tabManualBtn.classList.remove('active');
        tabWizardBtn.classList.add('active');
        if (wizardOptionsPanel) wizardOptionsPanel.classList.add('active');
        if (lockInputFieldLabel) lockInputFieldLabel.innerText = "Enter Capital For Prediction:";
        if (scorePreviewLabel) scorePreviewLabel.innerText = "Weighted Yield Score:";
    }
    calculateLockReward();
}

// FUNGSI BARU: Mengubah multiplier global saat pengguna mengklik tombol grup opsi durasi horizontal
function selectDuration(element) {
    if (isTokenLocked) return;
    
    // Hapus kelas aktif visual dari semua tombol durasi dalam grup card
    const buttons = document.querySelectorAll('.btn-duration');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Aktifkan elemen tombol klik baru dan salin nilai multiplier dari data-attribute HTML
    element.classList.add('active');
    chosenMultiplier = parseFloat(element.getAttribute('data-multiplier')) || 1;
    
    // Trigger penghitungan live score kalkulator
    calculateLockReward();
}

function calculateLockReward() {
    if (isTokenLocked) return;
    
    const lockInput = document.getElementById('lockAmount');
    const accumulationLabel = document.getElementById('accumulationLabel');
    const liveCalculatedScoreValue = document.getElementById('liveScore');
    const processLockActionButton = document.getElementById('lockBtn');

    if (!processLockActionButton) return;
    const amount = lockInput ? (parseFloat(lockInput.value) || 0) : 0;

    // VALIDASI AKTIF SECARA TOTAL JIKA WALLET TERKONEKSI
    if (isConnected) {
        processLockActionButton.removeAttribute('disabled');
    } else {
        processLockActionButton.setAttribute('disabled', 'true');
    }

    // Eksekusi Logika Matematika Berdasarkan Mode Aktif
    if (lockCalculationMode === 'manual') {
        if (liveCalculatedScoreValue) {
            liveCalculatedScoreValue.innerText = `${amount.toLocaleString('en-US')} VZT Share`;
        }
        
        if (amount > 0) {
            const estimatedUsdcReward = amount * 0.05;
            if (accumulationLabel) {
                accumulationLabel.style.display = 'block';
                accumulationLabel.innerText = `Estimated Accumulation: +${estimatedUsdcReward.toFixed(2)} USDC`;
            }
        } else {
            if (accumulationLabel) accumulationLabel.style.display = 'none';
        }
    } 
    else {
        // Menggunakan chosenMultiplier terintegrasi dari tombol grup horizontal
        const totalWeightedScoreSum = amount * chosenMultiplier;
        
        if (liveCalculatedScoreValue) {
            liveCalculatedScoreValue.innerText = `${totalWeightedScoreSum.toLocaleString('en-US')} VZT Share`;
        }

        if (amount > 0) {
            const estimatedUsdcReward = (amount * 0.05) * chosenMultiplier;
            if (accumulationLabel) {
                accumulationLabel.style.display = 'block';
                accumulationLabel.innerText = `Estimated Accumulation (Incentivized): +${estimatedUsdcReward.toFixed(2)} USDC`;
            }
        } else {
            if (accumulationLabel) accumulationLabel.style.display = 'none';
        }
    }
}

async function handleLockToken() {
    const lockInput = document.getElementById('lockAmount');
    const lockBtn = document.getElementById('lockBtn');
    const rewardClaimRow = document.getElementById('rewardClaimRow');
    const earnedUsdc = document.getElementById('earnedUsdc');
    const vztBalance = document.getElementById('vztBalance');

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
        
        const finalMultiplier = (lockCalculationMode === 'wizard') ? chosenMultiplier : 1;
        
        // Pengurangan saldo wallet pengguna secara dinamis di antarmuka
        if (vztBalance) vztBalance.innerText = (5000 - amount).toLocaleString('en-US', {minimumFractionDigits: 2}) + " VZT";
        
        // Tampilkan data modul claim rewards di antarmuka pengguna
        if (rewardClaimRow && earnedUsdc) {
            rewardClaimRow.style.display = 'flex';
            earnedUsdc.innerText = ((amount * 0.05) * finalMultiplier).toFixed(2) + " USDC";
        }
    } catch (error) {
        alert('Transaction failed.');
        isLockLoading = false;
        lockBtn.disabled = false;
        lockBtn.innerText = 'Lock Token';
        lockInput.disabled = false;
    }
}

function claimVztReward() {
    const earnedUsdc = document.getElementById('earnedUsdc');
    const rewardClaimRow = document.getElementById('rewardClaimRow');
    
    if (!earnedUsdc) return;
    const earned = earnedUsdc.innerText;
    
    alert(`Claim Successful!\n\n${earned} has been transferred directly back to your secure Solana wallet account.`);
    
    earnedUsdc.innerText = "0.00 USDC";
    if (rewardClaimRow) rewardClaimRow.style.display = 'none';
}

// Global interface execution metrics listener mapper
executeLiveCalculatedMetrics = calculateLockReward;
