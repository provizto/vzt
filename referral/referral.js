const dictionary = {
    id: {
        tier: "💎 Tier 1: Afiliasi",
        btnReg: "User Reguler",
        btnKOL: "KOL / Influencer",
        sybilRegTitle: "🛡️ Syarat Perlindungan Komunitas (User Reguler)",
        sybilRegList: "<li>▪ Teman wajib melakukan swap min. **$10** di DEX.</li><li>▪ Mengunci aset di Yield Optimizer min. **7 hari**.</li>",
        sybilKOLTitle: "🛡️ Syarat Proteksi Volume Massal (KOL / Influencer)",
        sybilKOLList: "<li>▪ Total akumulasi volume bulanan pengikut min. **$2,500**.</li><li>▪ Total akumulasi TVL tersimpan min. **$1,000**.</li>",
        cardLink: "🔗 Tautan Rujukan Anda",
        cardMilestone: "🎁 Klaim Hadiah Berbasis Milestone",
        cardHistory: "👥 Riwayat Validasi Data Rujukan",
        cardSummary: "📊 Rangkuman Akun",
        statClicks: "Total Tautan Diklik",
        statActive: "Terverifikasi Valid/Aktif",
        statPending: "Komisi Tertahan (Pending)",
        btnClaim: "Klaim Hadiah",
        btnFaq: "ℹ️ FAQ Proyek",
        backHome: "← Kembali ke Beranda",
        copyright: "© 2026 Provizto. Hak Cipta Dilindungi.",
        copy: "Salin Link",
        copied: "Tersalin! ✔",
        mStart: "Mulai",
        m1: "3 Aktif", m2: "10 Aktif", m3: "25 Aktif"
    },
    en: {
        tier: "💎 Tier 1: Affiliate",
        btnReg: "Regular User",
        btnKOL: "KOL / Influencer",
        sybilRegTitle: "🛡️ Sybil Protection Rules (Regular User)",
        sybilRegList: "<li>▪ Referee must perform min. **$10** swap on DEX.</li><li>▪ Lock assets in Yield Optimizer for min. **7 days**.</li>",
        sybilKOLTitle: "🛡️ Mass Volume Protection Rules (KOL / Influencer)",
        sybilKOLList: "<li>▪ Total aggregate monthly volume from followers min. **$2,500**.</li><li>▪ Total aggregate TVL deposited min. **$1,000**.</li>",
        cardLink: "🔗 Your Referral Link",
        cardMilestone: "🎁 Milestone-Based Rewards",
        cardHistory: "👥 Referral Validation History",
        cardSummary: "📊 Account Summary",
        statClicks: "Total Links Clicked",
        statActive: "Verified Valid/Active",
        statPending: "Pending Commission",
        btnClaim: "Claim Rewards",
        btnFaq: "ℹ️ Project FAQ",
        backHome: "← Back to Home",
        copyright: "© 2026 Provizto. All rights reserved.",
        copy: "Copy Link",
        copied: "Copied! ✔",
        mStart: "Start",
        m1: "3 Active", m2: "10 Active", m3: "25 Active"
    }
};

let currentLang = 'en';
let currentRole = 'regular';

const tableData = {
    regular: {
        id: `
            <table class="data-table">
                <thead><tr><th>Alamat Dompet</th><th>Swap DEX</th><th>Durasi Yield</th><th>Status</th></tr></thead>
                <tbody>
                    <tr><td>0x3b...89f1</td><td>$25.50</td><td>9 Hari</td><td><span class="status-badge status-active">Aktif</span></td></tr>
                    <tr><td>0x8d...55bb</td><td>$1.50</td><td>0 Hari</td><td><span class="status-badge status-pending">Pending (&lt; $10)</span></td></tr>
                </tbody>
            </table>`,
        en: `
            <table class="data-table">
                <thead><tr><th>Wallet Address</th><th>DEX Swap</th><th>Yield Duration</th><th>Status</th></tr></thead>
                <tbody>
                    <tr><td>0x3b...89f1</td><td>$25.50</td><td>9 Days</td><td><span class="status-badge status-active">Active</span></td></tr>
                    <tr><td>0x8d...55bb</td><td>$1.50</td><td>0 Days</td><td><span class="status-badge status-pending">Pending (&lt; $10)</span></td></tr>
                </tbody>
            </table>`
    },
    kol: {
        id: `
            <table class="data-table">
                <thead><tr><th>Metrik Agregat Komunitas</th><th>Target Minimal</th><th>Capaian Saat Ini</th><th>Status</th></tr></thead>
                <tbody>
                    <tr><td>Total Volume Akumulasi (Bulanan)</td><td>$2,500.00</td><td>$4,120.00</td><td><span class="status-badge status-active">Lolos Batas</span></td></tr>
                    <tr><td>Total TVL Mengendap</td><td>$1,000.00</td><td>$450.00</td><td><span class="status-badge status-pending">Di Bawah Target</span></td></tr>
                </tbody>
            </table>`,
        en: `
            <table class="data-table">
                <thead><tr><th>Community Aggregate Metric</th><th>Min Requirement</th><th>Current Achievement</th><th>Status</th></tr></thead>
                <tbody>
                    <tr><td>Total Accumulated Volume (Monthly)</td><td>$2,500.00</td><td>$4,120.00</td><td><span class="status-badge status-active">Target Met</span></td></tr>
                    <tr><td>Total Deposited TVL</td><td>$1,000.00</td><td>$450.00</td><td><span class="status-badge status-pending">Below Target</span></td></tr>
                </tbody>
            </table>`
    }
};

function updateUI() {
    const langData = dictionary[currentLang];
    
    document.getElementById("txtTier").innerText = langData.tier;
    document.getElementById("btnRoleReg").innerText = langData.btnReg;
    document.getElementById("btnRoleKOL").innerText = langData.btnKOL;
    document.getElementById("lblCardLink").innerText = langData.cardLink;
    document.getElementById("btnCopy").innerText = langData.copy;
    document.getElementById("lblCardMilestone").innerText = langData.cardMilestone;
    document.getElementById("mStart").innerText = langData.mStart;
    document.getElementById("m1").innerText = langData.m1;
    document.getElementById("m2").innerText = langData.m2;
    document.getElementById("m3").innerText = langData.m3;
    document.getElementById("lblCardHistory").innerText = langData.cardHistory;
    document.getElementById("lblCardSummary").innerText = langData.cardSummary;
    document.getElementById("lblStatClicks").innerText = langData.statClicks;
    document.getElementById("lblStatActive").innerText = langData.statActive;
    document.getElementById("lblStatPending").innerText = langData.statPending;
    document.getElementById("lblBtnClaim").innerText = langData.btnClaim;
    document.getElementById("lblBtnFaq").innerText = langData.btnFaq;
    document.getElementById("lblBackHome").innerText = langData.backHome;
    document.getElementById("lblCopyright").innerText = langData.copyright;

    if (currentRole === 'regular') {
        document.getElementById("lblSybilTitle").innerHTML = langData.sybilRegTitle;
        document.getElementById("lblSybilList").innerHTML = langData.sybilRegList;
        document.getElementById("valClicks").innerText = currentLang === 'id' ? "5 Dompet" : "5 Wallets";
        document.getElementById("valActive").innerText = currentLang === 'id' ? "3 Dompet" : "3 Wallets";
    } else {
        document.getElementById("lblSybilTitle").innerHTML = langData.sybilKOLTitle;
        document.getElementById("lblSybilList").innerHTML = langData.sybilKOLList;
        document.getElementById("valClicks").innerText = currentLang === 'id' ? "142 Dompet" : "142 Wallets";
        document.getElementById("valActive").innerText = currentLang === 'id' ? "98 Dompet" : "98 Wallets";
    }

    document.getElementById("tableContainer").innerHTML = tableData[currentRole][currentLang];
}

function switchLanguage() {
    currentLang = document.getElementById("langSelect").value;
    updateUI();
}

function setRole(role) {
    currentRole = role;
    document.getElementById("btnRoleReg").classList.remove("active");
    document.getElementById("btnRoleKOL").classList.remove("active");
    
    if(role === 'regular') document.getElementById("btnRoleReg").classList.add("active");
    else document.getElementById("btnRoleKOL").classList.add("active");
    
    updateUI();
}

function copyLink() {
    var copyText = document.getElementById("refLink");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    
    var copyBtn = document.getElementById("btnCopy");
    copyBtn.innerText = dictionary[currentLang].copied;
    setTimeout(function() { copyBtn.innerText = dictionary[currentLang].copy; }, 2000);
}

// Inisialisasi UI pertama kali saat halaman dimuat
updateUI();
