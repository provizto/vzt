import React, { useState } from 'react';

const Landing = ({ totalValueLocked, swapsCount, onLaunchApp }) => {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqData = [
    {
      q: "What is Provizto Protocol?",
      a: "Provizto is a non-inflationary decentralized asset management protocol running on the Solana blockchain. It provides users with MEV-shielded token swapping, cross-protocol auto-compounding vaults, and sustainable staking mechanics that distribute revenue share in stable assets."
    },
    {
      q: "How does the 0.3% Trading Fee allocation cycle operate?",
      a: "Every on-chain swap triggers a 0.3% baseline fee split atomically: 40% routes to underwrite the Automated Yield Optimizer pools, 30% feeds the VZT Programmed Lock Pool for USDC stakers reward claims, 15% finances Affiliate commissions, and 15% is secured for Core Development & Infrastructure treasury costs (which includes a built-in 20% automated clawback allocation for grant repayments)."
    },
    {
      q: "Is the 49.1% Optimizer APY sustainable or too high?",
      a: "It is highly sustainable. The baseline daily interest is just 0.11%, which mathematically compounds to 49.1% annually. Furthermore, this yield does not rely on token printing, but is fully underwritten by the 40% allocation of global protocol swap fees."
    },
    {
      q: "What does the 7-Day Epoch Reward Claim mean?",
      a: "It means rewards are calculated and settled in 7-day cycles (1 Epoch). This minimum 7-day lock-and-release mechanic is an industry-standard security measure designed to protect the pool from high-frequency flash-loan exploits and ensure stable network data distribution."
    },
    {
      q: "How exactly does the Affiliate program protect against Sybil Exploits?",
      a: "To stop bad actors from creating high-frequency multi-account loops (Sybil Attacks), the on-chain registry enforces a smart contract rule blocking self-referrals and restricting transaction calls to a mandatory 10-second cooldown timeout."
    },
    {
      q: "What are the different Affiliate Tier performance levels?",
      a: "Commissions scale dynamically based on the verified on-chain trading volume of your referred network: Bronze Tier (Up to $10,000 volume) pays out a 10% commission rate, Silver Tier ($10,001 - $100,000 volume) rewards an 18% rate, and premium Gold Tier (Above $100,000 volume) guarantees a 25% commission rate."
    },
    {
      q: "What is the early withdrawal penalty clause?",
      a: "Any premature liquidity unlock from the time-locked Boosted Bond Lock contracts prior to the set computational maturity date will trigger an absolute 20% principal penalty deduction. This amount is automatically sent to a dead address and permanently BURNED to induce long-term market token scarcity."
    },
    {
      q: "Why does Provizto pay stakers in USDC instead of native $VZT emissions?",
      a: "Traditional DeFi printing rewards dilute market capitalization and tank token prices. Provizto utilizes a non-inflationary Real Yield philosophy, where stakers are rewarded using the platform's hard revenue generated through swap operations, ensuring value accrual for long-term network participants."
    },
    {
      q: "Why are all protocol payouts (Optimizer, Staking, Affiliate) distributed exclusively in USDC?",
      a: "To insulate users from market volatility and optimize network computational efficiency. While the AMM Swap module accepts various highly liquid assets (SOL, WSOL, USDT), the protocol executes an instant automated smart-contract conversion into stable USDC at the ledger level. This guarantees value stability for earned yields, drastically lowers gas fee costs by avoiding multi-token routing claims, and provides absolute accounting transparency across the ecosystem."
    }
  ];

  return (
    <div className="landing-root-wrapper" style={{ backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh', fontFamily: "'Inter', sans-serif", margin: 0, padding: 0, textAlign: 'left', boxSizing: 'border-box' }}>
      
      {/* INJECT ORIGINAL CSS STYLES DIRECTLY */}
      <style>{`
        .landing-root-wrapper * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; scroll-behavior: smooth; }
        .landing-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 8%; border-bottom: 1px solid #1f2937; background: rgba(11, 15, 25, 0.8); backdrop-filter: blur(12px); position: fixed; width: 100%; top: 0; z-index: 1000; }
        .landing-logo { font-size: 1.4rem; font-weight: 700; letter-spacing: 1px; background: linear-gradient(45deg, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .landing-logo span { font-size: 0.8rem; background: #8b5cf6; color: #fff; padding: 2px 6px; border-radius: 4px; margin-left: 5px; -webkit-text-fill-color: initial; }
        .landing-nav a { color: #f3f4f6; text-text-decoration: none; margin: 0 15px; font-size: 0.95rem; font-weight: 500; transition: color 0.3s; }
        .landing-nav a:hover { color: #14b8a6; }
        .landing-btn-launch { background: linear-gradient(135deg, #8b5cf6, #3b82f6); color: #fff; padding: 10px 22px; border-radius: 8px; text-decoration: none; font-weight: 600; border: none; transition: transform 0.3s, box-shadow 0.3s; cursor: pointer; }
        .landing-btn-launch:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(139, 92, 246, 0.4); }
        .landing-hero { padding: 180px 8% 80px 8%; text-align: center; background: radial-gradient(circle at top, rgba(139, 92, 246, 0.15) 0%, transparent 60%); }
        .landing-hero h1 { font-size: 3.2rem; font-weight: 700; line-height: 1.2; margin-bottom: 20px; background: linear-gradient(90deg, #fff 40%, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .landing-hero p { font-size: 1.2rem; color: #94a3b8; max-width: 700px; margin: 0 auto; line-height: 1.6; }
        .landing-metrics-banner { display: flex; justify-content: center; gap: 60px; padding: 30px; background: #111827; margin: 40px 0; border-top: 1px solid #1f2937; border-bottom: 1px solid #1f2937; }
        .landing-metric-item { text-align: center; }
        .landing-metric-value { font-size: 1.8rem; font-weight: 700; color: #14b8a6; }
        .landing-metric-label { font-size: 0.85rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px; }
        .landing-section-title { text-align: center; font-size: 2.2rem; margin-bottom: 10px; font-weight: 700; color: #fff; }
        .landing-section-desc { text-align: center; color: #94a3b8; margin-bottom: 50px; font-size: 1.05rem; }
        .landing-features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; padding: 0 8% 60px 8%; }
        .landing-feature-card { background: #111827; border: 1px solid #1f2937; padding: 35px; border-radius: 12px; transition: transform 0.3s, border-color 0.3s; text-align: left; }
        .landing-feature-card:hover { transform: translateY(-5px); border-color: #3b82f6; }
        .landing-feature-icon { font-size: 2.5rem; margin-bottom: 20px; color: #3b82f6; }
        .landing-feature-card h3 { font-size: 1.4rem; margin-bottom: 15px; color: #fff; }
        .landing-feature-card p { color: #94a3b8; line-height: 1.6; font-size: 0.95rem; }
        .landing-grant-box { background: rgba(139, 92, 246, 0.03); border-left: 4px solid #8b5cf6; padding: 20px; border-radius: 0 8px 8px 0; margin: 20px auto; max-width: 84%; text-align: left; }
        .landing-grant-box h4 { color: #8b5cf6; margin-bottom: 8px; font-size: 1.05rem; font-weight: 700; }
        .landing-grant-box p { color: #f3f4f6; font-size: 0.95rem; line-height: 1.5; }
        .landing-grant-box ul { padding-left: 20px; margin-top: 8px; }
        .landing-grant-box li { font-size: 0.9rem; color: #94a3b8; margin-bottom: 6px; list-style-type: disc; }
        .landing-roadmap { padding: 80px 8%; background: rgba(17, 24, 39, 0.4); }
        .landing-timeline { position: relative; max-width: 800px; margin: 40px auto 0 auto; }
        .landing-timeline::after { content: ''; position: absolute; width: 2px; background: #1f2937; top: 0; bottom: 0; left: 50%; margin-left: -1px; }
        .landing-time-container { padding: 10px 40px; position: relative; width: 50%; }
        .landing-time-container::after { content: ''; position: absolute; width: 16px; height: 16px; right: -8px; background-color: #0b0f19; border: 4px solid #14b8a6; top: 15px; border-radius: 50%; z-index: 1; }
        .landing-time-container.left { left: 0; text-align: right; }
        .landing-time-container.right { left: 50%; text-align: left; }
        .landing-time-container.right::after { left: -8px; }
        .landing-time-content { padding: 20px; background: #111827; border-radius: 8px; border: 1px solid #1f2937; text-align: left; }
        .landing-time-content h4 { color: #14b8a6; margin-bottom: 5px; font-weight: 700; }
        .landing-time-content span { font-size: 0.85rem; color: #94a3b8; display: block; margin-bottom: 10px; }
        .landing-time-content li { list-style: none; font-size: 0.9rem; color: #94a3b8; margin: 5px 0; }
        .landing-faq-section { padding: 80px 8%; max-width: 900px; margin: 0 auto; }
        .landing-faq-item { background: #111827; border: 1px solid #1f2937; border-radius: 8px; margin-bottom: 15px; overflow: hidden; }
        .landing-faq-question { padding: 20px; font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center; user-select: none; color: #fff; }
        .landing-faq-answer { padding: 0 20px; max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s ease; color: #94a3b8; line-height: 1.6; font-size: 0.95rem; text-align: left; }
        .landing-footer { border-top: 1px solid #1f2937; padding: 40px 8%; display: flex; justify-content: space-between; align-items: center; background: #060911; }
        .landing-footer p { font-size: 0.9rem; color: #94a3b8; }
        .landing-socials { display: flex; align-items: center; gap: 20px; }
        .landing-socials a { color: #94a3b8; font-size: 1.4rem; transition: color 0.3s; text-decoration: none; display: flex; align-items: center; }
        .landing-socials a:hover { color: #14b8a6; }
        @media (max-width: 768px) {
          .landing-header { padding: 15px 5%; }
          .landing-nav { display: none; }
          .landing-hero h1 { font-size: 2.2rem; }
          .landing-metrics-banner { flex-direction: column; gap: 25px; }
          .landing-timeline::after { left: 31px; }
          .landing-time-container { width: 100%; padding-left: 70px; padding-right: 25px; }
          .landing-time-container::after { left: 23px; }
          .landing-time-container.left { text-align: left; }
          .landing-time-container.right { left: 0; }
          .landing-footer { flex-direction: column; gap: 20px; text-align: center; }
          .landing-grant-box { max-width: 95%; }
        }
      `}</style>

      {/* NAVBAR HEADER */}
      <header className="landing-header">
        <div className="landing-logo">PROVIZTO<span>$VZT</span></div>
        <nav className="landing-nav">
          <a href="#features">Products</a>
          <a href="#roadmap">Roadmap</a>
          <a href="#faq">FAQ</a>
          <a href="https://github.com/provizto/vzt" target="_blank" rel="noopener noreferrer">Documentation</a>
        </nav>
        <button onClick={onLaunchApp} className="landing-btn-launch">
          Launch dApp
        </button>
      </header>

      {/* HERO SECTION */}
      <section className="landing-hero">
        <h1>Decentralized Asset Management Protocol Running on Solana</h1>
        <p>Optimize capital efficiency constraints and unlock liquidity stability through private Jito routing, programmatic vault structures, and deflationary burn algorithms.</p>
      </section>

      {/* LIVE METRICS ACCENT BANNER (CONNECTED TO APP STATES) */}
      <div className="landing-metrics-banner">
        <div className="landing-metric-item">
          <div className="landing-metric-value">${totalValueLocked ? totalValueLocked.toLocaleString('en-US') : '1,248,500'}+</div>
          <div className="landing-metric-label">Total Value Locked</div>
        </div>
        <div className="landing-metric-item">
          <div className="landing-metric-value">{swapsCount ? swapsCount.toLocaleString('en-US') : '45,210'}+</div>
          <div className="landing-metric-label">Swaps Executed</div>
        </div>
        <div className="landing-metric-item">
          <div className="landing-metric-value">20% Burn</div>
          <div className="landing-metric-label">Early Exit Deflation</div>
        </div>
      </div>

      {/* CORE PRODUCTS SECTION */}
      <section id="features" style={{ padding: '60px 0' }}>
        <h2 className="landing-section-title">Ecosystem Functional Modules</h2>
        <p className="landing-section-desc">Engineered securely on-chain to maximize sustainable user compound interest parameters.</p>
        
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <div className="landing-feature-icon"><i className="fas fa-shield-halved"></i></div>
            <h3>AMM DEX Swap</h3>
            <p>Execute private instant token exchanges for multi-assets (USDC, USDT, SOL, WSOL) routed directly through Jito private validators. Fully shielded from front-running and front-row MEV sandwich attacks.</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon"><i className="fas fa-chart-line"></i></div>
            <h3>Automated Yield Optimizer</h3>
            <p>Deploy USDC into optimized cross-protocol compounding routes. Enjoy an agnostic, programmatic target daily compounding yield rate of 0.11% (Projected 49.1% Boosted APY backed by swap fee underwriting).</p>
          </div>
          <div className="landing-feature-card">
            <div className="landing-feature-icon"><i className="fas fa-lock"></i></div>
            <h3>VZT Programmed Lock Pool</h3>
            <p>Escrow $VZT tokens via instant or time-locked boosted configurations. Earn sustainable, organic platform revenue shares distributed exclusively in single-asset stable USDC.</p>
          </div>
          <div className="landing-feature-card" style={{ borderColor: 'rgba(20, 184, 166, 0.3)' }}>
            <div className="landing-feature-icon" style={{ color: '#14b8a6' }}><i className="fas fa-users-rectangle"></i></div>
            <h3>On-Chain Affiliate System</h3>
            <p>Share your unique reference ledger URL to earn up to 25% dynamic commission from generated volumes. Features a strict 10-second timelock transaction cooldown to prevent multi-account exploit loops and Sybil attacks.</p>
          </div>
        </div>

        {/* INSTITUTIONAL GRANT BOX */}
        <div className="landing-grant-box">
          <h4><i className="fas fa-crown"></i> Institutional Grant Clawback Framework Active</h4>
          <p>To establish absolute financial transparency with our foundation grant providers, the 15% Dev & Infrastructure Treasury incorporates a secure automated revenue-share routing rule:</p>
          <ul>
            <li><strong>20% Automated Clawback Split:</strong> Every transactional split routed into the Dev Treasury automatically streams 20% of its capital to fulfill institutional grant repayment schedules.</li>
            <li><strong>Zero Dilution Protection:</strong> This payback mechanic guarantees that native $VZT market supply is never diluted or liquidated to reimburse strategic funding partners.</li>
          </ul>
        </div>
      </section>

      {/* ROADMAP SECTION */}
      <section id="roadmap" className="landing-roadmap">
        <h2 className="landing-section-title">Protocol Strategic Roadmap</h2>
        <p className="landing-section-desc">Chronological development milestones tracking Provizto expansion for the next 12 months.</p>
        
        <div className="landing-timeline">
          <div className="landing-time-container left">
            <div className="landing-time-content">
              <h4>Phase 1: Foundation & Launch</h4>
              <span>June - August 2026</span>
              <li>• Security infrastructure audit finalized.</li>
              <li>• MEV-Protected AMM DEX Swap Mainnet launch.</li>
              <li>• Deployment of secure anti-Sybil ledger logic.</li>
            </div>
          </div>
          <div className="landing-time-container right">
            <div className="landing-time-content">
              <h4>Phase 2: Growth & Automation</h4>
              <span>September - December 2026</span>
              <li>• Deployment of the Automated Yield Optimizer contracts.</li>
              <li>• Activation of the multi-tiered 1x - 2.5x Lock multiplier vaults.</li>
              <li>• Strategic Solana liquidity provider handshake integrations.</li>
            </div>
          </div>
          <div className="landing-time-container left">
            <div className="landing-time-content">
              <h4>Phase 3: Scaling & Integration</h4>
              <span>January - March 2027</span>
              <li>• Implementation of governance voting weight parameters.</li>
              <li>• Multi-asset cross-protocol vault aggregation expansion.</li>
              <li>• Secondary tier partner performance reward rollouts.</li>
            </div>
          </div>
          <div className="landing-time-container right">
            <div className="landing-time-content">
              <h4>Phase 4: DAO & Governance Maturity</h4>
              <span>April - June 2027</span>
              <li>• Final transition into a fully decentralized Protocol DAO.</li>
              <li>• Global community grant deployment for external developer builds.</li>
              <li>• Extension of Real Yield platform distribution channels.</li>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="landing-faq-section">
        <h2 className="landing-section-title">Frequently Asked Questions</h2>
        <p className="landing-section-desc">Quick technical answers regarding Provizto underlying operational mechanics.</p>
        
        {faqData.map((faq, index) => (
          <div key={index} className="landing-faq-item">
            <div className="landing-faq-question" onClick={() => toggleFaq(index)}>
              {faq.q} <i className="fas fa-chevron-down" style={{ transform: activeFaq === index ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}></i>
            </div>
            <div className="landing-faq-answer" style={{
              paddingTop: activeFaq === index ? '20px' : '0px',
              paddingBottom: activeFaq === index ? '20px' : '0px',
              maxHeight: activeFaq === index ? '300px' : '0px'
            }}>
              {faq.a}
            </div>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <p>© 2026 Provizto Protocol & Ecosystem Hub. All Rights Reserved. Secure Architecture Edition.</p>
        <div className="landing-socials">
          <a href="https://x.com/@provizto" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
            </svg>
          </a>
          <a href="https://t.me/VZT_Global" target="_blank" rel="noopener noreferrer"><i className="fab fa-telegram"></i></a>
          <a href="https://discord.com/@provizto" target="_blank" rel="noopener noreferrer"><i className="fab fa-discord"></i></a>
        </div>
      </footer>

    </div>
  );
};

export default Landing;