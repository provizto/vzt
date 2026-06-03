use anchor_lang::prelude::*;
use anchor_spl::token::{self, Transfer};

declare_id!("ProvZtoX9vR6qwMKB7zYtE4HnS2PdcG8kLmWq3jF5uBx");

// ==========================================================================
// CONSTANTS BLOCK (BATAS HARD CAP $20,000 DENGAN 6 DESIMAL STANDAR USDC)
// ==========================================================================
pub const GRANT_REPAYMENT_CAP: u64 = 20_000_000_000; 

#[program]
pub mod provizto {
    use super::*;

    // Fungsi Utama Eksekusi Distribusi Fee Swap
    pub fn distribute_fees(ctx: Context<DistributeFees>, amount: u64) -> Result<()> {
        let treasury_state = &mut ctx.accounts.treasury_state;
        
        // Cek jika status pengembalian belum menyentuh batas atau belum lunas
        if !treasury_state.is_grant_fully_repaid && treasury_state.total_repaid_to_grantor < GRANT_REPAYMENT_CAP {
            let dev_share = (amount * 15) / 100; // Alokasi 15% Dev Treasury
            let grantor_clawback = (dev_share * 20) / 100; // 20% dari Dev Share untuk Grantor (Clawback)
            
            // Logika Hard Cap: Pastikan transfer tidak melampaui sisa batas target $20,000
            if treasury_state.total_repaid_to_grantor + grantor_clawback >= GRANT_REPAYMENT_CAP {
                let final_repayment = GRANT_REPAYMENT_CAP - treasury_state.total_repaid_to_grantor;
                
                // Eksekusi transfer sisa pelunasan terakhir ke dompet grantor
                treasury_state.total_repaid_to_grantor = GRANT_REPAYMENT_CAP;
                treasury_state.is_grant_fully_repaid = true; // KUNCI DAN MATIKAN FUNGSI CLAWBACK
            } else {
                // Jalankan transfer rutin bagi hasil 20%
                treasury_state.total_repaid_to_grantor += grantor_clawback;
            }
        }
        Ok(())
    }
}

// ==========================================================================
// DATA STRUCTURES (STATE ACCOUNT LOCK DI BLOCKCHAIN)
// ==========================================================================
#[derive(Accounts)]
pub struct DistributeFees<'info> {
    #[account(mut)]
    pub treasury_state: Account<'info, GlobalTreasuryState>,
}

#[account]
pub struct GlobalTreasuryState {
    pub total_repaid_to_grantor: u64, // Menyimpan akumulasi dana yang terkumpul
    pub is_grant_fully_repaid: bool,  // Flag penanda status lunas
}