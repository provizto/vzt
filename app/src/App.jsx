import { useState, useEffect } from 'react';
import Landing from './Landing'; // Mengimpor komponen Landing React
import ComplianceModal from './components/ComplianceModal'; // Mengimpor Pop-up Compliance
import './App.css';

// ==========================================================================
// PROTOCOL SYSTEM CONSTANTS (GLOBAL CONFIGURATION FOR GRANTS REVIEW)
// ==========================================================================
const PROGRAM_ID = "ProvZtoX9vR6qwMKB7zYtE4HnS2PdcG8kLmWq3jF5uBx";
const SOLANA_NETWORK = "mainnet-beta";
const BASE_EPOCH_HORIZON_MS = 604800000; 
const EMERGENCY_BURN_PENALTY_RATE = 0.20; 
const TOKEN_PRICES = { SOL: 170.00, USDT: 1.00, USDC: 1.00, WSOL: 170.00, VZT: 0.50 };

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

  // VZT Lock States
  const [lockCalculationMode, setLockCalculationMode] = useState('manual'); 
  const [lockAmount, setLockAmount] = useState('0'); 
  const [chosenMultiplier, setChosenMultiplier] = useState(2.5); 
  const [liveScore, setLiveScore] = useState('0 VZT Share');
  const [estimatedRewardText, setEstimatedRewardText] = useState('');
  const [showRewardRow, setShowRewardRow] = useState(false);
  const [earnedUsdcDisplay, setEarnedUsdcDisplay] = useState('0.00 USDC');
  const [rewardClaimable, setRewardClaimable] = useState(false);

  // Secure Affiliate States
  const [referrerInput, setReferrerInput] = useState('');
  const [referralVolume, setReferralVolume] = useState('$0.00');
  const [tierLabel, setTierLabel] = useState('Bronze (10%)');
  const [tierColor, setTierColor] = useState('#14b8a6');
  const [referrerAddress, setReferrerAddress] = useState(null);
  const [isReferralLoading, setIsReferralLoading] = useState(false);

  const tokens = [
    { symbol: 'USDC', priceInUsdc: TOKEN_PRICES.USDC },
    { symbol: 'USDT', priceInUsdc: TOKEN_PRICES.USDT },
    { symbol: 'SOL', priceInUsdc: TOKEN_PRICES.SOL },
    { symbol: 'WSOL', priceInUsdc: TOKEN_PRICES.WSOL },
    { symbol: 'VZT', priceInUsdc: TOKEN_PRICES.VZT }
  ];

  const triggerBanner = (message, type = "success") => {
    setSecurityBanner({ show: true, message, type });
    setTimeout(() => setSecurityBanner(prev => ({ ...prev, show: false })), 4000);
  };

  // URL Capturer Engine
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref'); 
    if (refParam) {
      const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
      if (base58Regex.test(refParam)) {
        setReferrerInput(refParam);
        setReferrerAddress(refParam);
        setTimeout(() => triggerBanner(`🔗 Referral link detected from: ${refParam.slice(0, 6)}...`, "success"), 600);
      }
    }
  }, [view]);

  // Affiliate Register On-Chain
  const registerReferrerOnChain = async () => {
    if (!referrerAddress || referrerAddress === myWalletAddress) return;
    setIsReferralLoading(true);
    setTxLog("Constructing Dynamic On-Chain PDA Layer...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    triggerBanner("👑 Referral established permanently on-chain!", "success");
    setTxLog(`[ON-CHAIN KRYPTON LEDGER SUCCESS]\nProgram ID: ${PROGRAM_ID}\nSigner: ${myWalletAddress}\nTarget: ${referrerAddress}\nStatus: 100% Bound`);
    setIsReferralLoading(false);
  };

  // Connection Handler
  const openWalletModal = () => isConnected ? disconnectWallet() : setIsModalOpen(true);

  const selectWallet = (walletType) => {
    setIsModalOpen(false);
    triggerBanner(`Connecting to ${walletType}...`, "warning");
    setTimeout(() => {
      const mockKey = walletType === 'phantom' ? "GNTPhan1234567890zXyCvBNmQrStUvWxYzAaBbCc" : "Solfl1234567890AaBbCcDdEeFfGgHhIiJjKkLl";
      setMyWalletAddress(mockKey);
      setActiveProviderName(walletType === 'phantom' ? 'Phantom' : 'Solflare');
      setVztBalance(5000.00);
      setIsConnected(true);
      triggerBanner(`Simulated wallet successfully linked via ${walletType}!`, "success");
    }, 1000);
  };

  const disconnectWallet = () => {
    setMyWalletAddress(""); setActiveProviderName(""); setVztBalance(0); setStakedAmount(0); setIsConnected(false); setIsTokenLocked(false); setShowRewardRow(false); setTxLog(''); setTotalRepaid(0); setPayAmount('0'); setCalcAmount('0'); setLockAmount('0');
    triggerBanner("Wallet disconnected.", "warning");
  };

  // Swap Core Calculator
  useEffect(() => {
    const amount = parseFloat(payAmount) || 0;
    setSwapFee((amount * 0.003).toFixed(4));
    const payTokenData = tokens.find(t => t.symbol === tokenPay);
    const receiveTokenData = tokens.find(t => t.symbol === tokenReceive);
    if (payTokenData && receiveTokenData) {
      setReceiveAmount(((amount * payTokenData.priceInUsdc) / receiveTokenData.priceInUsdc).toFixed(4));
    }
  }, [payAmount, tokenPay, tokenReceive]);

  const handleTokenChange = (val) => { setTokenPay(val); setTokenReceive(val === 'VZT' ? 'USDC' : 'VZT'); };
  const switchTokens = () => { const temp = tokenPay; setTokenPay(tokenReceive); setTokenReceive(temp); setPayAmount('0'); };

  const handleLaunchSwap = async () => {
    const amount = parseFloat(payAmount) || 0; if (amount <= 0) return;
    setIsSwapLoading(true); setTxLog("Routing private transaction via Jito Engine...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const payTokenData = tokens.find(t => t.symbol === tokenPay);
    const addedValue = payTokenData ? (amount * 0.003) * payTokenData.priceInUsdc * 0.15 * 0.20 : 0;
    setTotalRepaid(prev => (prev + addedValue >= GRANT_CAP ? GRANT_CAP : prev + addedValue));
    setSwapsCount(prev => prev + 1);
    if (tokenReceive === 'VZT') setVztBalance(prev => prev + parseFloat(receiveAmount));
    setTxLog(`[SWAP SUCCESS] Swapped: ${amount} ${tokenPay} ➜ ${receiveAmount} ${tokenReceive}`);
    alert('Swap Successful!'); setPayAmount('0'); setIsSwapLoading(false);
  };

  // Vault Optimizer
  useEffect(() => {
    const amount = parseFloat(calcAmount) || 0;
    setProjection({
      daily: (amount * 0.0011).toFixed(2),
      monthly: (amount * (Math.pow(1 + 0.0011, 30) - 1)).toFixed(2),
      annual: (amount * (Math.pow(1 + 0.0011, 365) - 1)).toFixed(2)
    });
  }, [calcAmount]);

  const handleDepositVault = async () => {
    const val = parseFloat(calcAmount) || 0; if (val <= 0) return;
    setIsVaultLoading(true); await new Promise((resolve) => setTimeout(resolve, 1200));
    setProtocolTVL(prev => prev + val); triggerBanner(`Deposited ${val} USDC into Vault!`, "success");
    setCalcAmount('0'); setIsVaultLoading(false);
  };

  // Lock Staking Module
  useEffect(() => {
    if (isTokenLocked) return;
    const amount = parseFloat(lockAmount) || 0;
    const mult = lockCalculationMode === 'wizard' ? chosenMultiplier : 1;
    setLiveScore(`${(amount * mult).toLocaleString()} VZT Share`);
    setEstimatedRewardText(amount > 0 ? `Estimated Accumulation: +${(amount * 0.05 * mult).toFixed(2)} USDC` : '');
  }, [lockAmount, lockCalculationMode, chosenMultiplier, isTokenLocked]);

  const handleLockToken = async () => {
    const amount = parseFloat(lockAmount) || 0; if (amount <= 0 || amount > vztBalance) return;
    setIsLockLoading(true); await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsTokenLocked(true); setStakedAmount(amount); setVztBalance(prev => prev - amount);
    const mult = lockCalculationMode === 'wizard' ? chosenMultiplier : 1;
    setEarnedUsdcDisplay((amount * 0.05 * mult).toFixed(2) + " USDC"); setShowRewardRow(true);
    setTimeout(() => setRewardClaimable(true), BASE_EPOCH_HORIZON_MS);
    setIsLockLoading(false);
  };

  const handleEmergencyUnlock = async () => {
    if (stakedAmount <= 0) return;
    if (!confirm("Proceed with early unlock? 20% penalty principal burn will be applied.")) return;
    const penalty = stakedAmount * EMERGENCY_BURN_PENALTY_RATE;
    setVztBalance(prev => prev + (stakedAmount - penalty));
    setStakedAmount(0); setIsTokenLocked(false); setShowRewardRow(false);
    setTxLog(`🔥 Deflationary System: ${penalty.toFixed(2)} $VZT Permanently Burned.`);
  };

  const copyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?ref=${myWalletAddress}`;
    navigator.clipboard.writeText(url).then(() => triggerBanner("📋 Link copied!", "success"));
  };

  const verifyReferralOnChain = () => {
    if (!referrerInput || referrerInput === myWalletAddress) return;
    setReferralVolume(`$${(Math.floor(Math.random() * 40000) + 5000).toLocaleString()}`);
    setTierLabel("Silver (18%)"); setTierColor("#3b82f6");
  };

  // Navigation Logic
  if (view === 'landing') {
    return (
      <>
        <ComplianceModal />
        <Landing totalValueLocked={protocolTVL} swapsCount={swapsCount} onLaunchApp={() => setView('dashboard')} />
      </>
    );
  }

  return (
    <div style={{ background: '#0b0f19', color: 'white', minHeight: '100vh', paddingBottom: '40px' }}>
      <ComplianceModal />

      {/* Floating Notifications */}
      {securityBanner.show && (
        <div style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', padding: '14px 24px', borderRadius: '8px', fontWeight: 'bold', zIndex: 99999, background: securityBanner.type === "success" ? "#22c55e" : "#ef4444" }}>
          {securityBanner.message}
        </div>
      )}

      {/* Navigation Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 5%', background: '#111827', borderBottom: '1px solid #1f2937' }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '1px' }}>PROVIZTO <span style={{ fontSize: '0.75rem', background: '#14b8a6', padding: '2px 6px', borderRadius: '4px' }}>$VZT</span></div>
        <div>
          <button onClick={() => setView('landing')} style={{ background: 'transparent', border: '1px solid #374151', color: 'white', padding: '8px 16px', borderRadius: '6px', marginRight: '10px', cursor: 'pointer' }}>Back to Home</button>
          <button onClick={openWalletModal} style={{ background: isConnected ? "#22c55e" : "#3b82f6", color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            {isConnected ? `Disconnect: ${myWalletAddress.slice(0,4)}...` : "Connect Wallet"}
          </button>
        </div>
      </header>

      {/* Main Condition Interface Container */}
      {!isConnected ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '20px' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>🔒</div>
          <h3>Secure Dashboard Locked</h3>
          <p style={{ color: '#64748b', margin: '5px 0 20px 0', textAlign: 'center', maxWidth: '400px' }}>Please connect your simulated web3 wallet node above to open application routes.</p>
          <button onClick={openWalletModal} style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Initialize Secure Connection</button>
        </div>
      ) : (
        <div style={{ width: '90%', maxWidth: '1200px', margin: '30px auto 0 auto' }}>
          {/* RPC & Transaction Logs */}
          <div style={{ background: '#111827', border: '1px solid #1f2937', padding: '20px', borderRadius: '8px', marginBottom: '25px', fontSize: '0.9rem' }}>
            <p style={{ color: '#22c55e', margin: '0 0 10px 0' }}>● RPC System Active (Network: Solana Mainnet)</p>
            <div style={{ color: '#38bdf8', fontStyle: 'italic', whiteSpace: 'pre-line' }}>{txLog || "System Idle. Ready for cryptographic operations."}</div>
            <div style={{ marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}><span>Grant Repayment Progress Tracker</span><span>${totalRepaid.toFixed(4)} / $20,000</span></div>
              <div style={{ width: '100%', height: '6px', background: '#374151', borderRadius: '3px', overflow: 'hidden' }}><div style={{ width: `${(totalRepaid / GRANT_CAP) * 100}%`, height: '100%', background: '#22c55e' }}></div></div>
            </div>
          </div>

          {/* Grid Modules */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* AMM SWAP CARD */}
            <div style={{ background: '#111827', padding: '20px', borderRadius: '8px', border: '1px solid #1f2937' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#3b82f6' }}>AMM DEX Swap Module</h4>
              <div style={{ marginBottom: '10px' }}>
                <input type="number" value={payAmount === '0' ? '' : payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0.0" style={{ width: '70%', padding: '8px', borderRadius: '4px', border: '1px solid #374151', background: '#0b0f19', color: 'white' }} />
                <select value={tokenPay} onChange={(e) => handleTokenChange(e.target.value)} style={{ width: '25%', marginLeft: '5%', padding: '8px', borderRadius: '4px', background: '#1f2937', color: 'white' }}>
                  <option value="USDC">USDC</option><option value="SOL">SOL</option><option value="VZT">VZT</option>
                </select>
              </div>
              <button onClick={switchTokens} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', margin: '5px 0' }}>⇅ Switch Routes</button>
              <div style={{ marginTop: '5px', marginBottom: '15px' }}>
                <input type="text" value={receiveAmount} readOnly style={{ width: '70%', padding: '8px', borderRadius: '4px', border: '1px solid #374151', background: '#1f2937', color: '#94a3b8' }} />
                <span style={{ marginLeft: '5%', fontWeight: 'bold' }}>{tokenReceive}</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Network Routing Fee (0.3%): {swapFee} {tokenPay}</p>
              <button onClick={handleLaunchSwap} disabled={isSwapLoading} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', background: '#22c55e', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>{isSwapLoading ? 'Processing...' : 'Execute Swap'}</button>
            </div>

            {/* YIELD CARD */}
            <div style={{ background: '#111827', padding: '20px', borderRadius: '8px', border: '1px solid #1f2937' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#8b5cf6' }}>Cross-Vault Yield Optimizer</h4>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 10px 0' }}>Compound Interest Path Injection (Target: 49.1% APY)</p>
              <input type="number" value={calcAmount === '0' ? '' : calcAmount} onChange={(e) => setCalcAmount(e.target.value)} placeholder="Deposit Amount USDC" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #374151', background: '#0b0f19', color: 'white', marginBottom: '15px' }} />
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>Est. Yield Earnings / Month: <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{projection.monthly} USDC</span></div>
              <button onClick={handleDepositVault} disabled={isVaultLoading} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', background: '#8b5cf6', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>{isVaultLoading ? 'Locking into Vault...' : 'Deposit Liquidity'}</button>
            </div>

            {/* STAKING LOCK CARD */}
            <div style={{ background: '#111827', padding: '20px', borderRadius: '8px', border: '1px solid #1f2937' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#14b8a6' }}>VZT Real-Yield Pool Node</h4>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                <button onClick={() => switchLockCalculationView('manual')} style={{ flex: 1, padding: '4px', background: lockCalculationMode === 'manual' ? '#14b8a6' : '#1f2937', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Instant</button>
                <button onClick={() => switchLockCalculationView('wizard')} style={{ flex: 1, padding: '4px', background: lockCalculationMode === 'wizard' ? '#14b8a6' : '#1f2937', color: 'white', border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Boost Multiplier</button>
              </div>
              <input type="number" value={lockAmount === '0' ? '' : lockAmount} onChange={(e) => setLockAmount(e.target.value)} placeholder="VZT Amount" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #374151', background: '#0b0f19', color: 'white', marginBottom: '10px' }} />
              <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>Score Weight: {liveScore}</span><span>{estimatedRewardText}</span></div>
              {showRewardRow && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0b0f19', padding: '8px', borderRadius: '4px', marginBottom: '10px', fontSize: '12px' }}><span>Unclaimed: {earnedUsdcDisplay}</span><button onClick={claimVztReward} style={{ padding: '4px 8px', background: rewardClaimable ? '#22c55e' : '#4b5563', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>{rewardClaimable ? "Claim" : "🔒 Epoch Locked"}</button></div>}
              <button onClick={handleLockToken} disabled={isLockLoading || isTokenLocked} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', background: isTokenLocked ? '#4b5563' : '#14b8a6', color: 'white', fontWeight: 'bold', cursor: isTokenLocked ? 'not-allowed' : 'pointer' }}>{isTokenLocked ? "✓ Capital Locked" : "Execute Staking Lock"}</button>
              <button onClick={handleEmergencyUnlock} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer', fontSize: '12px' }}>Emergency Unlock principal (20% Burn)</button>
            </div>
          </div>

          {/* AFFILIATE NETWORK NODE */}
          <section style={{ background: '#111827', padding: '20px', borderRadius: '8px', border: '1px solid #1f2937', marginTop: '25px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#eab308' }}>On-Chain Node Affiliate Ledger</h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <input type="text" value={`${window.location.origin}${window.location.pathname}?ref=${myWalletAddress}`} readOnly style={{ flex: 1, padding: '10px', borderRadius: '6px', background: '#0b0f19', border: '1px solid #374151', color: '#94a3b8', fontSize: '13px' }} />
              <button onClick={copyLink} style={{ background: '#14b8a6', color: 'white', border: 'none', padding: '0 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Copy Link</button>
            </div>

            {referrerAddress && (
              <div style={{ background: "rgba(20, 184, 166, 0.05)", border: "1px dashed #14b8a6", padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px' }}>🚀 Inbound Path Trigger: Invited by node <strong>{referrerAddress.slice(0,6)}...</strong></p>
                <button onClick={registerReferrerOnChain} disabled={isReferralLoading} style={{ width: '100%', padding: '10px', background: '#14b8a6', border: 'none', color: 'white', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}>{isReferralLoading ? "Registering on Ledger..." : "Commit Node Association On-Chain"}</button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="text" placeholder="Enter referrer node key for simulation..." value={referrerInput} onChange={(e) => setReferrerInput(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #374151', background: '#0b0f19', color: 'white' }} />
              <button onClick={verifyReferralOnChain} style={{ padding: '8px 16px', background: '#3b82f6', border: 'none', color: 'white', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Verify Path</button>
            </div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '15px', fontSize: '13px', color: '#94a3b8' }}>
              <div>Current Node Tier: <span style={{ color: tierColor, fontWeight: 'bold' }}>{tierLabel}</span></div>
              <div>Network Volume: <span style={{ color: 'white', fontWeight: 'bold' }}>{referralVolume}</span></div>
            </div>
          </section>
        </div>
      )}

      {/* WALLET INTEGRATION MODAL BOX */}
      <div style={{ display: isModalOpen ? 'flex' : 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 999999 }}>
        <div style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155', minWidth: '320px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem' }}>Select Solana Wallet Node</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => selectWallet('phantom')} style={{ padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>👻 Phantom Wallet</button>
            <button onClick={() => selectWallet('solflare')} style={{ padding: '12px', borderRadius: '8px', background: '#0f172a', border: '1px solid #334155', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>☀️ Solflare Wallet</button>
          </div>
          <button onClick={() => setIsModalOpen(false)} style={{ marginTop: '20px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>Close Window</button>
        </div>
      </div>
    </div>
  );
}

export default App;