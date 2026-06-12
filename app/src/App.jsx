import { useState, useEffect } from 'react';
import Landing from './Landing'; // Mengimpor komponen Landing React Opsi A
import ComplianceModal from './components/ComplianceModal'; // INTEGRASI: Mengimpor Pop-up Compliance
import './App.css';

// ==========================================================================
// PROTOCOL SYSTEM CONSTANTS (GLOBAL CONFIGURATION FOR GRANTS REVIEW)
// ==========================================================================
const PROGRAM_ID = "ProvZtoX9vR6qwMKB7zYtE4HnS2PdcG8kLmWq3jF5uBx";
const SOLANA_NETWORK = "mainnet-beta";

// TIME-HORIZON BLOCK CONFIGURATIONS (7 DAYS TIME-LOCK FOR SECURITY ENFORCEMENT)
const BASE_EPOCH_HORIZON_MS = 604800000; // 7 Hari dalam milidetik (Default Horizon)
const EMERGENCY_BURN_PENALTY_RATE = 0.20; // 20% Penalty Rate untuk deflationary burn

// PRICING ORACLE MOCKS
const TOKEN_PRICES = { SOL: 170.00, USDT: 1.00, USDC: 1.00, WSOL: 170.00, VZT: 0.50 };


// ==========================================================================
// MAIN DAPP COMPONENT
// ==========================================================================
function App() {
  // ==========================================================================
  // VIEW NAVIGATION LAYER (OPTI A MIGRATION INTERLOCK)
  // ==========================================================================
  const [view, setView] = useState('landing'); // Mode bawaan awal: 'landing' atau 'dashboard'

  // ==========================================================================
  // 1. GLOBAL STATE MANAGEMENT (MIGRATED FROM MASTER JAVASCRIPT VARS)
  // ==========================================================================
  const [isConnected, setIsConnected] = useState(false);
  const [myWalletAddress, setMyWalletAddress] = useState("");
  const [activeProviderName, setActiveProviderName] = useState(""); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [securityBanner, setSecurityBanner] = useState({ show: false, message: "", type: "success" });
  
  // System Metrics Tracker (Terhubung Langsung ke Landing Page secara Dinamis)
  const [lastTransactionTime, setLastTransactionTime] = useState(0);
  const [isSwapLoading, setIsSwapLoading] = useState(false);
  const [isLockLoading, setIsLockLoading] = useState(false);
  const [isTokenLocked, setIsTokenLocked] = useState(false);
  const [swapsCount, setSwapsCount] = useState(45210); // Metrik dinamis swaps awal
  
  // Perhitungan Keuangan Berbasis Number Murni
  const [vztBalance, setVztBalance] = useState(0); 
  const [stakedAmount, setStakedAmount] = useState(0); // Penampung saldo terkunci
  const [protocolTVL, setProtocolTVL] = useState(1248500);

  // AUTOMATED INSTUTIONAL GRANT REPAYMENT TRACKER STATE
  const [totalRepaid, setTotalRepaid] = useState(0); // Akumulasi awal pengembalian $0
  const GRANT_CAP = 20000; // Batasan Hard Cap senilai $20,000

  // AMM DEX Swap States
  const [payAmount, setPayAmount] = useState('0');
  const [receiveAmount, setReceiveAmount] = useState('0.0');
  const [tokenPay, setTokenPay] = useState('USDC');
  const [tokenReceive, setTokenReceive] = useState('VZT');
  const [swapFee, setSwapFee] = useState('0.0000');
  const [txLog, setTxLog] = useState('');

  // Yield Optimizer States
  const [calcAmount, setCalcAmount] = useState('0');
  const [projection, setProjection] = useState({ daily: "0.00", monthly: "0.00", annual: "0.00" });
  const [isVaultLoading, setIsVaultLoading] = useState(false);

  // VZT Lock & Yield States
  const [lockCalculationMode, setLockCalculationMode] = useState('manual'); 
  const [lockAmount, setLockAmount] = useState('0'); 
  const [chosenMultiplier, setChosenMultiplier] = useState(2.5); 
  const [liveScore, setLiveScore] = useState('0 VZT Share');
  const [estimatedRewardText, setEstimatedRewardText] = useState('');
  const [showRewardRow, setShowRewardRow] = useState(false);
  const [earnedUsdcDisplay, setEarnedUsdcDisplay] = useState('0.00 USDC');
  
  // State Penegakan Aturan Kematangan Blok Kontrak (7-Day Epoch Time-Horizon Simulation)
  const [rewardClaimable, setRewardClaimable] = useState(false);

  // Secure On-Chain Affiliate States
  const [referrerInput, setReferrerInput] = useState('');
  const [referralVolume, setReferralVolume] = useState('$0.00');
  const [tierLabel, setTierLabel] = useState('Bronze (10%)');
  const [tierColor, setTierColor] = useState('#14b8a6');

  // NET HIBRIDA WEB3 STATES (ANTI-BLANK VERCEL)
  const [referrerAddress, setReferrerAddress] = useState(null);
  const [isReferralLoading, setIsReferralLoading] = useState(false);

  // DATA TOKENS CONFIGURATION
  const tokens = [
    { symbol: 'USDC', name: 'USD Coin', priceInUsdc: TOKEN_PRICES.USDC },
    { symbol: 'USDT', name: 'Tether', priceInUsdc: TOKEN_PRICES.USDT },
    { symbol: 'SOL', name: 'Solana', priceInUsdc: TOKEN_PRICES.SOL },
    { symbol: 'WSOL', name: 'Wrapped Solana', priceInUsdc: TOKEN_PRICES.WSOL },
    { symbol: 'VZT', name: 'Provizto Token', priceInUsdc: TOKEN_PRICES.VZT }
  ];

  // ==========================================================================
  // 2. SECURITY NOTIFICATION BANNER CONTROLLER
  // ==========================================================================
  const triggerBanner = (message, type = "success") => {
    setSecurityBanner({ show: true, message, type });
    setTimeout(() => {
      setSecurityBanner(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // ==========================================================================
  // AUTOMATED CAPTURE REFERRAL ADDRESS DARI LINK URL POINTER (?ref=)
  // ==========================================================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref'); 
    
    if (refParam) {
      const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
      if (base58Regex.test(refParam)) {
        setReferrerInput(refParam);
        setReferrerAddress(refParam); 
        
        setTimeout(() => {
          triggerBanner(`🔗 Referral link detected from: ${refParam.slice(0, 6)}...${refParam.slice(-4)}`, "success");
        }, 600);
      } else {
        console.error("Format alamat referral di URL tidak valid secara kriptografi.");
      }
    }
  }, []);

  // ==========================================================================
  // FUNGSI EKSEKUSI PENDAFTARAN REFERRAL HIBRIDA (ANTI-ERROR VERCEL)
  // ==========================================================================
  const registerReferrerOnChain = async () => {
    if (!isConnected) {
      triggerBanner("⚠️ Please connect your simulated secure wallet first!", "error");
      return;
    }

    if (!referrerAddress) {
      triggerBanner("⚠️ Active referrer address context not found.", "error");
      return;
    }

    if (referrerAddress === myWalletAddress) {
      triggerBanner("🛑 Contract Rejection: Self-referral is strictly prohibited!", "error");
      setTxLog(
        `[SMART CONTRACT ERROR: initialize_referral]\n` +
        `Referee (${myWalletAddress.slice(0,4)}...) cannot refer itself.\n` +
        `Result: SelfReferralForbidden`
      );
      return;
    }

    setIsReferralLoading(true);
    setTxLog("Constructing Dynamic On-Chain PDA Layer via Provider Handshake...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      const pdaSuffix = myWalletAddress.slice(2, 10);
      const mockPdaAddress = `RefPDA${pdaSuffix}vztProtocolID`;

      triggerBanner("👑 System Update: Referral established permanently on-chain!", "success");
      setTxLog(
        `[ON-CHAIN KRYPTON LEDGER SUCCESS]\n` +
        `Program ID       : ${PROGRAM_ID}\n` +
        `Transaction Type : initialize_referral\n` +
        `Signer (Referee) : ${myWalletAddress}\n` +
        `Target (Referrer): ${referrerAddress}\n` +
        `Generated PDA    : ${mockPdaAddress}\n` +
        `Status           : 100% Cryptographically Bound`
      );
      
      setReferralVolume("$0.00 (Verified Ledger)");

    } catch (err) {
      console.error("Simulasi transaksi gagal:", err);
      triggerBanner("⚠️ Transaction rejected by block engine.", "error");
    } finally {
      setIsReferralLoading(false);
    }
  };

  // ==========================================================================
  // 3. WALLET CONNECTION ENGINE 
  // ==========================================================================
  const openWalletModal = () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      setIsModalOpen(true);
    }
  };

  const selectWallet = async (walletType) => {
    setIsModalOpen(false);
    triggerBanner(`Initializing handshake with ${walletType === 'phantom' ? 'Phantom 👻' : 'Solflare ☀️'}...`, "warning");
    
    setTimeout(() => {
      const simulatedPubKey = walletType === 'phantom' 
        ? "GNTPhan1234567890zXyCvBNmQrStUvWxYzAaBbCc" 
        : "Solfl1234567890AaBbCcDdEeFfGgHhIiJjKkLl";
      
      executeConnect(walletType === 'phantom' ? 'Phantom' : 'Solflare', simulatedPubKey);
    }, 1200);
  };

  const executeConnect = (walletName, pubKey) => {
    setMyWalletAddress(pubKey);
    setActiveProviderName(walletName);
    setIsConnected(true);

    if (pubKey.startsWith("GNT") || pubKey.length > 30) {
      setVztBalance(1000000.00); 
      triggerBanner(`👑 VIP Grantor Wallet Detected! Core Revenue-Share Active.`, "success");
    } else {
      setVztBalance(5000.00); 
      triggerBanner(`Simulated wallet successfully linked via ${walletName}!`, "success");
    }
  };

  const disconnectWallet = () => {
    setMyWalletAddress("");
    setActiveProviderName("");
    setVztBalance(0);
    setStakedAmount(0);
    setIsConnected(false);
    setIsTokenLocked(false);
    setShowRewardRow(false);
    setRewardClaimable(false);
    setLockAmount('0');
    setLockCalculationMode('manual');
    setPayAmount('');
    setReceiveAmount('0.0');
    setSwapFee('0.0000');
    setTxLog('');
    setTotalRepaid(0); 
    triggerBanner("Simulated wallet disconnected.", "warning");
  };

  // ==========================================================================
  // 4. AMM DEX SWAP CALCULATOR ENGINE
  // ==========================================================================
  useEffect(() => {
    const amount = parseFloat(payAmount) || 0;
    const calculatedFee = amount * 0.003;
    setSwapFee(calculatedFee.toFixed(4));

    const payTokenData = tokens.find(t => t.symbol === tokenPay);
    const receiveTokenData = tokens.find(t => t.symbol === tokenReceive);

    if (payTokenData && receiveTokenData) {
      const totalValueInUsdc = amount * payTokenData.priceInUsdc;
      const rawReceive = totalValueInUsdc / receiveTokenData.priceInUsdc;
      setReceiveAmount(rawReceive.toFixed(4));
    } else {
      setReceiveAmount('0.0');
    }
  }, [payAmount, tokenPay, tokenReceive]);

  const handleTokenChange = (val) => {
    setTokenPay(val);
    setTokenReceive(val === 'VZT' ? 'USDC' : 'VZT');
  };

  const switchTokens = () => {
    if (isSwapLoading) return;
    const tempPay = tokenPay;
    setTokenPay(tokenReceive);
    setTokenReceive(tempPay);
    setPayAmount('');
    setReceiveAmount('0.0');
  };

  const handleLaunchSwap = async () => {
    const amount = parseFloat(payAmount) || 0;
    if (amount <= 0) {
      alert('Please enter a valid token amount first.');
      return;
    }

    setIsSwapLoading(true);
    setTxLog(`Routing private transaction bundle on ${SOLANA_NETWORK} via Jito Engine (MEV Protection)...`);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      const currentFee = parseFloat(swapFee) || 0;
      const payTokenData = tokens.find(t => t.symbol === tokenPay);
      const feeInUsdcValue = payTokenData ? currentFee * payTokenData.priceInUsdc : currentFee;

      const vaultShare = (currentFee * 0.40).toFixed(5);
      const poolShare = (currentFee * 0.30).toFixed(5);
      const affiliateShare = (currentFee * 0.15).toFixed(5);
      const devShare = (currentFee * 0.15).toFixed(5);
      
      const calculatedClawbackUsdc = feeInUsdcValue * 0.15 * 0.20;

      setTotalRepaid((prev) => (prev + calculatedClawbackUsdc >= GRANT_CAP ? GRANT_CAP : prev + calculatedClawbackUsdc));
      setSwapsCount(prev => prev + 1);

      setTxLog(
        `[SWAP SUCCESS] | Program: ${PROGRAM_ID}\n` +
        `Swapped: ${amount} ${tokenPay} ➜ ${receiveAmount} ${tokenReceive}\n` +
        `Protocol Fee (0.3%): ${swapFee} ${tokenPay}\n\n` +
        `[DISTRIBUTION LOG]\n` +
        `• 40% to Yield Optimizer Vault: ${vaultShare} ${tokenPay}\n` +
        `• 30% to VZT Real Yield Pool (Auto-converted to USDC): ${poolShare} ${tokenPay}\n` +
        `• 15% to Affiliate Treasury: ${affiliateShare} ${tokenPay}\n` +
        `• 15% to Dev & Infrastructure: ${devShare} ${tokenPay}\n` +
        `   └── (Allocated 20% for Grant Repayment Share: ${(devShare * 0.2).toFixed(4)} ${tokenPay})`
      );

      if (tokenReceive === 'VZT') {
        setVztBalance(prev => prev + parseFloat(receiveAmount));
      }

      alert(`Swap Successful!\n\nYou exchanged ${amount} ${tokenPay} into ${receiveAmount} ${tokenReceive}.\nProtocol Fee deducted: ${swapFee} ${tokenPay}`);
      setPayAmount('');
      setReceiveAmount('0.0');
    } catch (error) {
      setTxLog('Transaction failed.');
    } finally {
      setIsSwapLoading(false);
    }
  };

  // ==========================================================================
  // 5. AUTO-COMPOUND YIELD OPTIMIZER ENGINE 
  // ==========================================================================
  useEffect(() => {
    const amount = parseFloat(calcAmount) || 0;
    const dailyRate = 0.0011; 
    const dailyProfit = amount * dailyRate;
    const monthlyProfit = amount * (Math.pow(1 + dailyRate, 30) - 1);
    const annualProfit = amount * (Math.pow(1 + dailyRate, 365) - 1);

    setProjection({
      daily: dailyProfit.toFixed(2),
      monthly: monthlyProfit.toFixed(2),
      annual: annualProfit.toFixed(2)
    });
  }, [calcAmount]);

  const handleDepositVault = async () => {
    const amountValue = parseFloat(calcAmount) || 0;

    if (amountValue <= 0) {
      triggerBanner("⚠️ [Validation Error]: Please enter a valid deposit amount greater than 0 USDC!", "warning");
      return;
    }

    const currentTime = Date.now();
    if (currentTime - lastTransactionTime < 10000) {
      triggerBanner(`⚠️ [Simulated Contract Error]: Repetitive transaction detected too fast! Please wait 10 seconds.`, "error");
      return;
    }

    setIsVaultLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setLastTransactionTime(Date.now());
      setProtocolTVL(prev => prev + amountValue); 
      triggerBanner("✅ Success: Deposited " + amountValue.toLocaleString('en-US') + " USDC into the Auto-Compounding Vault!", "success");
    } catch (error) {
      triggerBanner("⚠️ Transaction rejected by network consensus.", "error");
    } finally {
      setIsVaultLoading(false);
    }
  };

  // ==========================================================================
  // 6. VZT POOL CORE METRICS & TIMELOCK LOGIC
  // ==========================================================================
  const switchLockCalculationView = (selectedMode) => {
    if (isTokenLocked) return;
    setLockCalculationMode(selectedMode);
    
    if (selectedMode === 'manual') {
      setLockAmount('0');
    } else {
      setLockAmount('1000');
      setChosenMultiplier(1);
    }
  };

  useEffect(() => {
    if (isTokenLocked) return;
    const amount = parseFloat(lockAmount) || 0;

    if (lockCalculationMode === 'manual') {
      setLiveScore(`${amount.toLocaleString('en-US')} VZT Share`);
      if (amount > 0) {
        setEstimatedRewardText(`Estimated Accumulation: +${(amount * 0.05).toFixed(2)} USDC`);
      } else {
        setEstimatedRewardText('');
      }
    } else {
      const totalWeightedScoreSum = amount * chosenMultiplier;
      setLiveScore(`${totalWeightedScoreSum.toLocaleString('en-US')} VZT Share`);
      if (amount > 0) {
        setEstimatedRewardText(`Estimated Accumulation (Incentivized): +${((amount * 0.05) * chosenMultiplier).toFixed(2)} USDC`);
      } else {
        setEstimatedRewardText('');
      }
    }
  }, [lockAmount, lockCalculationMode, chosenMultiplier, isTokenLocked]);

  const handleLockToken = async () => {
    const amount = parseFloat(lockAmount) || 0;
    if (amount <= 0) {
      alert('Please enter a valid amount of $VZT tokens to lock.');
      return;
    }
    if (amount > vztBalance) {
      alert('Insufficient $VZT balance inside your secure wallet!');
      return;
    }

    setIsLockLoading(true);
    setRewardClaimable(false); 

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(`Successfully locked ${amount} $VZT!`);
      
      setIsTokenLocked(true);
      setStakedAmount(amount); 
      setVztBalance(prev => prev - amount); 
      
      const finalMultiplier = (lockCalculationMode === 'wizard') ? chosenMultiplier : 1;
      setEarnedUsdcDisplay(((amount * 0.05) * finalMultiplier).toFixed(2) + " USDC");
      setShowRewardRow(true);
      setProtocolTVL(prev => prev + (amount * TOKEN_PRICES.VZT)); 

      setTimeout(() => {
        setRewardClaimable(true);
        triggerBanner("✨ Staking Epoch completed! Yield rewards are claimable.", "success");
      }, BASE_EPOCH_HORIZON_MS);

    } catch (error) {
      alert('Transaction failed.');
    } finally {
      setIsLockLoading(false);
    }
  };

  const claimVztReward = () => {
    if (!rewardClaimable) return;
    alert(`Claim Successful!\n\n${earnedUsdcDisplay} transferred back.`);
    setEarnedUsdcDisplay("0.00 USDC");
    setShowRewardRow(false);
  };

  const handleEmergencyUnlock = async () => {
    if (stakedAmount <= 0) return;
    const confirmWithdraw = confirm(`Proceed with Emergency early withdrawal? 20% penalty will be permanently burned.`);
    if (!confirmWithdraw) return;

    setIsLockLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const penaltyAmount = stakedAmount * EMERGENCY_BURN_PENALTY_RATE;
      const finalAmountReturned = stakedAmount - penaltyAmount;

      setVztBalance(prev => prev + finalAmountReturned);
      setProtocolTVL(prev => prev - (stakedAmount * TOKEN_PRICES.VZT));
      
      triggerBanner(`🔥 Success: ${penaltyAmount.toLocaleString()} VZT Burned!`, "success");
      setStakedAmount(0);
      setIsTokenLocked(false);
      setShowRewardRow(false);
      setTxLog(`🔥 Deflationary System: ${penaltyAmount.toFixed(2)} $VZT destroyed from total supply.`);
    } finally {
      setIsLockLoading(false);
    }
  };

  const copyLink = () => {
    if (!isConnected) {
      setIsModalOpen(true);
      return;
    }
    const generatedUrl = `${window.location.origin}${window.location.pathname}?ref=${myWalletAddress}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generatedUrl).then(() => triggerBanner("📋 Link copied!", "success"));
    }
  };

  // CONDITIONAL RENDERING LAYER
  if (view === 'landing') {
    return (
      <>
        <ComplianceModal />
        <Landing totalValueLocked={protocolTVL} swapsCount={swapsCount} onLaunchApp={() => setView('dashboard')} />
      </>
    );
  }

  return (
    <>
      <ComplianceModal />

      {securityBanner.show && (
        <div id="securityBanner" style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          padding: '14px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '0.95rem',
          zIndex: 9999, background: securityBanner.type === "success" ? "#22c55e" : "#ef4444", color: "white"
        }}>
          {securityBanner.message}
        </div>
      )}

      <header className="dapp-header">
        <div className="logo">PROVIZTO <span className="vzt-badge">$VZT</span></div>
        <div className="header-right">
          <button onClick={() => setView('landing')} className="btn-home" style={{ color: 'white', marginRight: '10px' }}>Back to Home</button>
          <button className="btn-connect" onClick={openWalletModal}>
            {isConnected ? `Connected: ${myWalletAddress.slice(0, 4)}...${myWalletAddress.slice(-4)}` : "Connect Wallet"}
          </button>
        </div>
      </header>

      <main className="dapp-container">
        <div className="wallet-status" style={{ color: isConnected ? "#22c55e" : "#94a3b8" }}>
          {isConnected ? `Wallet Status: Connected via ${activeProviderName}` : "Wallet Status: Disconnected"}
        </div>

        {txLog && (
          <div className="security-banner" style={{ background: '#111827', color: '#38bdf8', padding: '15px', borderRadius: '8px', whiteSpace: 'pre-line' }}>
            {txLog}
            <div className="grant-repayment-tracker" style={{ marginTop: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span>Grant Repayment Share Progress</span>
                <span>${totalRepaid.toFixed(2)} / $20,000</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "#374151", borderRadius: "4px", overflow: "hidden", marginTop: "5px" }}>
                <div style={{ width: `${(totalRepaid / GRANT_CAP) * 100}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #22c55e)" }}></div>
              </div>
            </div>
          </div>
        )}

        <section className="products-grid">
          {/* AMM DEX SWAP */}
          <div className="product-card">
            <h3>AMM DEX Swap</h3>
            <input type="number" placeholder="0.0" value={payAmount === '0' ? '' : payAmount} onChange={(e) => setPayAmount(e.target.value)} />
            <select value={tokenPay} onChange={(e) => handleTokenChange(e.target.value)}>
              <option value="USDC">USDC</option><option value="SOL">SOL</option><option value="VZT">VZT</option>
            </select>
            <button className="btn-switch-tokens" onClick={switchTokens}>⇅</button>
            <input type="text" value={receiveAmount} readOnly />
            <button className="btn-action" onClick={isConnected ? handleLaunchSwap : openWalletModal}>Launch Swap</button>
          </div>

          {/* YIELD OPTIMIZER */}
          <div className="product-card">
            <h3>Yield Optimizer</h3>
            <input type="number" placeholder="0.0" value={calcAmount === '0' ? '' : calcAmount} onChange={(e) => setCalcAmount(e.target.value)} />
            <p>Est. Monthly Profit: {projection.monthly} USDC</p>
            <button className="btn-action" onClick={isConnected ? handleDepositVault : openWalletModal}>Open Vaults</button>
          </div>

          {/* LOCK MODULE */}
          <div className="product-card">
            <h3>VZT Lock & Yield</h3>
            <div className="calc-tabs">
              <button className={lockCalculationMode === 'manual' ? 'active' : ''} onClick={() => switchLockCalculationView('manual')}>Instant</button>
              <button className={lockCalculationMode === 'wizard' ? 'active' : ''} onClick={() => switchLockCalculationView('wizard')}>Boosted</button>
            </div>
            <input type="number" value={lockAmount === '0' ? '' : lockAmount} onChange={(e) => setLockAmount(e.target.value)} />
            <p>{liveScore}</p>
            {showRewardRow && <button onClick={claimVztReward}>{rewardClaimable ? "Claim Yield" : "🔒 Staking Locked"}</button>}
            <button className="btn-action" onClick={isConnected ? handleLockToken : openWalletModal}>Lock Token</button>
            <button onClick={handleEmergencyUnlock} style={{ marginTop: "10px", width: "100%", background: "red", color: "white", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "bold" }}>Emergency Unlock</button>
          </div>
        </section>

        {/* AFFILIATE NETWORK PANEL */}
        <section className="affiliate-section" style={{ marginTop: '30px', padding: '20px', background: '#1e293b', borderRadius: '12px' }}>
          <h3>Secure On-Chain Affiliate (Demo)</h3>
          <div className="affiliate-box" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <input type="text" value={isConnected ? `${window.location.origin}${window.location.pathname}?ref=${myWalletAddress}` : `${window.location.origin}${window.location.pathname}`} readOnly style={{ flex: 1, padding: '10px', borderRadius: '6px' }} />
            <button onClick={copyLink} style={{ background: '#14b8a6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold' }}>Copy Link</button>
          </div>

          {referrerAddress && (
            <div style={{ background: "rgba(20, 184, 166, 0.08)", border: "1px dashed #14b8a6", padding: "16px", borderRadius: "8px", marginTop: "15px" }}>
              <p style={{ margin: 0 }}>🚀 Inbound Referral Invited by: <strong>{referrerAddress.toString().slice(0, 6)}...{referrerAddress.toString().slice(-6)}</strong></p>
              <button onClick={registerReferrerOnChain} disabled={isReferralLoading || !isConnected} style={{ marginTop: "12px", background: "#14b8a6", color: "white", width: "100%", padding: "10px", border: "none", borderRadius: "6px", fontWeight: "bold" }}>
                {isReferralLoading ? "Writing PDA Layer..." : !isConnected ? "🔒 Connect Wallet to Confirm" : "Secure & Bind Referral Association"}
              </button>
            </div>
          )}

          <div className="test-panel" style={{ marginTop: '20px' }}>
            <input type="text" placeholder="Enter referrer wallet address..." value={referrerInput} onChange={(e) => setReferrerInput(e.target.value)} />
            <button onClick={verifyReferralOnChain} disabled={!isConnected}>Verify Link</button>
          </div>
        </section>
      </main>
    </>
  );
}

export default App;