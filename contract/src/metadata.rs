use soroban_sdk::{Env, String};
use crate::storage_types::{DataKey, TokenMetadata, INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT};

// Get the collection metadata
pub fn get_metadata(env: &Env) -> TokenMetadata {
    env.storage().instance().get(&DataKey::TokenMetadata).unwrap()
}

// Get the token URI for a specific token ID
pub fn get_token_uri(env: &Env, token_id: u64) -> String {
    env.storage().instance().get(&DataKey::TokenURI(token_id)).unwrap_or(String::from_str(env, ""))
}

// Set the token URI for a specific token ID
pub fn set_token_uri(env: &Env, token_id: u64, uri: &String) {
    env.storage().instance().set(&DataKey::TokenURI(token_id), uri);
    
    // Extend storage lifetime
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
} 