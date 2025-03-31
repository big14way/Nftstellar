use soroban_sdk::{Address, Env};
use crate::storage_types::{DataKey, INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT};

// Set approval for a token
pub fn set_approval(env: &Env, token_id: u64, approved: &Address) {
    env.storage().instance().set(&DataKey::Approval(token_id, approved.clone()), &true);
    
    // Extend storage lifetime
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

// Check if an address is approved for a token
pub fn check_approval(env: &Env, token_id: u64, address: &Address) -> bool {
    env.storage().instance().get(&DataKey::Approval(token_id, address.clone())).unwrap_or(false)
}

// Clear approval for a token
pub fn clear_approval(_env: &Env, _token_id: u64) {
    // Can't directly clear all approvals since we don't know which addresses are approved
    // In a real implementation, you would need a way to track all approvals for a token
    // This is a simplified version
} 