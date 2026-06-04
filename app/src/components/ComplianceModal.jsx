import React, { useState, useEffect } from 'react';

const ComplianceModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Mengecek apakah pengguna sudah pernah menyetujui disclaimer sebelumnya
    const hasAccepted = localStorage.getItem('provizto_disclaimer_accepted');
    if (!hasAccepted) {
      setIsOpen(true); // Tampilkan pop-up jika belum pernah menyetujui
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('provizto_disclaimer_accepted', 'true');
    setIsOpen(false); // Tutup pop-up dan izinkan masuk aplikasi
  };

  if (!isOpen) return null; // Jika sudah disetujui, jangan render apa pun

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#111] border border-zinc-800 max-w-lg w-full rounded-xl p-6 shadow-2xl text-white font-sans">
        
        {/* Header Pop-up */}
        <h2 className="text-xl font-bold text-[#14F195] tracking-wide border-b border-zinc-800 pb-3">
          PROVIZTO | TERMS & REGULATORY COMPLIANCE
        </h2>
        
        {/* Konten Hukum Singkat */}
        <div className="mt-4 text-sm text-zinc-400 space-y-3 max-h-[60vh] overflow-y-auto pr-2 leading-relaxed">
          <p>
            By clicking <strong>"I Agree & Enter App"</strong>, you explicitly acknowledge and confirm that you meet all regulatory and jurisdictional eligibility criteria to interact with the Provizto decentralized software protocol.
          </p>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-xs space-y-2">
            <p className="text-amber-400 font-semibold">⚠️ RESTRICTED JURISDICTIONS:</p>
            <p>
              Users who are citizens, residents, or green-card holders of the <strong>United States of America</strong>, or any OFAC-sanctioned nations, are strictly prohibited from accessing this DApp interface.
            </p>
          </div>

          <p className="text-xs">
            1. <strong>Non-Custodial:</strong> Provizto is a self-custody software layer. You maintain absolute control over your digital assets and private keys at all times.
          </p>
          <p className="text-xs">
            2. <strong>Algorithmic Risks:</strong> All automated yields, including the 49.1% APY auto-compounding reserves, are driven entirely by smart contract logic and market performance. No guarantees are made.
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a 
            href="https://google.com" // Tendang pengguna ke luar jika mereka tidak setuju
            className="w-full text-center py-2.5 rounded-lg text-sm bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 transition"
          >
            Decline & Exit
          </a>
          <button 
            onClick={handleAccept}
            className="w-full py-2.5 rounded-lg text-sm bg-[#14F195] text-black font-semibold hover:bg-[#10c479] shadow-[0_0_15px_rgba(20,241,149,0.3)] transition"
          >
            I Agree & Enter App
          </button>
        </div>

      </div>
    </div>
  );
};

export default ComplianceModal;