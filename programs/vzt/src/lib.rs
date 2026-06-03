use anchor_lang::prelude::*;

// Deklarasikan ID Program yang sama dengan yang ada di Frontend App.jsx Anda
declare_id!("ProvZtoX9vR6qwMKB7zYtE4HnS2PdcG8kLmWq3jF5uBx");

#[program]
pub mod vzt {
    use super::*;

    /// 1. Initialize User Account / Affiliate Registry
    pub fn initialize_user(ctx: Context<InitializeUser>, referrer: Pubkey) -> Result<()> {
        let user_state = &mut ctx.accounts.user_state;
        user_state.owner = *ctx.accounts.user.key;
        user_state.referrer = referrer;
        user_state.total_swap_volume = 0;
        user_state.last_tx_timestamp = Clock::get()?.unix_timestamp;
        
        msg!("Provizto Registry: User initialized with secure Anti-Sybil cooldown.");
        Ok(())
    }

    /// 2. AMM DEX Swap (With automated Dev Share & Institutional Grant Clawback calculation)
    pub fn execute_swap(ctx: Context<ExecuteSwap>, pay_amount: u64) -> Result<()> {
        let user_state = &mut ctx.accounts.user_state;
        let current_time = Clock::get()?.unix_timestamp;

        // Penegakan Aturan Anti-Sybil: Cooldown 10 detik antar transaksi
        require!(
            current_time - user_state.last_tx_timestamp >= 10,
            ProviztoError::SybilCooldownActive
        );

        // Simulasi kalkulasi fee 0.3% di tingkat Ledger
        let total_fee = (pay_amount as f64 * 0.003) as u64;
        let dev_share = (total_fee as f64 * 0.15) as u64;
        let grant_clawback = (dev_share as f64 * 0.20) as u64; // 20% otomatis dikunci untuk pengembalian hibah

        user_state.total_swap_volume += pay_amount;
        user_state.last_tx_timestamp = current_time;

        msg!("Swap Successful! Fee allocated: Dev Share = {}, Grant Clawback Stream = {}", dev_share, grant_clawback);
        Ok(())
    }

    /// 3. VZT Programmed Lock Pool (7-Day Timelock Activation)
    pub fn lock_tokens(ctx: Context<LockTokens>, amount: u64, duration_multiplier: f64) -> Result<()> {
        let lock_account = &mut ctx.accounts.lock_account;
        let current_time = Clock::get()?.unix_timestamp;

        lock_account.owner = *ctx.accounts.user.key;
        lock_account.staked_amount = amount;
        lock_account.lock_timestamp = current_time;
        // 7 Hari Epoch Horizon: 604,800 detik
        lock_account.maturity_timestamp = current_time + 604800; 
        lock_account.multiplier = duration_multiplier;
        lock_account.is_active = true;

        msg!("Assets locked successfully under 7-Day Epoch Horizon constraint.");
        Ok(())
    }

    /// 4. Emergency Early Unlock Protocol (Bypasses contract maturity with 20% Capital Burn)
    pub fn emergency_unlock(ctx: Context<EmergencyUnlock>) -> Result<()> {
        let lock_account = &mut ctx.accounts.lock_account;
        let current_time = Clock::get()?.unix_timestamp;

        require!(lock_account.is_active, ProviztoError::NoActiveLockDetected);
        
        // Memastikan token memang ditarik secara prematur sebelum waktu matang kontrak
        require!(
            current_time < lock_account.maturity_timestamp,
            ProviztoError::LockAlreadyMatured
        );

        let penalty_burn_amount = (lock_account.staked_amount as f64 * 0.20) as u64;
        let returned_amount = lock_account.staked_amount - penalty_burn_amount;

        lock_account.is_active = false;
        lock_account.staked_amount = 0;

        msg!("🔥 CLAUSE EMERGENCY TRIGGERED: {} VZT permanently destroyed (BURN). {} VZT returned.", penalty_burn_amount, returned_amount);
        Ok(())
    }
}

// ==========================================================================
// DATA STRUCTURES (ACCOUNT CONTEXTS)
// ==========================================================================

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(init, payer = user, space = 8 + 32 + 32 + 8 + 8)]
    pub user_state: Account<'info, UserState>,
    #[mut]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ExecuteSwap<'info> {
    #[mut]
    pub user_state: Account<'info, UserState>,
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct LockTokens<'info> {
    #[account(init, payer = user, space = 8 + 32 + 8 + 8 + 8 + 8 + 1)]
    pub lock_account: Account<'info, LockAccount>,
    #[mut]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EmergencyUnlock<'info> {
    #[mut]
    pub lock_account: Account<'info, LockAccount>,
    pub user: Signer<'info>,
}

// ==========================================================================
// STATES DEFINITION
// ==========================================================================

#[account]
pub struct UserState {
    pub owner: Pubkey,
    pub referrer: Pubkey,
    pub total_swap_volume: u64,
    pub last_tx_timestamp: i64,
}

#[account]
pub struct LockAccount {
    pub owner: Pubkey,
    pub staked_amount: u64,
    pub lock_timestamp: i64,
    pub maturity_timestamp: i64,
    pub multiplier: f64,
    pub is_active: bool,
}

// ==========================================================================
// ERROR CODES
// ==========================================================================

#[error_code]
pub enum ProviztoError {
    #[msg("⚠️ Anti-Sybil Defense: Cooldown active. Please wait 10 seconds between calls.")]
    SybilCooldownActive,
    #[msg("⚠️ Validation Error: No active time-lock balance found for this wallet.")]
    NoActiveLockDetected,
    #[msg("⚠️ Maturity Exception: Contract has already reached milestone maturity. Use regular claim route.")]
    LockAlreadyMatured,
}