import React, { useState, useEffect } from 'react';

const ComplianceModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('provizto_disclaimer_accepted');
    if (!hasAccepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('provizto_disclaimer_accepted', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    // Backdrop Hitam Transparan Terapung Penuh Layar
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(8px)',
      padding: '20px'
    }}>
      
      {/* Kotak Utama Pop-up Modals */}
      <div style={{
        backgroundColor: '#111111', border: '1px solid #27272a',
        maxWidth: '500px', width: '100%', borderRadius: '12px',
        padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        color: '#ffffff', fontFamily: 'sans-serif', boxSizing: 'border-box'
      }}>
        
        {/* Header Pop-up */}
        <h2 style={{
          fontSize: '1.25rem', fontWeight: 'bold', color: '#14F195',
          letterSpacing: '0.05em', borderBottom: '1px solid #27272a',
          paddingBottom: '12px', margin: '0 0 16px 0'
        }}>
          PROVIZTO | TERMS & REGULATORY COMPLIANCE
        </h2>
        
        {/* Konten Hukum */}
        <div style={{
          fontSize: '0.875rem', color: '#a1a1aa',
          lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '12px'
        }}>
          <p style={{ margin: 0 }}>
            By clicking <strong>"I Agree & Enter App"</strong>, you explicitly acknowledge and confirm that you meet all regulatory and jurisdictional eligibility criteria to interact with the Provizto decentralized software protocol.
          </p>
          
          <div style={{
            backgroundColor: 'rgba(39, 39, 42, 0.4)', border: '1px solid #27272a',
            borderRadius: '8px', padding: '12px', fontSize: '0.75rem'
          }}>
            <p style={{ color: '#fbbf24', fontWeight: 'bold', margin: '0 0 4px 0' }}>⚠️ RESTRICTED JURISDICTIONS:</p>
            <p style={{ margin: 0, color: '#e4e4e7' }}>
              Users who are citizens, residents, or green-card holders of the <strong>United States of America</strong>, or any OFAC-sanctioned nations, are strictly prohibited from accessing this DApp interface.
            </p>
          </div>

          <p style={{ fontSize: '0.75rem', margin: 0 }}>
            1. <strong>Non-Custodial:</strong> Provizto is a self-custody software layer. You maintain absolute control over your digital assets and private keys at all times.
          </p>
          <p style={{ fontSize: '0.75rem', margin: 0 }}>
            2. <strong>Algorithmic Risks:</strong> All automated yields, including the 49.1% APY auto-compounding reserves, are driven entirely by smart contract logic and market performance. No guarantees are made.
          </p>
        </div>

        {/* Tombol Aksi */}
        <div style={{
          marginTop: '24px', display: 'flex', gap: '12px', width: '100%'
        }}>
          <a 
            href="https://google.com" 
            style={{
              flex: 1, textDecoration: 'none', textAlign: 'center', padding: '10px 0',
              borderRadius: '8px', fontSize: '0.875rem', backgroundColor: '#18181b',
              border: '1px solid #27272a', color: '#a1a1aa', fontWeight: '600', transition: '0.2s'
            }}
          >
            Decline & Exit
          </a>
          <button 
            onClick={handleAccept}
            style={{
              flex: 1, padding: '10px 0', borderRadius: '8px', fontSize: '0.875rem',
              backgroundColor: '#14F195', border: 'none', color: '#000000',
              fontWeight: 'bold', cursor: 'pointer', transition: '0.2s',
              boxShadow: '0 0 15px rgba(20,241,149,0.3)'
            }}
          >
            I Agree & Enter App
          </button>
        </div>

      </div>
    </div>
  );
};

export default ComplianceModal;