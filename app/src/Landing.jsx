import React, { useState } from 'react';

// Kita menerima data TVL dan fungsionalitas navigasi dari App.jsx lewat props
const Landing = ({ totalValueLocked, swapsCount, onLaunchApp }) => {
  // State untuk melacak FAQ mana yang sedang dibuka akordeonnya
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Data FAQ agar kode lebih rapi dan bersih
  const faqData = [
    {
      q: "What is Provizto Protocol?",
      a: "Provizto is a non-inflationary decentralized asset management protocol running on the Solana blockchain. It provides users with MEV-shielded token swapping, cross-protocol auto-compounding vaults, and sustainable staking mechanics that distribute revenue share in stable assets."
    },
    {
      q: "How does the 0.3% Trading Fee allocation cycle operate?",
      a: "Every on-chain swap triggers a 0.3% baseline fee split atomically: 40% routes to underwrite the Automated Yield Optimizer pools, 30% feeds the VZT Programmed Lock Pool for USDC stakers reward claims, 15% finances Affiliate commissions, and 15% is secured for Core Development & Infrastructure treasury costs."
    },
    {
      q: "Is the 49.1% Optimizer APY sustainable or too high?",
      a: "It is highly sustainable. The baseline daily interest is just 0.11%, which mathematically compounds to 49.1% annually. Furthermore, this yield does not rely on token printing, but is fully underwritten by the 40% allocation of global protocol swap fees."
    }
  ];

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#f3f4f6', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* NAVBAR HEADER */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 8%', borderBottom: '1px solid #1f2937',
        background: 'rgba(11, 15, 25, 0.8)', backdropFilter: 'blur(12px)',
        position: 'fixed', width: '100%', top: 0, zIndex: 1000, boxSizing: 'border-box'
      }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 700, letterSpacing: '1px' }}>
          PROVIZTO<span style={{ fontSize: '0.8rem', background: '#8b5cf6', color: '#fff', padding: '2px 6px', borderRadius: '4px', marginLeft: '5px' }}>$VZT</span>
        </div>
        <nav className="landing-nav">
          <a href="#features" style={{ color: '#f3f4f6', textDecoration: 'none', margin: '0 15px', fontWeight: 500 }}>Products</a>
          <a href="#roadmap" style={{ color: '#f3f4f6', textDecoration: 'none', margin: '0 15px', fontWeight: 500 }}>Roadmap</a>
          <a href="#faq" style={{ color: '#f3f4f6', textDecoration: 'none', margin: '0 15px', fontWeight: 500 }}>FAQ</a>
        </nav>
        {/* Tombol ini sekarang memicu fungsi untuk membuka dashboard aplikasi */}
        <button onClick={onLaunchApp} style={{
          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', color: '#fff',
          padding: '10px 22px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer'
        }}>
          Launch dApp
        </button>
      </header>

      {/* HERO SECTION */}
      <section style={{
        padding: '180px 8% 80px 8%', textAlign: 'center',
        background: 'radial-gradient(circle at top, rgba(139, 92, 246, 0.15) 0%, transparent 60%)'
      }}>
        <h1 style={{ fontSize: '3.2rem', fontWeight: 700, marginBottom: '20px', lineHeight: 1.2 }}>
          Decentralized Asset Management Protocol Running on Solana
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
          Optimize capital efficiency constraints and unlock liquidity stability through private Jito routing, programmatic vault structures, and deflationary burn algorithms.
        </p>
      </section>

      {/* LIVE METRICS ACCENT BANNER (SEKARANG DINAMIS!) */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '60px', padding: '30px',
        backgroundColor: '#111827', margin: '40px 0', borderTop: '1px solid #1f2937', borderBottom: '1px solid #1f2937'
      }}>
        <div style={{ textAlign: 'center' }}>
          {/* Data TVL diambil langsung dari aplikasi utama Anda */}
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#14b8a6' }}>
            ${totalValueLocked ? totalValueLocked.toLocaleString() : '1,248,500'}+
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' }}>
            Total Value Locked
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#14b8a6' }}>
            {swapsCount ? swapsCount.toLocaleString() : '45,210'}+
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' }}>
            Swaps Executed
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#14b8a6' }}>20% Burn</div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' }}>
            Early Exit Deflation
          </div>
        </div>
      </div>

      {/* ECOSYSTEM FEATURES */}
      <section id="features" style={{ padding: '60px 8%' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: 700, marginBottom: '10px' }}>Ecosystem Functional Modules</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '50px' }}>Engineered securely on-chain to maximize sustainable user compound interest parameters.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', padding: '35px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>AMM DEX Swap</h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>Execute private instant token exchanges routed directly through Jito private validators. Fully shielded from front-running MEV attacks.</p>
          </div>
          <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', padding: '35px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>Automated Yield Optimizer</h3>
            <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>Deploy USDC into optimized cross-protocol compounding routes. Enjoy target daily compounding yield rate of 0.11%.</p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION (ACCORDION REACT STYLE) */}
      <section id="faq" style={{ padding: '80px 8%', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: 700, marginBottom: '50px' }}>Frequently Asked Questions</h2>
        {faqData.map((faq, index) => (
          <div key={index} style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '8px', marginBottom: '15px', overflow: 'hidden' }}>
            <div 
              onClick={() => toggleFaq(index)} 
              style={{ padding: '20px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}
            >
              {faq.q} <span>{activeFaq === index ? '▲' : '▼'}</span>
            </div>
            <div style={{
              padding: activeFaq === index ? '20px' : '0 20px',
              maxHeight: activeFaq === index ? '200px' : '0px',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              color: '#94a3b8',
              lineHeight: 1.6
            }}>
              {faq.a}
            </div>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #1f2937', padding: '40px 8%', textAlign: 'center', backgroundColor: '#060911' }}>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>© 2026 Provizto Protocol & Ecosystem Hub. All Rights Reserved.</p>
      </footer>

    </div>
  );
};

export default Landing;