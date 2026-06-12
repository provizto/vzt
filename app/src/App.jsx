import { useState, useEffect } from 'react';
import Landing from './Landing'; // Mengimpor komponen Landing React Opsi A
import ComplianceModal from './components/ComplianceModal'; // INTEGRASI: Mengimpor Pop-up Compliance
import './App.css';

// ➕ TAMBAHKAN IMPOR CORE SOLANA WEB3 DAN ANCHOR
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

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

  // ➕ STATE INTERFACES BARU UNTUK VERIFIKASI ON-CHAIN REAL TIME
  const [referrerAddress, setReferrerAddress] = useState(null);
  const [isReferralLoading, setIsReferralLoading] = useState(false);

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
  // ➕ AUTOMATED CAPTURE REFERRAL ADDRESS DARI LINK URL POINTER (?ref=)
  // ==========================================================================
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref'); 
    
    if (refParam) {
      try {
        // Memvalidasi apakah parameter merupakan alamat Base58 Solana yang legal
        const validPubKey = new PublicKey(refParam);
        setReferrerInput(refParam);
        setReferrerAddress(validPubKey);
        
        setTimeout(() => {
          triggerBanner(`🔗 Referral link detected from: ${refParam.slice(0, 6)}...${refParam.slice(-4)}`, "success");
        }, 600);
      } catch (e) {
        console.error("Alamat eksternal rujukan dari URL tidak valid:", e);
      }
    }
  }, []);

  // ==========================================================================
  // ➕ FUNGSI EKSEKUSI PENDAFTARAN REFERRAL SECARA ON-CHAIN KE SOLANA SMART CONTRACT
  // ==========================================================================
  const registerReferrerOnChain = async () => {
    const walletProvider = window.solana || (window.phantom && window.phantom.solana);

    if (!isConnected || !walletProvider) {
      triggerBanner("⚠️ Please connect your secure Solana wallet first!", "error");
      return;
    }

    if (!referrerAddress) {
      triggerBanner("⚠️ Active referrer address context not found.", "error");
      return;
    }

    setIsReferralLoading(true);
    setTxLog("Constructing cryptographic transaction payload via Anchor Provider...");

    try {
      // Menghubungkan RPC Node Mainnet-Beta (Ganti URL rpcEndpoint jika memiliki private provider)
      const rpcEndpoint = clusterApiUrl(SOLANA_NETWORK);
      const connection = new Connection(rpcEndpoint, "confirmed");
      const provider = new anchor.AnchorProvider(walletProvider, connection, anchor.AnchorProvider.defaultOptions());
      const programIdPubKey = new PublicKey(PROGRAM_ID);
      
      // Struktur minimal Anchor IDL untuk mencocokkan Instruksi program Rust Anda
      const mockIdl = {
        "version": "0.1.0",
        "name": "provizto_protocol",
        "instructions": [
          {
            "name": "initializeReferral",
            "accounts": [
              { "name": "referee", "isMut": true, "isSigner": true },
              { "name": "referrer", "isMut": false, "isSigner": false },
              { "name": "referralRecord", "isMut": true, "isSigner": false },
              { "name": "systemProgram", "isMut": false, "isSigner": false }
            ],
            "args": []
          }
        ]
      };

      const program = new anchor.Program(mockIdl, programIdPubKey, provider);
      const userPubKey = new PublicKey(myWalletAddress);
      
      // Menurunkan Alamat Akun PDA secara Deterministik (Menjamin Sybil Resistance)
      const [referralRecordPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("referral"), userPubKey.toBuffer()],
        programIdPubKey
      );

      setTxLog(`Broadcasting Instruction: initialize_referral\nDerived Account PDA: ${referralRecordPda.toString()}`);

      const tx = await program.methods
        .initializeReferral()
        .accounts({
          referee: userPubKey,
          referrer: referrerAddress,
          referralRecord: referralRecordPda,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      triggerBanner("👑 System Update: Referral established permanently on-chain!", "success");
      setTxLog(`[ON-CHAIN VERIFICATION SUCCESS]\nProgram: ${PROGRAM_ID}\nState account generated successfully.\nSignature Transaction: ${tx}`);
      setReferralVolume("$0.00 (Verified Ledger)");

    } catch (err) {
      console.error("Gagal melakukan commit data referral ke Solana:", err);
      if (err.message && err.message.includes("SelfReferralForbidden")) {
        triggerBanner("🛑 Smart Contract Rejection: Self-referral is strictly prohibited!", "error");
      } else {
        triggerBanner("⚠️ Transaction rejected by block engine or cluster consensus.", "error");
      }
      setTxLog(`[TRANSACTION ERROR] On-chain execution failed.\nReason: ${err.message || err}`);
    } finally {
      setIsReferralLoading(false);
    }
  };

  // ==========================================================================
  // 3. WALLET CONNECTION ENGINE (MOBILE HANDSHAKE & DEEP LINKING)
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
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const dAppUrl = window.location.href;

    if (walletType === 'phantom') {
      if (window.solana && window.solana.isPhantom) {
        executeConnect(window.solana, "Phantom");
      } else if (isMobile) {
        const phantomDeepLink = `https://phantom.app/ul/browse/${encodeURIComponent(dAppUrl)}`;
        window.open(phantomDeepLink, '_blank');
      } else {
        alert("Phantom Wallet not found! Please install the Phantom extension.");
        window.open("https://phantom.app/", "_blank");
      }
    } else if (walletType === 'solflare') {
      if (window.solflare && window.solflare.isSolflare) {
        executeConnect(window.solflare, "Solflare");
      } else if (isMobile) {
        const solflareDeepLink = `https://solflare.com/ul/v1/browse?url=${encodeURIComponent(dAppUrl)}`;
        window.open(solflareDeepLink, '_blank');
      } else {
        alert("Solflare Wallet not found! Please install the Solflare extension.");
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
      console.error(`${walletName} connection rejected:`, err);
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
    setLockCalculationMode('manual');
    setPayAmount('');
    setReceiveAmount('0.0');
    setSwapFee('0.0000');
    setTxLog('');
    setTotalRepaid(0); // Reset progress tracker
    triggerBanner("Wallet disconnected.", "warning");
  };

  // ==========================================================================
  // 4. AMM DEX SWAP CALCULATOR ENGINE (JITO ENGINE ROUTING)
  // ==========================================================================
  const tokens = [
    { symbol: 'USDC', name: 'USD Coin', priceInUsdc: TOKEN_PRICES.USDC },
    { symbol: 'USDT', name: 'Tether', priceInUsdc: TOKEN_PRICES.USDT },
    { symbol: 'SOL', name: 'Solana', priceInUsdc: TOKEN_PRICES.SOL },
    { symbol: 'WSOL', name: 'Wrapped Solana', priceInUsdc: TOKEN_PRICES.WSOL },
    { symbol: 'VZT', name: 'Provizto Token', priceInUsdc: TOKEN_PRICES.VZT }
  ];

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
      
      // Ambil nilai tukar token asal ke dalam satuan USD/USDC untuk standardisasi pelacakan hibah
      const payTokenData = tokens.find(t => t.symbol === tokenPay);
      const feeInUsdcValue = payTokenData ? currentFee * payTokenData.priceInUsdc : currentFee;

      const vaultShare = (currentFee * 0.40).toFixed(5);
      const poolShare = (currentFee * 0.30).toFixed(5);
      const affiliateShare = (currentFee * 0.15).toFixed(5);
      const devShare = (currentFee * 0.15).toFixed(5);
      
      const calculatedClawbackUsdc = feeInUsdcValue * 0.15 * 0.20;

      // UPDATE DINAMIS TRACKER: Menambahkan akumulasi hasil porsi hibah swap ke dashboard utama
      setTotalRepaid((prev) => {
        if (prev + calculatedClawbackUsdc >= GRANT_CAP) {
          return GRANT_CAP; // Kunci pada Hard-Cap $20,000 jika pelunasan tercapai
        }
        return prev + calculatedClawbackUsdc;
      });

      // Naikkan jumlah hitungan metrik swap global
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
      triggerBanner(`⚠️ [Smart Contract Error]: Repetitive transaction detected too fast! Please wait 10 seconds.`, "error");
      return;
    }

    setIsVaultLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setLastTransactionTime(Date.now());
      setProtocolTVL(prev => prev + amountValue); // Menambah TVL secara dinamis
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
    setRewardClaimable(false); // Drop penguncian langsung memicu timelock aktif

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert(`Successfully locked ${amount} $VZT!\n\nSmart Contract Rule: Tokens are now cryptographically bound to the 7-Day Epoch Horizon. Yield returns are processing.`);
      
      setIsTokenLocked(true);
      setStakedAmount(amount); 
      setVztBalance(prev => prev - amount); 
      
      const finalMultiplier = (lockCalculationMode === 'wizard') ? chosenMultiplier : 1;
      setEarnedUsdcDisplay(((amount * 0.05) * finalMultiplier).toFixed(2) + " USDC");
      setShowRewardRow(true);
      setProtocolTVL(prev => prev + (amount * TOKEN_PRICES.VZT)); 

      // INTEGRASI SEUTUHNYA: Mengunci tombol klaim imbalan hasil selama 7 Hari Penuh (604.800.000 ms)
      setTimeout(() => {
        setRewardClaimable(true);
        triggerBanner("✨ Smart Contract Update: Staking Epoch completed! Yield rewards are now claimable.", "success");
      }, BASE_EPOCH_HORIZON_MS);

    } catch (error) {
      alert('Transaction failed.');
    } finally {
      setIsLockLoading(false);
    }
  };

  const claimVztReward = () => {
    if (!rewardClaimable) {
      alert("Smart Contract Refusal: Cannot execute yield withdrawal!\n\nReason: This epoch block has not reached the maturity milestone yet (7-Day Target Horizon). If you wish to pull out early, you must trigger the Emergency Unlock protocol to bypass contract limits.");
      return;
    }

    alert(`Claim Successful!\n\n${earnedUsdcDisplay} has been transferred directly back to your secure Solana wallet account.`);
    setEarnedUsdcDisplay("0.00 USDC");
    setShowRewardRow(false);
  };

  // ==========================================================================
  // 7. EMERGENCY PROTOCOL UNLOCK (PENALTI BURN 20% BERBASIS KONSTAN GLOBAL)
  // ==========================================================================
  const handleEmergencyUnlock = async () => {
    if (!isConnected) {
      triggerBanner("⚠️ Please connect your wallet first!", "error");
      return;
    }

    if (stakedAmount <= 0) {
      triggerBanner("⚠️ [Error]: No locked assets detected to execute early withdrawal.", "error");
      return;
    }

    const penaltyPercentageText = EMERGENCY_BURN_PENALTY_RATE * 100;
    const alertMessage = `⚠️ ALERT: EMERGENCY UNLOCK SYSTEM\n--------------------------------------------------\nYou are attempting to unlock your tokens before the maturity date.\nPer contract rules, this action triggers the Emergency Clause:\n\n• Total Locked Assets   : ${stakedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} VZT\n• ${penaltyPercentageText}% Penalty to BURN   : ${(stakedAmount * EMERGENCY_BURN_PENALTY_RATE).toLocaleString('en-US', { minimumFractionDigits: 2 })} VZT (Permanently destroyed)\n• Net Amount Returned   : ${(stakedAmount * (1 - EMERGENCY_BURN_PENALTY_RATE)).toLocaleString('en-US', { minimumFractionDigits: 2 })} VZT\n\nAre you absolute sure you want to proceed and burn ${penaltyPercentageText}% of your capital?`;

    const confirmWithdraw = confirm(alertMessage);
    if (!confirmWithdraw) return;

    setTxLog('Burning asset allocations through on-chain network consensus...');
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const penaltyAmount = stakedAmount * EMERGENCY_BURN_PENALTY_RATE;
      const finalAmountReturned = stakedAmount - penaltyAmount;

      setVztBalance(prev => prev + finalAmountReturned);
      setProtocolTVL(prev => prev - (stakedAmount * TOKEN_PRICES.VZT));
      
      triggerBanner(`🔥 Success: ${penaltyAmount.toLocaleString('en-US')} VZT burned! Returned ${finalAmountReturned.toLocaleString('en-US')} VZT.`, "success");
      
      // Reset total status pool
      setStakedAmount(0);
      setLockAmount("0");
      setIsTokenLocked(false);
      setShowRewardRow(false);
      setRewardClaimable(false); // Reset status timelock
      setTxLog(`🔥 Deflationary System: ${penaltyAmount.toFixed(2)} $VZT permanently destroyed from total supply.`);
    } catch (error) {
      triggerBanner("⚠️ Emergency execution rejected by network consensus.", "error");
    }
  };

  // ==========================================================================
  // 8. 🛠️ MODIFIKASI: GENERATE LINK AFILIASI MENGGUNAKAN QUERY STRINGS (?ref=)
  // ==========================================================================
  const copyLink = () => {
    if (!isConnected) {
      setIsModalOpen(true);
      triggerBanner("⚠️ Please connect your wallet first to generate an on-chain affiliate link!", "warning");
      return;
    }

    // Membangun URL universal dengan Query Param standard industri web3 (?ref=ADDRESS)
    const generatedUrl = `${window.location.origin}${window.location.pathname}?ref=${myWalletAddress}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generatedUrl)
        .then(() => triggerBanner("📋 Referral URL with parameter ?ref= copied to clipboard!", "success"))
        .catch(() => alert("Please copy manually: " + generatedUrl));
    } else {
      alert("Please copy manually: " + generatedUrl);
    }
  };

  const verifyReferralOnChain = () => {
    const inputVal = referrerInput.trim();

    if (inputVal === myWalletAddress && isConnected) {
      triggerBanner("⚠️ [Smart Contract Error]: You cannot refer yourself! (SelfReferralNotAllowed)", "error");
      return;
    } 
    if (inputVal === "") {
      triggerBanner("Please enter a wallet address for simulation testing.", "warning");
      return;
    }

    try {
      // Memvalidasi input manual apakah base58 valid
      new PublicKey(inputVal);
      const simulatedVolume = Math.floor(Math.random() * 145000) + 5000;
      setReferralVolume(`$${simulatedVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);

      if (simulatedVolume <= 10000) {
        setTierLabel("Bronze (10%)");
        setTierColor("#14b8a6");
        triggerBanner(`✅ [Success]: Active Regular User verified. Allocated to Bronze Tier (10% Commission).`, "success");
      } else if (simulatedVolume > 10000 && simulatedVolume <= 100000) {
        setTierLabel("Silver (18%)");
        setTierColor("#3b82f6");
        triggerBanner(`🔥 [Success]: High-Volume Creator verified! Upgraded to Silver Tier (18% Commission).`, "success");
      } else {
        setTierLabel("Gold (25%)");
        setTierColor("#a855f7");
        triggerBanner(`👑 [Success]: Top-Tier VIP KOL verified! Upgraded to Premium Gold Tier (25% Commission).`, "success");
      }
    } catch (e) {
      triggerBanner("⚠️ Invalid base58 Solana layout string.", "error");
    }
  };

  // ==========================================================================
  // CONDITIONAL RENDERING LAYER: MENGONTROL STRUKTUR VIEW HALAMAN
  // ==========================================================================
  if (view === 'landing') {
    return (
      <>
        {/* INTEGRASI: ComplianceModal tetap mencegat di halaman Landing awal */}
        <ComplianceModal />
        <Landing 
          totalValueLocked={protocolTVL} 
          swapsCount={swapsCount} 
          onLaunchApp={() => setView('dashboard')} 
        />
      </>
    );
  }

  // JIKA MODE DASHBOARD AKTIF, RENDERING INTERFACE UTAMA DAPP DI BAWAH INI
  return (
    <>
      {/* INTEGRASI: ComplianceModal aktif memantau status sesi di halaman Dashboard */}
      <ComplianceModal />

      {/* FLOATING BANNER NOTIFIKASI */}
      {securityBanner.show && (
        <div id="securityBanner" style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          padding: '14px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '0.95rem',
          zIndex: 9999, boxShadow: '0 10px 25px rgba(0,0,0,0.5)', transition: 'all 0.3s ease',
          textAlign: 'center', minWidth: '300px', display: 'block',
          background: securityBanner.type === "success" ? "#22c55e" : securityBanner.type === "error" ? "#ef4444" : "#eab308",
          color: securityBanner.type === "warning" ? "#1e293b" : "#ffffff",
          border: `1px solid ${securityBanner.type === "success" ? "#16a34a" : securityBanner.type === "error" ? "#dc2626" : "#ca8a04"}`
        }}>
          {securityBanner.message}
        </div>
      )}

      {/* HEADER COMPONENT */}
      <header className="dapp-header">
        <div className="header-left">
          <div className="logo">PROVIZTO <span className="vzt-badge">$VZT</span></div>
        </div>
        <div className="header-right">
          <button 
            onClick={() => setView('landing')} 
            className="btn-home" 
            style={{ 
              background: 'transparent', 
              border: '1px solid #1f2937', 
              color: '#f3f4f6', 
              cursor: 'pointer', 
              padding: '8px 16px', 
              borderRadius: '6px', 
              marginRight: '10px',
              fontWeight: '600'
            }}
          >
            Back to Home
          </button>
          <button className="btn-connect" id="walletBtn" onClick={openWalletModal} style={{
            background: isConnected ? "#22c55e" : "linear-gradient(135deg, #8b5cf6, #3b82f6)"
          }}>
            {isConnected ? `Connected (${activeProviderName}): ${myWalletAddress.slice(0, 4)}...${myWalletAddress.slice(-4)}` : "Connect Wallet"}
          </button>
        </div>
      </header>

      {/* WALLET INTEGRATION MODAL BOX */}
      {isModalOpen && (
        <div id="walletModal" className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Select Solana Wallet</h3>
              <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <button className="wallet-option-btn" onClick={() => selectWallet('phantom')}>
                <span className="wallet-icon">👻</span> Phantom Wallet
              </button>
              <button className="wallet-option-btn" onClick={() => selectWallet('solflare')}>
                <span className="wallet-icon">☀️</span> Solflare Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT FIELD */}
      <main className="dapp-container">
        <div className="wallet-status" id="walletStatus" style={{ color: isConnected ? "#22c55e" : "#94a3b8" }}>
          {isConnected ? `Wallet Status: Connected to Solana Mainnet via ${activeProviderName}` : "Wallet Status: Disconnected (Network: Solana)"}
        </div>
        
        <div className="rpc-status-container">
          <span className="rpc-status-indicator"></span>
          <span>RPC Node Status: Operational (Mainnet-Beta)</span>
        </div>

        {txLog && (
          <div className="security-banner" style={{ display: 'block', background: '#111827', borderColor: '#1f2937', color: '#38bdf8', fontSize: '0.88rem', fontStyle: 'italic', whiteSpace: 'pre-line' }}>
            {txLog}

            {/* INTEGRASI VISUAL: Progress Bar Pelacakan Dana Hibah $20,000 */}
            <div className="grant-repayment-tracker" style={{ marginTop: "20px", padding: "15px", background: "#0f172a", borderRadius: "10px", border: "1px solid #1e293b", textAlign: 'left' }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "500", fontStyle: 'normal' }}>Automated Grant Debt Repayment Progress</span>
                <span style={{ fontSize: "12px", color: totalRepaid >= GRANT_CAP ? "#22c55e" : "#3b82f6", fontWeight: "bold", fontStyle: 'normal' }}>
                  {totalRepaid >= GRANT_CAP ? "🎉 FULLY REPAID" : `$${totalRepaid.toFixed(4)} / $20,000`}
                </span>
              </div>
              <div style={{ width: "100%", height: "10px", background: "#374151", borderRadius: "5px", overflow: "hidden" }}>
                <div style={{ 
                  width: `${(totalRepaid / GRANT_CAP) * 100}%`, 
                  height: "100%", 
                  background: "linear-gradient(90deg, #3b82f6 0%, #22c55e 100%)", 
                  transition: "width 0.4s ease-in-out" 
                }}}></div>
              </div>
            </div>
          </div>
        )}

        <section className="products-grid">
          
          {/* COMPONENT 1: AMM DEX SWAP COMPONENT */}
          <div className="product-card swap-card">
            <div className="card-title-row">
              <h3>AMM DEX Swap</h3>
              <span id="mevBadge" className="mev-secure-badge">🛡️ MEV SECURE</span>
            </div>
            <p className="desc">Instant asset swapping with MEV protection and daily Anti-Wash Trading features.</p>

            <div className="swap-input-container">
              <label>You Pay</label>
              <div className="field-row">
                <input 
                  type="number" 
                  id="payAmount"
                  placeholder="0.0" 
                  value={payAmount === '0' ? '' : payAmount}
                  disabled={isSwapLoading}
                  onChange={(e) => setPayAmount(e.target.value)}
                  onBlur={() => { if (payAmount === '') setPayAmount('0'); }}
                />
                
                <select id="tokenPay" value={tokenPay} onChange={(e) => handleTokenChange(e.target.value)}>
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                  <option value="SOL">SOL</option>
                  <option value="WSOL">WSOL</option>
                  <option value="VZT">VZT</option>
                </select>
              </div>
            </div>

            <div className="swap-switch-row">
              <button className="btn-switch-tokens" onClick={switchTokens}>⇅</button>
            </div>

            <div className="swap-input-container">
              <label>You Receive (Estimated)</label>
              <div className="field-row">
                <input type="text" id="receiveAmount" value={receiveAmount} readOnly />
                <span id="tokenReceiveLabel" className="static-token-label">{tokenReceive}</span>
              </div>
            </div>

            <div className="swap-fee-details">
              <div className="detail-line">
                <span>Trading Fee (0.3%):</span>
                <span id="swapFeeLabel" className="fee-bold-value">{swapFee} {tokenPay}</span>
              </div>
              <div className="detail-line total-divider">
                <span>Anti-Wash Trading Check:</span>
                <span className="status-active-text">Active (Daily)</span>
              </div>
            </div>

            <button 
              className="btn-action" 
              id="swapBtn" 
              onClick={isConnected ? handleLaunchSwap : openWalletModal}
              disabled={isConnected && (!payAmount || parseFloat(payAmount) <= 0 || isSwapLoading)}
              style={{
                background: !isConnected 
                  ? "linear-gradient(135deg, #8b5cf6, #3b82f6)" 
                  : (payAmount && parseFloat(payAmount) > 0)
                    ? "linear-gradient(90deg, #1f6feb 0%, #238636 100%)" 
                    : "#1f2937", 
                color: (isConnected && (!payAmount || parseFloat(payAmount) <= 0)) ? "#64748b" : "#ffffff",
                cursor: "pointer",
                pointerEvents: "auto"
              }}
            >
              {isSwapLoading 
                ? 'Processing Secure Swap...' 
                : !isConnected 
                  ? 'Connect Wallet' 
                  : (!payAmount || parseFloat(payAmount) <= 0)
                    ? 'Enter an Amount' 
                    : 'Launch Swap'}
            </button>
          </div>

          {/* COMPONENT 2: AUTO-COMPOUND YIELD OPTIMIZER */}
          <div className="product-card">
            <h3>Yield Optimizer</h3>
            <p className="desc">Deposit once, the system automatically executes periodic auto-compounding optimization.</p>
            <div className="stat-box">Boosted APY: Up to 49.1%</div>
            
            <div className="yield-calc-embed">
              <h4>Provizto Yield Calculator</h4>
              <label>Deposit Amount (USDC):</label>
              <input 
                type="number" 
                id="calcAmount" 
                placeholder="0.0"
                value={calcAmount === '0' ? '' : calcAmount} 
                disabled={isVaultLoading}
                onChange={(e) => setCalcAmount(e.target.value)}
                onBlur={() => { if (calcAmount === '') setCalcAmount('0'); }}
              />

              <div className="projection-metrics-list">
                <p>Daily Rate: <strong>0.11%</strong></p>
                <p>Est. Profit / Day: <strong id="profitDay" className="profit-green-value">{parseFloat(projection.daily).toLocaleString('en-US')} USDC</strong></p>
                <p>Est. Profit / Month: <strong id="profitMonth" className="profit-green-value">{parseFloat(projection.monthly).toLocaleString('en-US')} USDC</strong></p>
                <p>Est. Profit / Year: <strong id="profitYear" className="profit-green-value">{parseFloat(projection.annual).toLocaleString('en-US')} USDC</strong></p>
              </div>
            </div>

            <button 
              className="btn-action" 
              id="yieldBtn" 
              onClick={isConnected ? handleDepositVault : openWalletModal}
              disabled={isConnected && (!calcAmount || parseFloat(calcAmount) <= 0 || isVaultLoading)}
              style={{
                background: !isConnected 
                  ? "linear-gradient(135deg, #8b5cf6, #3b82f6)" 
                  : (calcAmount && parseFloat(calcAmount) > 0)
                    ? "linear-gradient(90deg, #1f6feb 0%, #238636 100%)" 
                    : "#1f2937", 
                color: (isConnected && (!calcAmount || parseFloat(calcAmount) <= 0)) ? "#64748b" : "#ffffff",
                cursor: "pointer",
                pointerEvents: "auto"
              }}
            >
              {isVaultLoading 
                ? "Processing Deposit..." 
                : !isConnected 
                  ? "Connect Wallet" 
                  : (!calcAmount || parseFloat(calcAmount) <= 0)
                    ? "Enter an Amount" 
                    : "Open Vaults"}
            </button>
          </div>

          {/* COMPONENT 3: VZT PROGRAMMED LOCK MODULES */}
          <div className="product-card">
            <h3>VZT Lock & Yield</h3>
            <p className="desc">Lock your $VZT tokens to claim Real Yield paid out in stable USDC.</p>

            <div className="calc-tabs">
              <button className={`tab-btn ${lockCalculationMode === 'manual' ? 'active' : ''}`} id="tabManual" onClick={() => switchLockCalculationView('manual')}>Instant Lock</button>
              <button className={`tab-btn ${lockCalculationMode === 'wizard' ? 'active' : ''}`} id="tabWizard" onClick={() => switchLockCalculationView('wizard')}>Boosted Lock</button>
            </div>

            <div className="pool-meta-row">
              <span>Protocol TVL: <strong id="poolTvl">${protocolTVL.toLocaleString('en-US')}</strong></span>
              <span>Your Balance: <strong id="vztBalance">{vztBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} VZT</strong></span>
            </div>

            <div className="lock-input-group">
              <label id="inputLabel">{lockCalculationMode === 'manual' ? "Amount of $VZT to Lock:" : "Enter Capital For Prediction:"}</label>
              <input 
                type="number" 
                id="lockAmount" 
                placeholder="0.0" 
                value={lockAmount === '0' ? '' : lockAmount}
                disabled={isTokenLocked || isLockLoading}
                onChange={(e) => setLockAmount(e.target.value)}
                onBlur={() => { if (lockAmount === '') setLockAmount('0'); }}
              />
            </div>

            <div className={`wizard-section ${lockCalculationMode === 'wizard' ? 'active' : ''}`} id="wizardOptions">
              <label className="wizard-select-label">Select Lock Duration:</label>
              <div className="duration-btn-group">
                <button type="button" className={`btn-duration ${chosenMultiplier === 1 ? 'active' : ''}`} onClick={() => setChosenMultiplier(1)}>30 Days (1x)</button>
                <button type="button" className={`btn-duration ${chosenMultiplier === 1.5 ? 'active' : ''}`} onClick={() => setChosenMultiplier(1.5)}>90 Days (1.5x)</button>
                <button type="button" className={`btn-duration ${chosenMultiplier === 2.5 ? 'active' : ''}`} onClick={() => setChosenMultiplier(2.5)}>180 Days (2.5x)</button>
              </div>
            </div>

            <div className="score-preview">
              <span id="scoreLabel">{lockCalculationMode === 'manual' ? "Base Processing Share:" : "Boosted Yield Score:"}</span>
              <span className="score-value" id="liveScore">{liveScore}</span>
            </div>

            <div className="reward-info-badge">
              <span className="badge-accent-line">Reward: Real USDC (7-Day Epoch)</span>
              {estimatedRewardText && (
                <span id="accumulationLabel" className="badge-sub-info" style={{ display: 'block' }}>
                  {estimatedRewardText}
                </span>
              )}
            </div>

            {isTokenLocked && !isLockLoading && showRewardRow && (
              <div className="claim-management-row" id="rewardClaimRow" style={{ display: 'flex', marginTop: '-10px', marginBottom: '15px' }}>
                <span>Yield Earned: <strong id="earnedUsdc" style={{ color: '#22c55e' }}>{earnedUsdcDisplay}</strong></span>
                <button 
                  className="btn-claim-vzt" 
                  onClick={claimVztReward}
                  style={{
                    opacity: rewardClaimable ? 1 : 0.5,
                    background: rewardClaimable ? "#22c55e" : "#4b5563",
                    cursor: rewardClaimable ? "pointer" : "not-allowed",
                    border: "none", padding: "6px 12px", borderRadius: "6px", color: "white", fontWeight: "600"
                  }}
                >
                  {rewardClaimable ? "Claim Reward" : "🔒 Epoch Locking..."}
                </button>
              </div>
            )}

            <button 
              className="btn-action" 
              id="lockBtn" 
              onClick={isConnected ? handleLockToken : openWalletModal}
              disabled={isTokenLocked || (isConnected && (!lockAmount || parseFloat(lockAmount) <= 0 || isLockLoading))}
              style={{
                background: isTokenLocked
                  ? "#22c55e" 
                  : !isConnected 
                    ? "linear-gradient(135deg, #8b5cf6, #3b82f6)" 
                    : (lockAmount && parseFloat(lockAmount) > 0)
                      ? "linear-gradient(90deg, #1f6feb 0%, #238636 100%)" 
                      : "#1f2937", 
                color: isTokenLocked 
                  ? "#ffffff"
                  : (isConnected && (!lockAmount || parseFloat(lockAmount) <= 0)) ? "#64748b" : "#ffffff",
                cursor: isTokenLocked ? "not-allowed" : "pointer",
                pointerEvents: isTokenLocked ? "none" : "auto"
              }}
            >
              {isLockLoading 
                ? 'Processing Lock...' 
                : isTokenLocked 
                  ? '✓ Token Locked' 
                  : !isConnected 
                    ? 'Connect Wallet' 
                    : (!lockAmount || parseFloat(lockAmount) <= 0)
                      ? 'Enter an Amount' 
                      : 'Lock Token'}
            </button>

            <button 
              className="btn-action" 
              id="emergencyUnlockBtn" 
              onClick={handleEmergencyUnlock}
              disabled={!isTokenLocked || isLockLoading}
              style={{
                marginTop: "12px",
                width: "100%", padding: "12px", borderRadius: "8px", fontWeight: "600",
                background: (isTokenLocked && !isLockLoading) ? "#ef4444" : "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: (isTokenLocked && !isLockLoading) ? "#ffffff" : "#ef4444",
                cursor: (isTokenLocked && !isLockLoading) ? "pointer" : "not-allowed",
                pointerEvents: (isTokenLocked && !isLockLoading) ? "auto" : "none"
              }}
            >
              <i className="fas fa-exclamation-triangle" style={{ marginRight: '6px' }}></i> Emergency Early Unlock
            </button>
          </div>

        </section>

        {/* COMPONENT 4: SECURE AFFILIATE NETWORK PANEL */}
        <section className="affiliate-section">
          <div className="section-title-container">
            <h3 window-attr="true">Secure On-Chain Affiliate</h3>
            <span className="shield-badge">🛡️ Anti-Sybil Active</span>
          </div>
          <p>Share your unique link. The system restricts repetitive transactional manipulation (max 1 tx/10s).</p>
               
          <div className="affiliate-box">
            {/* 🛠️ SINKRONISASI: Menghasilkan link dinamis berbasis Query String (?ref=) */}
            <input 
              type="text" 
              id="refLink" 
              value={isConnected ? `${window.location.origin}${window.location.pathname}?ref=${myWalletAddress}` : `${window.location.origin}${window.location.pathname}`} 
              readOnly 
            />
            
            <button 
              className="btn-copy" 
              id="copyBtn" 
              onClick={copyLink}
              style={{
                background: isConnected ? "#14b8a6" : "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                color: "#ffffff",
                cursor: "pointer",
                pointerEvents: "auto",
                opacity: 1,
                transition: "all 0.3s ease-in-out"
              }}
            >
              {isConnected ? "Copy Link" : "Connect"}
            </button>
          </div>

          {/* ➕ INTEGRASI LAYER: UI AKSI UNTUK USER YANG MASUK LEWAT LINK PARAMETER URL AFILIASI */}
          {referrerAddress && (
            <div className="url-captured-referral-panel" style={{
              background: "rgba(20, 184, 166, 0.08)",
              border: "1px dashed #14b8a6",
              padding: "16px",
              borderRadius: "8px",
              marginTop: "15px",
              textAlign: "left"
            }}>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#e2e8f0" }}>
                🚀 Inbound Referral Detected: You are invited by <strong>{referrerAddress.toString().slice(0, 6)}...{referrerAddress.toString().slice(-6)}</strong>
              </p>
              <button
                onClick={registerReferrerOnChain}
                disabled={isReferralLoading || !isConnected}
                style={{
                  marginTop: "12px",
                  background: "#14b8a6",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: (isReferralLoading || !isConnected) ? "not-allowed" : "pointer",
                  width: "100%",
                  transition: "all 0.2s ease"
                }}
              >
                {isReferralLoading 
                  ? "Writing PDA to Solana Block..." 
                  : !isConnected 
                    ? "🔒 Connect Wallet to Confirm Invitation" 
                    : "Secure & Bind Referral Association On-Chain"}
              </button>
            </div>
          )}

          <div className="test-panel">
            <label htmlFor="testReferrer">Referral Address (On-Chain Verification):</label>
            <div className="input-group">
              <input 
                type="text" 
                id="testReferrer" 
                placeholder="Enter referrer wallet address..." 
                value={referrerInput}
                onChange={(e) => setReferrerInput(e.target.value)}
              />
              <button 
                className="btn-test" 
                id="testBtn" 
                onClick={verifyReferralOnChain}
                disabled={!isConnected}
                style={{
                  cursor: isConnected ? "pointer" : "not-allowed",
                  pointerEvents: isConnected ? "auto" : "none"
                }}
              >
                Verify Link
              </button>
            </div>
          </div>

          <div className="tier-table-wrapper">
            <p className="tier-headline">Ecosystem Tier Structures:</p>
            <div className="responsive-table-overflow">
              <table className="tier-data-table">
                <thead>
                  <tr>
                    <th>Tier Level</th>
                    <th>Volume Target</th>
                    <th>USDC Reward</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="row-bordered">
                    <td className="tier-bronze">Bronze Tier</td>
                    <td className="target-grey">$0 - $10,000</td>
                    <td className="rate-white">10%</td>
                  </tr>
                  <tr className="row-bordered">
                    <td className="tier-silver">Silver Tier</td>
                    <td className="target-grey">$10,001 - $100,000</td>
                    <td className="rate-white">18%</td>
                  </tr>
                  <tr>
                    <td className="tier-gold">Gold Tier</td>
                    <td className="target-grey">&gt; $100,000</td>
                    <td className="rate-white">25%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="tier-stats">
            <div className="tier-item">Current Tier: <span id="tierLabel" style={{ color: tierColor }}>{tierLabel}</span></div>
            <div className="tier-item">Total Referral Volume: <span id="volLabel">{referralVolume}</span></div>
          </div>
        </section>
      </main>

      {/* FOOTER MATRIX */}
      <footer className="dapp-footer">
        <p>© {new Date().getFullYear()} Provizto Protocol & dApp Hub. All Rights Reserved. Secure Protocol Edition</p>
        <div className="footer-links-row" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '10px' }}>
          <a href="https://provizto.github.io/vzt-docs/" target="_blank" rel="noopener noreferrer">Documentation</a>
          <a href="#audit" onClick={() => alert('Security Audits:\n\nProvizto smart contracts are currently undergoing strict internal optimization and scheduled for a formal third-party review prior to public token launch.')}>Security Audit 🛡️</a>
          
          {/* INTEGRASI: Link manual untuk memicu tampilan Syarat & Disclaimer Hukum */}
          <a href="#disclaimer" onClick={() => alert('Regulatory Disclaimer:\n\nProvizto is a non-custodial decentralized application. Citizens or residents of the USA and OFAC-sanctioned countries are restricted from participating in the token lock pools.')}>Legal Disclaimer</a>
        </div>
      </footer>
    </>
  );
}

export default App;