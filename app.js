/* --- PROVIZTO DAPP LOGIC (ENGLISH EDITION) --- */
let isConnected = false;
let myWalletAddress = "7xVZT...SolanaWallet"; // Fallback address mock
let lastTransactionTime = 0;

// Set Automatic Copyright Year
document.getElementById('copyrightYear').innerText = new Date().getFullYear();

function toggleWallet() {
    connectWallet();
}

// --- REAL SOLANA WALLET CONNECTION (PHANTOM IMPLEMENTATION) ---
async function connectWallet() {
    const walletBtn = document.getElementById('walletBtn');
    const status = document.getElementById('walletStatus');
    const actionButtons = document.querySelectorAll('.btn-action');
    const testBtn = document.getElementById('testBtn');
    const refLink = document.getElementById('refLink');

    // Check for Solana provider availability (Phantom Wallet)
    const isSolanaAvailable = window.solana && window.solana.isPhantom;

    if (!isSolanaAvailable) {
        alert("Solana Wallet not found! Please install Phantom Wallet extension.");
        window.open("https://phantom.app/", "_blank");
        return;
    }

    if (!isConnected) {
        try {
            // Request on-chain connection from the user
            const response = await window.solana.connect();
            const realWalletAddress = response.publicKey.toString();
            myWalletAddress = realWalletAddress; // Override mock with actual connected address

            // Successful connection UI adjustments
            walletBtn.innerText = `Connected: ${realWalletAddress.slice(0, 4)}...${realWalletAddress.slice(-4)}`;
            walletBtn.style.background = "#22c55e";
            
            status.innerText = "Wallet Status: Connected to Solana Mainnet";
            status.style.color = "#22c55e";
            
            refLink.value = `https://provizto.hub/${realWalletAddress}`;
            
            // Enable interactive dApp functions
            actionButtons.forEach(b => b.removeAttribute('disabled'));
            testBtn.removeAttribute('disabled');
            
            isConnected = true;
            console.log("Successfully connected to Solana wallet:", realWalletAddress);
            
            // Optional trigger: Initialize Jupiter terminal swap if available
            if (typeof initJupiterSwap === "function") {
                initJupiterSwap();
            }
        } catch (err) {
            console.error("User rejected wallet connection:", err);
        }
    } else {
        try {
            // Disconnect wallet protocol
            await window.solana.disconnect();
            
            // Reset UI to standard disconnected states
            walletBtn.innerText = "Connect Wallet";
            walletBtn.style.background = "linear-gradient(135deg, #8b5cf6, #3b82f6)";
            
            status.innerText = "Wallet Status: Disconnected (Network: Solana)";
            status.style.color = "#94a3b8";
            
            refLink.value = "https://provizto.hub";
            
            // Disable actions until wallet re-connects
            actionButtons.forEach(b => b.setAttribute('disabled', 'true'));
            testBtn.setAttribute('disabled', 'true');
            
            hideBanner();
            isConnected = false;
            console.log("Wallet disconnected successfully.");
        } catch (err) {
            console.error("Disconnection failed:", err);
        }
    }
}

// Simulated On-Chain Anti-Self-Referral Validation (Reflecting Smart Contract Error codes)
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

// Simulated Cooldown Protection (Reflecting Rust's RateLimited Error code)
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
