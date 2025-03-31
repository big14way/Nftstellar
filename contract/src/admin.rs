use soroban_sdk::{Address, Env};
use crate::storage_types::{DataKey, INSTANCE_BUMP_AMOUNT, INSTANCE_LIFETIME_THRESHOLD};

pub fn has_administrator(e: &Env) -> bool {
    let key = DataKey::Admin;
    e.storage().instance().has(&key)
}

pub fn read_administrator(e: &Env) -> Address {
    let key = DataKey::Admin;
    e.storage().instance().get(&key).unwrap()
}

pub fn write_administrator(e: &Env, id: &Address) {
    let key = DataKey::Admin;
    e.storage().instance().set(&key, id);
    e.storage()
        .instance()
        .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

// Check if the provided address is the admin
pub fn check_admin(e: &Env, address: &Address) -> bool {
    has_administrator(e) && address == &read_administrator(e)
}

// Verify the address is admin and require auth
pub fn verify_admin(e: &Env, address: &Address) {
    if !check_admin(e, address) {
        panic!("not authorized by admin")
    }
    address.require_auth();
} 