use soroban_sdk::{Address, Env};
use crate::storage_types::{DataKey, BALANCE_LIFETIME_THRESHOLD, BALANCE_BUMP_AMOUNT};

// Get the owner of a token
pub fn get_token_owner(env: &Env, token_id: u64) -> Address {
    let key = DataKey::Balance(token_id);
    if !env.storage().instance().has(&key) {
        panic!("token not found");
    }
    
    env.storage()
        .instance()
        .get(&key)
        .unwrap()
}

// Set the owner of a token
pub fn set_token_owner(env: &Env, token_id: u64, owner: &Address) {
    let key = DataKey::Balance(token_id);
    env.storage().instance().set(&key, owner);
    
    // Extend storage lifetime
    env.storage()
        .instance()
        .extend_ttl(BALANCE_LIFETIME_THRESHOLD, BALANCE_BUMP_AMOUNT);
}

// Check if a token exists
pub fn token_exists(env: &Env, token_id: u64) -> bool {
    let key = DataKey::Balance(token_id);
    env.storage().instance().has(&key)
} 