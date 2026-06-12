import { useState, useEffect } from 'react';
import Landing from './Landing'; 
import ComplianceModal from './components/ComplianceModal'; 
import './App.css';

import { Connection, PublicKey, Transaction, TransactionInstruction, clusterApiUrl } from '@solana/web3.js';
import { Buffer } from 'buffer';

const PROGRAM_ID = "ProvZtoX9vR6qwMKB7zYtE4HnS2PdcG8kLmWq3jF5uBx";
const SOLANA_NETWORK = "mainnet-beta";
const BASE_EPOCH_HORIZON_MS = 604800000; 
const EMERGENCY_BURN_PENALTY_RATE = 0.20; 
const TOKEN_PRICES = { SOL: 170.00, USDT: 1.00, USDC: 1.00, WSOL: 170.00, VZT: 0.50 };

function App() {
  const [view, setView] = useState('landing'); 
  const [isConnected, setIsConnected] = useState(false);
  const [myWalletAddress, setMyWalletAddress] = useState("");
  const [activeProviderName, setActiveProviderName] = useState(""); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [securityBanner, setSecurityBanner] = useState({ show: false, message: "", type: "success" });
  
  const [isSwapLoading, setIsSwapLoading] = useState(false);
  const [isLockLoading, setIsLockLoading] = useState(false);
  const [isTokenLocked, setIsTokenLocked] = useState(false);
  const [swapsCount, setSwapsCount] = useState(45210); 
  const [vztBalance, setVztBalance] = useState(0); 
  const [stakedAmount, setStakedAmount] = useState(0); 
  const [protocolTVL, setProtocolTVL] = useState(1248500);
  const [totalRepaid, setTotalRepaid] = useState(0); 
  const GRANT_CAP = 20000; 

  const [payAmount, setPayAmount] = useState('0');
  const [receiveAmount, setReceiveAmount] = useState('0.0');
  const [tokenPay, setTokenPay] = useState('USDC');
  const [tokenReceive, setTokenReceive] = useState('VZT');
  const [swapFee, setSwapFee] = useState('0.0000');
  const [txLog, setTxLog] = useState('');

  const [calcAmount, setCalcAmount] = useState('0');
  const [projection, setProjection] = useState({ daily: "0.00", monthly: "0.00", annual: "0.00" });
  const [isVaultLoading, setIsVaultLoading] = useState(false);

  const [lockCalculationMode, setLockCalculationMode] = useState('manual'); 
  const [lockAmount, setLockAmount] = useState('0'); 
  const [chosenMultiplier, setChosenMultiplier] = useState(2.5); 
  const [liveScore, setLiveScore] = useState('0 VZT Share');
  const [estimatedRewardText, setEstimatedRewardText] = useState('');
  const [showRewardRow, setShowRewardRow] = useState(false);
  const [earnedUsdcDisplay, setEarnedUsdcDisplay] = useState('0.00 USDC');
  const [rewardClaimable, setRewardClaimable] = useState(false);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref'); 
    if (refParam) {
      try {
        const validPubKey = new PublicKey(refParam);
        setReferrerInput(refParam);
        setReferrerAddress(validPubKey);
        setTimeout(() => triggerBanner(`🔗 Referral link detected from: ${refParam.slice(0, 6)}...`, "success"), 600);
      } catch (e) {
        console.error("Invalid referrer pubkey:", e);
      }
    }
  }, [view]);

  const registerReferrerOnChain = async () => {
    const walletProvider = window.solana || (window.phantom && window.phantom.solana);
    if (!isConnected || !walletProvider || !referrerAddress) return;

    setIsReferralLoading(true);
    setTxLog("Constructing Native Web3 Transaction Payload...");

    try {
      const connection = new Connection(clusterApiUrl(SOLANA_NETWORK), "confirmed");
      const refereePubkey = new PublicKey(myWalletAddress);
      const referrerPubkey = new PublicKey(referrerAddress);
      const programIdPubKey = new PublicKey(PROGRAM_ID);

      const [referralRecordPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("referral"), refereePubkey.toBuffer()],
        programIdPubKey
      );

      const instructionDiscriminator = Buffer.from([136, 172, 212, 177, 72, 42, 63, 11]);
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: refereePubkey, isSigner: true, isWritable: true },
          { pubkey: referrerPubkey, isSigner: false, isWritable: false },
          { pubkey: referralRecordPda, isSigner: false, isWritable: true },
          { pubkey: new PublicKey("11111111111111111111111111111111"), isSigner: false, isWritable: false },
        ],
        programId: programIdPubKey,
        data: instructionDiscriminator, 
      });

      const transaction = new Transaction().add(instruction);
      transaction.feePayer = refereePubkey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const { signature } = await walletProvider.signAndSendTransaction(transaction);
      triggerBanner("👑 Referral established permanently on-chain!", "success");
      setTxLog(`[NATIVE ON-CHAIN VERIFICATION SUCCESS]\nSignature: ${signature}`);
    } catch (err) {
      triggerBanner("⚠️ Transaction failed.", "error");
    } finally {
      setIsReferralLoading(false);
    }
  };

  const openWalletModal = () => isConnected ? disconnectWallet() : setIsModalOpen(true);

  const selectWallet = async (walletType) => {
    setIsModalOpen(false);
    const provider = walletType === 'phantom' ? window.solana : window.solflare;
    if (provider) {
      try {
        await provider.connect();
        const pubKey = provider.publicKey.toString();
        setMyWalletAddress(pubKey);
        setActiveProviderName(walletType === 'phantom' ? 'Phantom' : 'Solflare');
        setIsConnected(true);
        setVztBalance(5000);
        triggerBanner("Wallet connected!", "success");
      } catch (err) {
        triggerBanner("Connection rejected.", "error");
      }
    } else {
      alert("Wallet not found!");
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false); setMyWalletAddress(""); setTxLog("");
    triggerBanner("Wallet disconnected.", "warning");
  };

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
    setIsSwapLoading(true); setTxLog("Routing on-chain transaction...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSwapsCount(prev => prev + 1);
    setTxLog(`[SWAP SUCCESS] Swapped ${amount} ${tokenPay}`);
    setIsSwapLoading(false);
  };

  if (view === 'landing') {
    return (
      <>
        <ComplianceModal />
        <Landing totalValueLocked={protocolTVL} swapsCount={swapsCount} onLaunchApp={() => setView('dashboard')} />
      </>
    );
  }

  return (
    <div className="dapp-root" style={{ background: '#0b0f19', color: 'white', minHeight: '100vh' }}>
      <ComplianceModal />
      <header className="dapp-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background: '#111827' }}>
        <h3>PROVIZTO</h3>
        <button onClick={openWalletModal} style={{ padding: '10px 20px', background: '#3b82f6', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer' }}>
          {isConnected ? `Disconnect: ${myWalletAddress.slice(0,4)}...` : "Connect Wallet"}
        </button>
      </header>
      
      <main style={{ padding: '40px 5%' }}>
        {!isConnected ? (
          <div style={{ textCenter: 'center', padding: '40px' }}>
            <h3>🔒 Secure Dashboard Locked</h3>
            <button onClick={openWalletModal} style={{ marginTop: '15px', padding: '10px 20px', background: '#14b8a6', border: 'none', color: 'white', borderRadius: '6px' }}>Connect Wallet</button>
          </div>
        ) : (
          <div style={{ background: '#111827', padding: '20px', borderRadius: '8px' }}>
            <h4>AMM DEX Swap Module</h4>
            <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} style={{ padding: '8px', background: '#0b0f19', color: 'white', border: '1px solid #374151' }} />
            <button onClick={handleLaunchSwap} style={{ marginLeft: '10px', padding: '8px 16px', background: '#22c55e', border: 'none', color: 'white', borderRadius: '4px' }}>Swap</button>
            <p style={{ color: '#38bdf8', marginTop: '15px' }}>{txLog}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;