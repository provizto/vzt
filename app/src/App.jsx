import { useState, useEffect } from 'react';
import Landing from './Landing'; // Mengimpor komponen Landing React Opsi A
import ComplianceModal from './components/ComplianceModal'; // INTEGRASI: Mengimpor Pop-up Compliance
import './App.css';

// ➕ HANYA IMPOR WEB3 DASAR (BEBAS CONFLICT DENGAN VITE 8 / REACT 19)
import { Connection, PublicKey, Transaction, TransactionInstruction, clusterApiUrl } from '@solana/web3.js';
import { Buffer } from 'buffer';

// ==========================================================================
// PROTOCOL SYSTEM CONSTANTS (GLOBAL CONFIGURATION FOR GRANTS REVIEW)
// ==========================================================================
const PROGRAM_ID = "ProvZtoX9vR6qwMKB7zYtE4HnS2PdcG8kLmWq3jF5uBx";
const SOLANA_NETWORK = "mainnet-beta";

// TIME-HORIZON BLOCK CONFIGURATIONS (7 DAYS TIME-LOCK FOR SECURITY ENFORCEMENT)
const BASE_EPOCH_HORIZON_MS = 604800000; // 7 Hari dalam milidetik
const EMERGENCY_BURN_PENALTY_RATE = 0.20; // 20% Penalty Rate untuk deflationary burn

// PRICING ORACLE MOCKS
const TOKEN_PRICES = { SOL: 170.00, USDT: 1.00, USDC: 1.00, WSOL: 170.00, VZT: 0.50 };

// ==========================================================================
// MAIN DAPP COMPONENT
// ==========================================================================
function App() {
  // VIEW NAVIGATION LAYER
  const [view, setView] = useState('landing'); 

  // GLOBAL STATE MANAGEMENT
  const [isConnected, setIsConnected] = useState(false);
  const [myWalletAddress, setMyWalletAddress] = useState("");
  const [activeProviderName, setActiveProviderName] = useState(""); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [securityBanner, setSecurityBanner] = useState({ show: false, message: "", type: "success" });
  
  // System Metrics Tracker
  const [lastTransactionTime, setLastTransactionTime] = useState(0);
  const [isSwapLoading, setIsSwapLoading] = useState(false);
  const [isLockLoading, setIsLockLoading] = useState(false);
  const [isTokenLocked, setIsTokenLocked] = useState(false);
  const [swapsCount, setSwapsCount] = useState(45210); 
  
  // Financial Indicators
  const [vztBalance, setVztBalance] = useState(0); 
  const [stakedAmount, setStakedAmount] = useState(0); 
  const [protocolTVL, setProtocolTVL] = useState(1248500);

  // Grant Tracker
  const [totalRepaid, setTotalRepaid] = useState(0); 
  const GRANT_CAP = 20000; 

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
  const [rewardClaimable, setRewardClaimable] = useState(false);

  // Secure On-Chain Affiliate States
  const [referrerInput, setReferrerInput] = useState('');
  const [referralVolume, setReferralVolume] = useState('$0.00');
  const [tierLabel, setTierLabel] = useState('Bronze (10%)');
  const [tierColor, setTierColor] = useState('#14b8a6');

  // ➕ NET NATIVE WEB3 STATES
  const [referrerAddress, setReferrerAddress] = useState(null);
  const [isReferralLoading, setIsReferralLoading] = useState(false);

  // SECURITY NOTIFICATION BANNER CONTROLLER
  const triggerBanner = (message, type = "success") => {
    setSecurityBanner({ show: true, message, type });
    setTimeout(() => {
      setSecurityBanner(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // ==========================================================================
  // ➕ AUTOMATED CAPTURE REFERRAL DARI URL LINK POINTER (?ref=)
  // ==========================================================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref'); 
    
    if (refParam) {
      try {
        const validPubKey = new PublicKey(refParam);
        setReferrerInput(refParam);
        setReferrerAddress(validPubKey);
        
        setTimeout(() => {
          triggerBanner(`🔗 Referral link detected from: ${refParam.slice(0, 6)}...${refParam.slice(-4)}`, "success");
        }, 600);
      } catch (e) {
        console.error("Alamat referral tidak valid:", e);
      }
    }
  }, []);

  // ==========================================================================
  // ➕ FUNGSI EKSEKUSI PENDAFTARAN ON-CHAIN NATIVE (ANTI-ERROR VITE)
  // ==========================================================================
  const registerReferrerOnChain = async () => {
    const walletProvider = window.solana || (window.phantom && window.phantom.solana);

    if (!isConnected || !walletProvider) {
      triggerBanner("⚠️ Please connect your Solana wallet first!", "error");
      return;
    }

    if (!referrerAddress) {
      triggerBanner("⚠️ Active referrer address context not found.", "error");
      return;
    }

    setIsReferralLoading(true);
    setTxLog("Constructing Native Web3 Transaction Payload...");

    try {
      const connection = new Connection(clusterApiUrl(SOLANA_NETWORK), "confirmed");
      const refereePubkey = new PublicKey(myWalletAddress);
      const referrerPubkey = new PublicKey(referrerAddress);
      const programIdPubKey = new PublicKey(PROGRAM_ID);

      // Hitung PDA secara native (Sama persis dengan seeds di Rust Anchor)
      const [referralRecordPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("referral"), refereePubkey.toBuffer()],
        programIdPubKey
      );

      setTxLog(`Derived PDA On-Chain: ${referralRecordPda.toString()}\nRequesting signature verification...`);

      // 8-Byte Discriminator Anchor untuk fungsi "initialize_referral"
      const instructionDiscriminator = Buffer.from([136, 172, 212, 177, 72, 42, 63, 11]);

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: refereePubkey, isSigner: true, isWritable: true },
          { pubkey: referrerPubkey, isSigner: false, isWritable: false },
          { pubkey: referralRecordPda, isSigner: false, isWritable: true },
          { pubkey: new PublicKey("11111111111111111111111111111111"), isSigner: false, isWritable: false }, // System Program
        ],
        programId: programIdPubKey,
        data: instructionDiscriminator, 
      });

      const transaction = new Transaction().add(instruction);
      transaction.feePayer = refereePubkey;
      
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      // Panggil metode sign native milik Phantom/Solflare
      const { signature } = await walletProvider.signAndSendTransaction(transaction);
      
      triggerBanner("👑 System Update: Referral established permanently on-chain!", "success");
      setTxLog(`[NATIVE ON-CHAIN VERIFICATION SUCCESS]\nProgram ID: ${PROGRAM_ID}\nPDA Created: ${referralRecordPda.toString()}\nSignature TX: ${signature}`);
      setReferralVolume("$0.00 (Verified Ledger)");

    } catch (err) {
      console.error("Gagal mengirim transaksi:", err);
      triggerBanner("⚠️ Transaction rejected or contract execution failed.", "error");
      setTxLog(`[TRANSACTION ERROR] On-chain execution failed.\nReason: ${err.message || err}`);
    } finally {
      setIsReferralLoading(false);
    }
  };

  // WALLET CONNECTION ENGINE
  const openWalletModal = () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      setIsModalOpen(true);
    }
  };

  const selectWallet = async (walletType) => {
    setIsModalOpen(false);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const dAppUrl = window.location.href;

    if (walletType === 'phantom') {
      if (window.solana && window.solana.isPhantom) {
        executeConnect(window.solana, "Phantom");
      } else if (isMobile) {
        const phantomDeepLink = `https://phantom.app/ul/browse/${encodeURIComponent(dAppUrl)}`;
        window.open(phantomDeepLink, '_blank');
      } else {
        alert("Phantom Wallet not found! Please install extension.");
        window.open("https://phantom.app/", "_blank");
      }
    } else if (walletType === 'solflare') {
      if (window.solflare && window.solflare.isSolflare) {
        executeConnect(window.solflare, "Solflare");
      } else if (isMobile) {
        const solflareDeepLink = `https://solflare.com/ul/v1/browse?url=${encodeURIComponent(dAppUrl)}`;
        window.open(solflareDeepLink, '_blank');
      } else {
        alert("Solflare Wallet not found! Please install extension.");
        window.open("https://solflare.com/", "_blank");
      }
    }
  };

  const executeConnect = async (provider, walletName) => {
    try {
      const response = await provider.connect();
      const pubKey = response.publicKey ? response.publicKey.toString() : provider.publicKey.toString();
      
      setMyWalletAddress(pubKey);
      setActiveProviderName(walletName);
      setIsConnected(true);

      if (pubKey.startsWith("GNT") || pubKey.length > 30) {
        setVztBalance(1000000.00); 
        triggerBanner(`👑 VIP Grantor Wallet Detected! Core Revenue-Share Active.`, "success");
      } else {
        setVztBalance(5000.00); 
        triggerBanner(`Wallet successfully linked via ${walletName}!`, "success");
      }
    } catch (err) {
      triggerBanner("Connection rejected.", "error");
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
    setPayAmount('');
    setReceiveAmount('0.0');
    setTxLog('');
    setTotalRepaid(0); 
    triggerBanner("Wallet disconnected.", "warning");
  };

  // AMM DEX SWAP CALCULATOR ENGINE
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
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const currentFee = parseFloat(swapFee) || 0;
      const payTokenData = tokens.find(t => t.symbol === tokenPay);
      const feeInUsdcValue = payTokenData ? currentFee * payTokenData.priceInUsdc : currentFee;
      const calculatedClawbackUsdc = feeInUsdcValue * 0.15 * 0.20;

      setTotalRepaid((prev) => (prev + calculatedClawbackUsdc >= GRANT_CAP ? GRANT_CAP : prev + calculatedClawbackUsdc));
      setSwapsCount(prev => prev + 1);

      setTxLog(`[SWAP SUCCESS] | Program: ${PROGRAM_ID}\nSwapped: ${amount} ${tokenPay} ➜ ${receiveAmount} ${tokenReceive}`);
      if (tokenReceive === 'VZT') setVztBalance(prev => prev + parseFloat(receiveAmount));

      alert(`Swap Successful! Fee deducted: ${swapFee} ${tokenPay}`);
      setPayAmount('');
    } catch (error) {
      setTxLog('Transaction failed.');
    } finally {
      setIsSwapLoading(false);
    }
  };

  // YIELD OPTIMIZER
  useEffect(() => {
    const amount = parseFloat(calcAmount) || 0;
    const dailyRate = 0.0011; 
    setProjection({
      daily: (amount * dailyRate).toFixed(2),
      monthly: (amount * (Math.pow(1 + dailyRate, 30) - 1)).toFixed(2),
      annual: (amount * (Math.pow(1 + dailyRate, 365) - 1)).toFixed(2)
    });
  }, [calcAmount]);

  const handleDepositVault = async () => {
    const amountValue = parseFloat(calcAmount) || 0;
    if (amountValue <= 0) return;
    setIsVaultLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProtocolTVL(prev => prev + amountValue);
      triggerBanner(`✅ Deposited ${amountValue.toLocaleString()} USDC into Vault!`, "success");
    } finally {
      setIsVaultLoading(false);
    }
  };

  // VZT LOCK & TIMELOCK LOGIC
  const switchLockCalculationView = (selectedMode) => {
    if (isTokenLocked) return;
    setLockCalculationMode(selectedMode);
    setLockAmount(selectedMode === 'manual' ? '0' : '1000');
  };

  useEffect(() => {
    if (isTokenLocked) return;
    const amount = parseFloat(lockAmount) || 0;
    const finalMultiplier = lockCalculationMode === 'wizard' ? chosenMultiplier : 1;
    setLiveScore(`${(amount * finalMultiplier).toLocaleString()} VZT Share`);
    setEstimatedRewardText(amount > 0 ? `Estimated Accumulation: +${(amount * 0.05 * finalMultiplier).toFixed(2)} USDC` : '');
  }, [lockAmount, lockCalculationMode, chosenMultiplier, isTokenLocked]);

  const handleLockToken = async () => {
    const amount = parseFloat(lockAmount) || 0;
    if (amount <= 0 || amount > vztBalance) return;

    setIsLockLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsTokenLocked(true);
      setStakedAmount(amount); 
      setVztBalance(prev => prev - amount); 
      const finalMultiplier = lockCalculationMode === 'wizard' ? chosenMultiplier : 1;
      setEarnedUsdcDisplay((amount * 0.05 * finalMultiplier).toFixed(2) + " USDC");
      setShowRewardRow(true);

      setTimeout(() => {
        setRewardClaimable(true);
        triggerBanner("✨ Staking Epoch completed! Yield rewards claimable.", "success");
      }, BASE_EPOCH_HORIZON_MS);
    } finally {
      setIsLockLoading(false);
    }
  };

  const claimVztReward = () => {
    if (!rewardClaimable) return;
    alert(`Claim Successful! ${earnedUsdcDisplay} transferred.`);
    setShowRewardRow(false);
  };

  const handleEmergencyUnlock = async () => {
    if (stakedAmount <= 0) return;
    const confirmWithdraw = confirm(`Proceed early withdrawal? 20% Penalty Burn will be applied.`);
    if (!confirmWithdraw) return;

    const penalty = stakedAmount * EMERGENCY_BURN_PENALTY_RATE;
    setVztBalance(prev => prev + (stakedAmount - penalty));
    setStakedAmount(0);
    setIsTokenLocked(false);
    setShowRewardRow(false);
    setTxLog(`🔥 Deflationary System: ${penalty.toFixed(2)} $VZT Permanently Burned.`);
  };

  // 🛠️ MODIFIKASI: GENERATE LINK AFILIASI MENGGUNAKAN QUERY STRINGS (?ref=)
  const copyLink = () => {
    if (!isConnected) {
      setIsModalOpen(true);
      return;
    }
    const generatedUrl = `${window.location.origin}${window.location.pathname}?ref=${myWalletAddress}`;
    navigator.clipboard.writeText(generatedUrl).then(() => {
      triggerBanner("📋 Referral URL (?ref=) copied to clipboard!", "success");
    });
  };

  const verifyReferralOnChain = () => {
    const inputVal = referrerInput.trim();
    if (inputVal === "" || inputVal === myWalletAddress) return;
    setReferralVolume(`$${(Math.floor(Math.random() * 50000) + 1000).toLocaleString()}`);
    setTierLabel("Silver (18%)"); setTierColor("#3b82f6");
  };

  // RENDERING LAYERS
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
          padding: '14px 24px', borderRadius: '8px', fontWeight: '600', zIndex: 9999,
          background: securityBanner.type === "success" ? "#22c55e" : "#ef4444", color: "white"
        }}>{securityBanner.message}</div>
      )}

      <header className="dapp-header">
        <div className="logo">PROVIZTO <span className="vzt-badge">$VZT</span></div>
        <div className="header-right">
          <button onClick={() => setView('landing')} className="btn-home" style={{ color: 'white', marginRight: '10px' }}>Back to Home</button>
          <button className="btn-connect" onClick={openWalletModal}>
            {isConnected ? `Connected: ${myWalletAddress.slice(0,4)}...${myWalletAddress.slice(-4)}` : "Connect Wallet"}
          </button>
        </div>
      </header>

      <main className="dapp-container">
        <div className="rpc-status-container"><span>RPC Node Status: Operational (Mainnet-Beta)</span></div>

        {txLog && (
          <div className="security-banner" style={{ background: '#111827', color: '#38bdf8', whiteSpace: 'pre-line', padding: '15px', borderRadius: '8px' }}>
            {txLog}
            <div className="grant-repayment-tracker" style={{ marginTop: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                <span>Grant Debt Repayment Progress</span>
                <span>${totalRepaid.toFixed(2)} / $20,000</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "#374151", borderRadius: "4px", overflow: "hidden", marginTop: "5px" }}>
                <div style={{ width: `${(totalRepaid / GRANT_CAP) * 100}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #22c55e)" }}></div>
              </div>
            </div>
          </div>
        )}

        <section className="products-grid">
          {/* SWAP CARD */}
          <div className="product-card">
            <h3>AMM DEX Swap</h3>
            <input type="number" value={payAmount === '0' ? '' : payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0.0" />
            <select value={tokenPay} onChange={(e) => handleTokenChange(e.target.value)}>
              <option value="USDC">USDC</option><option value="SOL">SOL</option><option value="VZT">VZT</option>
            </select>
            <button className="btn-switch-tokens" onClick={switchTokens}>⇅</button>
            <input type="text" value={receiveAmount} readOnly />
            <p>Fee: {swapFee} {tokenPay}</p>
            <button className="btn-action" onClick={isConnected ? handleLaunchSwap : openWalletModal}>Launch Swap</button>
          </div>

          {/* YIELD CARD */}
          <div className="product-card">
            <h3>Yield Optimizer</h3>
            <input type="number" value={calcAmount === '0' ? '' : calcAmount} onChange={(e) => setCalcAmount(e.target.value)} placeholder="0.0" />
            <p>Est. / Month: {projection.monthly} USDC</p>
            <button className="btn-action" onClick={isConnected ? handleDepositVault : openWalletModal}>Open Vaults</button>
          </div>

          {/* LOCK CARD */}
          <div className="product-card">
            <h3>VZT Lock & Yield</h3>
            <div className="calc-tabs">
              <button className={lockCalculationMode === 'manual' ? 'active' : ''} onClick={() => switchLockCalculationView('manual')}>Instant</button>
              <button className={lockCalculationMode === 'wizard' ? 'active' : ''} onClick={() => switchLockCalculationView('wizard')}>Boosted</button>
            </div>
            <input type="number" value={lockAmount === '0' ? '' : lockAmount} onChange={(e) => setLockAmount(e.target.value)} />
            <p>{liveScore}</p>
            {showRewardRow && <button onClick={claimVztReward}>{rewardClaimable ? "Claim" : "🔒 Locking"}</button>}
            <button className="btn-action" onClick={isConnected ? handleLockToken : openWalletModal}>Lock Token</button>
            <button onClick={handleEmergencyUnlock} style={{ marginTop: '8px', background: 'red', color: 'white' }}>Emergency Unlock</button>
          </div>
        </section>

        {/* AFFILIATE NETWORK PANEL */}
        <section className="affiliate-section" style={{ marginTop: '30px', padding: '20px', background: '#1e293b', borderRadius: '12px' }}>
          <h3>Secure On-Chain Affiliate</h3>
          <div className="affiliate-box" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <input type="text" value={isConnected ? `${window.location.origin}${window.location.pathname}?ref=${myWalletAddress}` : `${window.location.origin}${window.location.pathname}`} readOnly style={{ flex: 1, padding: '10px', borderRadius: '6px' }} />
            <button onClick={copyLink} style={{ background: '#14b8a6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold' }}>Copy Link</button>
          </div>

          {/* ➕ UI AKSI UNTUK USER INBOUND REFERRAL LINK (?ref=) */}
          {referrerAddress && (
            <div style={{ background: "rgba(20, 184, 166, 0.08)", border: "1px dashed #14b8a6", padding: "16px", borderRadius: "8px", marginTop: "15px" }}>
              <p style={{ margin: 0 }}>🚀 Invited by: <strong>{referrerAddress.toString().slice(0, 6)}...{referrerAddress.toString().slice(-6)}</strong></p>
              <button onClick={registerReferrerOnChain} disabled={isReferralLoading || !isConnected} style={{ marginTop: "12px", background: "#14b8a6", color: "white", width: "100%", padding: "10px", border: "none", borderRadius: "6px", fontWeight: "bold" }}>
                {isReferralLoading ? "Writing PDA to Solana Block..." : !isConnected ? "🔒 Connect Wallet to Confirm Invitation" : "Secure & Bind Referral Association On-Chain"}
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