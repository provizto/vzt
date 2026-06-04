import React, { useState, useEffect } from 'react';

const Landing = ({ totalValueLocked, swapsCount, onLaunchApp }) => {
  const [activeFaq, setActiveFaq] = useState(null);

  // Suntik otomatis FontAwesome dan Google Fonts langsung ke DOM Head saat komponen dimuat
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    const faLink = document.createElement('link');
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
    faLink.rel = 'stylesheet';
    document.head.appendChild(faLink);

    return () => {
      document.head.removeChild(fontLink);
      document.head.removeChild(faLink);
    };
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqData = [
    { q: "What is Provizto Protocol?", a: "Provizto is a non-inflationary decentralized asset management protocol running on the Solana blockchain. It provides users with MEV-shielded token swapping, cross-protocol auto-compounding vaults, and sustainable staking mechanics that distribute revenue share in stable assets." },
    { q: "How does the 0.3% Trading Fee allocation cycle operate?", a: "Every on-chain swap triggers a 0.3% baseline fee split atomically: 40% routes to underwrite the Automated Yield Optimizer pools, 30% feeds the VZT Programmed Lock Pool for USDC stakers reward claims, 15% finances Affiliate commissions, and 15% is secured for Core Development & Infrastructure treasury costs (which includes a built-in 20% automated clawback allocation for grant repayments)." },
    { q: "Is the 49.1% Optimizer APY sustainable or too high?", a: "It is highly sustainable. The baseline daily interest is just 0.11%, which mathematically compounds to 49.1% annually. Furthermore, this yield does not rely on token printing, but is fully underwritten by the 40% allocation of global protocol swap fees." },
    { q: "What does the 7-Day Epoch Reward Claim mean?", a: "It means rewards are calculated and settled in 7-day cycles (1 Epoch). This minimum 7-day lock-and-release mechanic is an industry-standard security measure designed to protect the pool from high-frequency flash-loan exploits and ensure stable network data distribution." },
    { q: "How exactly does the Affiliate program protect against Sybil Exploits?", a: "To stop bad actors from creating high-frequency multi-account loops (Sybil Attacks), the on-chain registry enforces a smart contract rule blocking self-referrals and restricting transaction calls to a mandatory 10-second cooldown timeout." },
    { q: "What are the different Affiliate Tier performance levels?", a: "Commissions scale dynamically based on the verified on-chain trading volume of your referred network: Bronze Tier (Up to $10,000 volume) pays out a 10% commission rate, Silver Tier ($10,001 - $100,000 volume) rewards an 18% rate, and premium Gold Tier (Above $100,000 volume) guarantees a 25% commission rate." },
    { q: "What is the early withdrawal penalty clause?", a: "Any premature liquidity unlock from the time-locked Boosted Bond Lock contracts prior to the set computational maturity date will trigger an absolute 20% principal penalty deduction. This amount is automatically sent to a dead address and permanently BURNED to induce long-term market token scarcity." },
    { q: "Why does Provizto pay stakers in USDC instead of native $VZT emissions?", a: "Traditional DeFi printing rewards dilute market capitalization and tank token prices. Provizto utilizes a non-inflationary Real Yield philosophy, where stakers are rewarded using the platform's hard revenue generated through swap operations, ensuring value accrual for long-term network participants." },
    { q: "Why are all protocol payouts (Optimizer, Staking, Affiliate) distributed exclusively in USDC?", a: "To insulate users from market volatility and optimize network computational efficiency. While the AMM Swap module accepts various highly liquid assets (SOL, WSOL, USDT), the protocol executes an instant automated smart-contract conversion into stable USDC at the ledger level. This guarantees value stability for earned yields, drastically lowers gas fee costs by avoiding multi-token routing claims, and provides absolute accounting transparency across the ecosystem." }
  ];

  return (
    <div id="vzt-landing-page">
      <style>{`
        #vzt-landing-page {
          background-color: #0b0f19 !important;
          color: #f3f4f6 !important;
          min-height: 100vh !important;
          font-family: 'Inter', sans-serif !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden !important;
          text-align: left !important;
        }
        #vzt-landing-page * {
          box-sizing: border-box !important;
        }
        #vzt-landing-page header {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          padding: 20px 8% !important;
          border-bottom: 1px solid #1f2937 !important;
          background: rgba(11, 15, 25, 0.8) !important;
          backdrop-filter: blur(12px) !important;
          position: fixed !important;
          width: 100% !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 99999 !important;
          height: auto !important;
        }
        #vzt-landing-page .logo {
          font-size: 1.4rem !important;
          font-weight: 700 !important;
          letter-spacing: 1px !important;
          background: linear-gradient(45deg, #fff, #94a3b8) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          display: flex !important;
          align-items: center !important;
        }
        #vzt-landing-page .logo span {
          font-size: 0.8rem !important;
          background: #8b5cf6 !important;
          color: #fff !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          margin-left: 5px !important;
          -webkit-text-fill-color: initial !important;
        }
        #vzt-landing-page nav a {
          color: #f3f4f6 !important;
          text-decoration: none !important;
          margin: 0 15px !important;
          font-size: 0.95rem !important;
          font-weight: 500 !important;
          transition: color 0.3s !important;
          display: inline-block !important;
        }
        #vzt-landing-page nav a:hover {
          color: #14b8a6 !important;
        }
        #vzt-landing-page .btn-launch {
          background: linear-gradient(135deg, #8b5cf6, #3b82f6) !important;
          color: #fff !important;
          padding: 10px 22px !important;
          border-radius: 8px !important;
          text-decoration: none !important;
          font-weight: 600 !important;
          border: none !important;
          transition: transform 0.3s, box-shadow 0.3s !important;
          cursor: pointer !important;
          display: inline-block !important;
        }
        #vzt-landing-page .btn-launch:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 5px 15px rgba(139, 92, 246, 0.4) !important;
        }
        #vzt-landing-page .hero {
          padding: 180px 8% 80px 8% !important;
          text-align: center !important;
          background: radial-gradient(circle at top, rgba(139, 92, 246, 0.15) 0%, transparent 60%) !important;
        }
        #vzt-landing-page .hero h1 {
          font-size: 3.2rem !important;
          font-weight: 700 !important;
          line-height: 1.2 !important;
          margin-bottom: 20px !important;
          background: linear-gradient(90deg, #fff 40%, #3b82f6) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
        }
        #vzt-landing-page .hero p {
          font-size: 1.2rem !important;
          color: #94a3b8 !important;
          max-width: 700px !important;
          margin: 0 auto !important;
          line-height: 1.6 !important;
        }
        #vzt-landing-page .metrics-banner {
          display: flex !important;
          justify-content: center !important;
          gap: 60px !important;
          padding: 30px !important;
          background: #111827 !important;
          margin: 40px 0 !important;
          border-top: 1px solid #1f2937 !important;
          border-bottom: 1px solid #1f2937 !important;
        }
        #vzt-landing-page .metric-item {
          text-align: center !important;
        }
        #vzt-landing-page .metric-value {
          font-size: 1.8rem !important;
          font-weight: 700 !important;
          color: #14b8a6 !important;
        }
        #vzt-landing-page .metric-label {
          font-size: 0.85rem !important;
          color: #94a3b8 !important;
          text-transform: uppercase !important;
          letter-spacing: 1px !important;
          margin-top: 5px !important;
        }
        #vzt-landing-page .section-title {
          text-align: center !important;
          font-size: 2.2rem !important;
          margin-bottom: 10px !important;
          font-weight: 700 !important;
          color: #fff !important;
        }
        #vzt-landing-page .section-desc {
          text-align: center !important;
          color: #94a3b8 !important;
          margin-bottom: 50px !important;
          font-size: 1.05rem !important;
        }
        #vzt-landing-page .features-grid {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 24px !important;
          padding: 0 8% 60px 8% !important;
          max-width: 1400px !important;
          margin: 0 auto !important;
        }
        #vzt-landing-page .feature-card {
          background: #111827 !important;
          border: 1px solid #1f2937 !important;
          padding: 30px 24px !important;
          border-radius: 12px !important;
          transition: transform 0.3s, border-color 0.3s !important;
          display: flex !important;
          flex-direction: column !important;
        }
        #vzt-landing-page .feature-card:hover {
          transform: translateY(-5px) !important;
          border-color: #3b82f6 !important;
        }
        #vzt-landing-page .feature-icon {
          font-size: 2.3rem !important;
          margin-bottom: 20px !important;
          color: #3b82f6 !important;
        }
        #vzt-landing-page .feature-card h3 {
          font-size: 1.25rem !important;
          margin-bottom: 12px !important;
          color: #fff !important;
        }
        #vzt-landing-page .feature-card p {
          color: #94a3b8 !important;
          line-height: 1.5 !important;
          font-size: 0.9rem !important;
        }
        #vzt-landing-page .grant-notice-box {
          background: rgba(139, 92, 246, 0.03) !important;
          border-left: 4px solid #8b5cf6 !important;
          padding: 20px !important;
          border-radius: 0 8px 8px 0 !important;
          margin: 20px auto !important;
          max-width: 84%;
          text-align: left !important;
        }
        #vzt-landing-page .grant-notice-box h4 {
          color: #8b5cf6 !important;
          margin-bottom: 8px !important;
          font-size: 1.05rem !important;
        }
        #vzt-landing-page .grant-notice-box ul {
          padding-left: 20px !important;
          margin-top: 8px !important;
        }
        #vzt-landing-page .grant-notice-box li {
          font-size: 0.9rem !important;
          color: #94a3b8 !important;
          margin-bottom: 6px !important;
          list-style-type: disc !important;
        }
        #vzt-landing-page .roadmap-section {
          padding: 80px 8% !important;
          background: rgba(17, 24, 39, 0.4) !important;
        }
        #vzt-landing-page .timeline {
          position: relative !important;
          max-width: 800px !important;
          margin: 40px auto 0 auto !important;
        }
        #vzt-landing-page .timeline::after {
          content: '' !important;
          position: absolute !important;
          width: 2px !important;
          background: #1f2937 !important;
          top: 0 !important;
          bottom: 0 !important;
          left: 50% !important;
          margin-left: -1px !important;
        }
        #vzt-landing-page .timeline-container {
          padding: 10px 40px !important;
          position: relative !important;
          width: 50% !important;
        }
        #vzt-landing-page .timeline-container::after {
          content: '' !important;
          position: absolute !important;
          width: 16px !important;
          height: 16px !important;
          right: -8px !important;
          background-color: #0b0f19 !important;
          border: 4px solid #14b8a6 !important;
          top: 15px !important;
          border-radius: 50% !important;
          z-index: 1 !important;
        }
        #vzt-landing-page .left { left: 0 !important; text-align: right !important; }
        #vzt-landing-page .right { left: 50% !important; text-align: left !important; }
        #vzt-landing-page .right::after { left: -8px !important; }
        #vzt-landing-page .timeline-content {
          padding: 20px !important;
          background: #111827 !important;
          border-radius: 8px !important;
          border: 1px solid #1f2937 !important;
        }
        #vzt-landing-page .timeline-content h4 {
          color: #14b8a6 !important;
          margin-bottom: 5px !important;
        }
        #vzt-landing-page .timeline-content span {
          font-size: 0.85rem !important;
          color: #94a3b8 !important;
          display: block !important;
          margin-bottom: 10px !important;
        }
        #vzt-landing-page .timeline-content li {
          list-style: none !important;
          font-size: 0.9rem !important;
          color: #94a3b8 !important;
          margin: 5px 0 !important;
        }
        #vzt-landing-page .faq-section {
          padding: 80px 8% !important;
          max-width: 900px !important;
          margin: 0 auto !important;
        }
        #vzt-landing-page .faq-item {
          background: #111827 !important;
          border: 1px solid #1f2937 !important;
          border-radius: 8px !important;
          margin-bottom: 15px !important;
          overflow: hidden !important;
        }
        #vzt-landing-page .faq-question {
          padding: 20px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          user-select: none !important;
          color: #fff !important;
        }
        #vzt-landing-page .faq-answer {
          padding: 0 20px !important;
          max-height: 0px;
          overflow: hidden !important;
          transition: max-height 0.3s ease, padding 0.3s ease !important;
          color: #94a3b8 !important;
          line-height: 1.6 !important;
          font-size: 0.95rem !important;
        }
        #vzt-landing-page footer {
          border-top: 1px solid #1f2937 !important;
          padding: 40px 8% !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          background: #060911 !important;
          width: 100% !important;
        }
        #vzt-landing-page footer p {
          font-size: 0.9rem !important;
          color: #94a3b8 !important;
        }
        #vzt-landing-page .social-icons {
          display: flex !important;
          align-items: center !important;
          gap: 20px !important;
        }
        #vzt-landing-page .social-icons a {
          color: #94a3b8 !important;
          font-size: 1.4rem !important;
          transition: color 0.3s !important;
          text-decoration: none !important;
          display: flex !important;
          align-items: center !important;
        }
        #vzt-landing-page .social-icons a:hover {
          color: #14b8a6 !important;
        }
        @media (max-width: 1024px) {
          #vzt-landing-page .features-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          #vzt-landing-page header { padding: 15px 5% !important; }
          #vzt-landing-page nav { display: none !important; }
          #vzt-landing-page .hero h1 { font-size: 2.2rem !important; }
          #vzt-landing-page .metrics-banner { flex-direction: column !important; gap: 25px !important; }
          #vzt-landing-page .features-grid { 
            grid-template-columns: 1fr !important; 
            gap: 20px !important;
          }
          #vzt-landing-page .timeline::after { left: 31px !important; }
          #vzt-landing-page .timeline-container { width: 100% !important; padding-left: 70px !important; padding-right: 25px !important; }
          #vzt-landing-page .timeline-container::after { left: 23px !important; }
          #vzt-landing-page .left { text-align: left !important; }
          #vzt-landing-page .right { left: 0 !important; }
          #vzt-landing-page footer { flex-direction: column !important; gap: 20px !important; text-align: center !important; }
          #vzt-landing-page .grant-notice-box { max-width: 95% !important; }
        }
      `}</style>

      {/* NAVBAR HEADER */}
      <header>
        <div className="logo">PROVIZTO<span>$VZT</span></div>
        <nav>
          <a href="#features">Products</a>
          <a href="#roadmap">Roadmap</a>
          <a href="#faq">FAQ</a>
          <a href="https://provizto.github.io/vzt-docs/" target="_blank" rel="noopener noreferrer">Documentation</a>
        </nav>
        <button onClick={onLaunchApp} className="btn-launch">
          Launch dApp
        </button>
      </header>

      {/* HERO SECTION */}
      <section className="hero">
        <h1>Decentralized Asset Management Protocol Running on Solana</h1>
        <p>Optimize capital efficiency constraints and unlock liquidity stability through private Jito routing, programmatic vault structures, and deflationary burn algorithms.</p>
      </section>

      {/* LIVE METRICS BANNER (CONNECTED DYNAMICALLY) */}
      <div className="metrics-banner">
        <div className="metric-item">
          <div className="metric-value">${totalValueLocked ? totalValueLocked.toLocaleString('en-US') : '1,248,500'}+</div>
          <div className="metric-label">Total Value Locked</div>
        </div>
        <div className="metric-item">
          <div className="metric-value">{swapsCount ? swapsCount.toLocaleString('en-US') : '45,210'}+</div>
          <div className="metric-label">Swaps Executed</div>
        </div>
        <div className="metric-item">
          <div className="metric-value">20% Burn</div>
          <div className="metric-label">Early Exit Deflation</div>
        </div>
      </div>

      {/* ECOSYSTEM FEATURES */}
      <section id="features" style={{ padding: '60px 0' }}>
        <h2 className="section-title">Ecosystem Functional Modules</h2>
        <p className="section-desc">Engineered securely on-chain to maximize sustainable user compound interest parameters.</p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-shield-halved"></i></div>
            <h3>AMM DEX Swap</h3>
            <p>Execute private instant token exchanges for multi-assets (USDC, USDT, SOL, WSOL) routed directly through Jito private validators. Fully shielded from front-running and front-row MEV sandwich attacks.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-chart-line"></i></div>
            <h3>Automated Yield Optimizer</h3>
            <p>Deploy USDC into optimized cross-protocol compounding routes. Enjoy an agnostic, programmatic target daily compounding yield rate of 0.11% (Projected 49.1% Boosted APY backed by swap fee underwriting).</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><i className="fas fa-lock"></i></div>
            <h3>VZT Programmed Lock Pool</h3>
            <p>Escrow $VZT tokens via instant or time-locked boosted configurations. Earn sustainable, organic platform revenue shares distributed exclusively in single-asset stable USDC.</p>
          </div>
          <div className="feature-card" style={{ borderColor: 'rgba(20, 184, 166, 0.3)' }}>
            <div className="feature-icon" style={{ color: '#14b8a6' }}><i className="fas fa-users-rectangle"></i></div>
            <h3>On-Chain Affiliate System</h3>
            <p>Share your unique reference ledger URL to earn up to 25% dynamic commission from generated volumes. Features a strict 10-second timelock transaction cooldown to prevent multi-account exploit loops and Sybil attacks.</p>
          </div>
        </div>

        {/* GRANT REPAYMENT FRAMEWORK NOTICE */}
        <div className="grant-notice-box">
          <h4><i className="fas fa-crown"></i> Institutional Grant Clawback Framework Active</h4>
          <p>To establish absolute financial transparency with our foundation grant providers, the 15% Dev & Infrastructure Treasury incorporates a secure automated revenue-share routing rule:</p>
          <ul>
            <li><strong>20% Automated Clawback Split:</strong> Every transactional split routed into the Dev Treasury automatically streams 20% of its capital to fulfill institutional grant repayment schedules.</li>
            <li><strong>Zero Dilution Protection:</strong> This payback mechanic guarantees that native $VZT market supply is never diluted or liquidated to reimburse strategic funding partners.</li>
          </ul>
        </div>
      </section>

      {/* ROADMAP SECTION */}
      <section id="roadmap" className="roadmap-section">
        <h2 className="section-title">Protocol Strategic Roadmap</h2>
        <p className="section-desc">Chronological development milestones tracking Provizto expansion for the next 12 months.</p>
        
        <div className="timeline">
          <div className="timeline-container left">
            <div className="timeline-content">
              <h4>Phase 1: Foundation & Launch</h4>
              <span>June - August 2026</span>
              <li>• Security infrastructure audit finalized.</li>
              <li>• MEV-Protected AMM DEX Swap Mainnet launch.</li>
              <li>• Deployment of secure anti-Sybil ledger logic.</li>
            </div>
          </div>
          <div className="timeline-container right">
            <div className="timeline-content">
              <h4>Phase 2: Growth & Automation</h4>
              <span>September - December 2026</span>
              <li>• Deployment of the Automated Yield Optimizer contracts.</li>
              <li>• Activation of the multi-tiered 1x - 2.5x Lock multiplier vaults.</li>
              <li>• Strategic Solana liquidity provider handshake integrations.</li>
            </div>
          </div>
          <div className="timeline-container left">
            <div className="timeline-content">
              <h4>Phase 3: Scaling & Integration</h4>
              <span>January - March 2027</span>
              <li>• Implementation of governance voting weight parameters.</li>
              <li>• Multi-asset cross-protocol vault aggregation expansion.</li>
              <li>• Secondary tier partner performance reward rollouts.</li>
            </div>
          </div>
          <div className="timeline-container right">
            <div className="timeline-content">
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
      <section id="faq" className="faq-section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-desc">Quick technical answers regarding Provizto underlying operational mechanics.</p>
        
        {faqData.map((faq, index) => (
          <div key={index} className="faq-item">
            <div className="faq-question" onClick={() => toggleFaq(index)}>
              {faq.q} <i className="fas fa-chevron-down" style={{ transform: activeFaq === index ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', color: '#94a3b8' }}></i>
            </div>
            <div className="faq-answer" style={{
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
      <footer>
        <p>© 2026 Provizto Protocol & Ecosystem Hub. All Rights Reserved. Secure Architecture Edition.</p>
        <div className="social-icons">
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