#![no_std]

use soroban_sdk::{contract, contractimpl, Address, Env, String, Vec, Val};
use crate::storage_types::{DataKey, TokenMetadata, Listing, NFTToken, 
    INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT};
mod storage_types;
mod admin;
mod balance;
mod allowance;
mod metadata;

// Default royalty percentage (2.5%)
const DEFAULT_ROYALTY_PERCENTAGE: u32 = 250;

// Default platform fee (1%)
const DEFAULT_PLATFORM_FEE: u32 = 100;

// Maximum basis points (100%)
const MAX_BASIS_POINTS: u32 = 10000;

#[contract]
pub struct StellarNFTMarketplace;

#[contractimpl]
impl StellarNFTMarketplace {
    // Initialize the contract with collection metadata and admin
    pub fn initialize(
        env: Env, 
        admin: Address,
        name: String,
        symbol: String,
        description: String,
        base_uri: String,
        royalty_percentage: u32,
        royalty_recipient: Address,
        platform_fee: u32,
        platform_address: Address,
    ) {
        if admin::has_administrator(&env) {
            panic!("already initialized");
        }

        // Validate royalty and platform fee are within valid range
        if royalty_percentage > MAX_BASIS_POINTS || platform_fee > MAX_BASIS_POINTS {
            panic!("invalid fee percentage");
        }

        // Set admin
        admin.require_auth();
        admin::write_administrator(&env, &admin);

        // Set collection metadata
        let metadata = TokenMetadata {
            name,
            symbol,
            description,
            base_uri,
        };
        env.storage().instance().set(&DataKey::TokenMetadata, &metadata);

        // Set royalty information
        env.storage().instance().set(&DataKey::Royalty, &royalty_percentage);
        env.storage().instance().set(&DataKey::RoyaltyRecipient, &royalty_recipient);
        
        // Set platform fee information
        env.storage().instance().set(&DataKey::PlatformFee, &platform_fee);
        env.storage().instance().set(&DataKey::PlatformAddress, &platform_address);
        
        // Initialize token count
        env.storage().instance().set(&DataKey::TokenCount, &0u64);

        // Extend contract lifetime
        env.storage()
            .instance()
            .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
    }

    // Get token metadata
    pub fn get_token_metadata(env: Env) -> TokenMetadata {
        env.storage().instance().get(&DataKey::TokenMetadata).unwrap()
    }

    // Get token count (total supply)
    pub fn get_token_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::TokenCount).unwrap_or(0)
    }

    // Get a specific token by ID
    pub fn get_token(env: Env, token_id: u64) -> NFTToken {
        // Check token exists
        let token_count = Self::get_token_count(env.clone());
        if token_id >= token_count {
            panic!("token does not exist");
        }

        // Get token URI
        let uri = env.storage().instance().get(&DataKey::TokenURI(token_id)).unwrap_or(String::from_str(&env, ""));

        // Get token owner
        let owner = balance::get_token_owner(&env, token_id);

        NFTToken {
            token_id,
            owner,
            uri,
        }
    }

    // Get tokens owned by an address
    pub fn get_tokens_by_owner(env: Env, owner: Address) -> Vec<NFTToken> {
        let token_count = Self::get_token_count(env.clone());
        let mut tokens = Vec::new(&env);

        for token_id in 0..token_count {
            let token_owner = balance::get_token_owner(&env, token_id);
            if token_owner == owner {
                let token = Self::get_token(env.clone(), token_id);
                tokens.push_back(token);
            }
        }

        tokens
    }

    // Mint a new NFT
    pub fn mint(env: Env, to: Address, token_uri: String) -> u64 {
        to.require_auth();

        // Get the current token count
        let mut token_count: u64 = Self::get_token_count(env.clone());
        
        // Assign token ID
        let token_id = token_count;
        
        // Increment token count
        token_count += 1;
        env.storage().instance().set(&DataKey::TokenCount, &token_count);
        
        // Set token URI
        env.storage().instance().set(&DataKey::TokenURI(token_id), &token_uri);
        
        // Set token owner
        balance::set_token_owner(&env, token_id, &to);
        
        // Return the new token ID
        token_id
    }

    // Transfer an NFT
    pub fn transfer(env: Env, from: Address, to: Address, token_id: u64) {
        from.require_auth();
        
        // Check if token exists
        let token_count = Self::get_token_count(env.clone());
        if token_id >= token_count {
            panic!("token does not exist");
        }
        
        // Check if sender is the owner
        let owner = balance::get_token_owner(&env, token_id);
        if owner != from {
            // Check if approved
            if !allowance::check_approval(&env, token_id, &from) {
                panic!("not authorized to transfer");
            }
        }
        
        // Check if token is listed for sale
        if Self::is_token_listed(env.clone(), token_id) {
            panic!("token is listed for sale");
        }
        
        // Transfer ownership
        balance::set_token_owner(&env, token_id, &to);
        
        // Clear any existing approvals
        allowance::clear_approval(&env, token_id);
    }

    // Approve an address to transfer a token
    pub fn approve(env: Env, owner: Address, approved: Address, token_id: u64) {
        owner.require_auth();
        
        // Check if token exists and owner is correct
        let token_owner = balance::get_token_owner(&env, token_id);
        if token_owner != owner {
            panic!("not token owner");
        }
        
        // Set approval
        allowance::set_approval(&env, token_id, &approved);
    }

    // Check if a token is approved for an address
    pub fn is_approved(env: Env, token_id: u64, address: Address) -> bool {
        allowance::check_approval(&env, token_id, &address)
    }

    // List a token for sale
    pub fn list_token(env: Env, owner: Address, token_id: u64, price: i128) -> Listing {
        owner.require_auth();
        
        // Validate price
        if price <= 0 {
            panic!("price must be positive");
        }
        
        // Check if token exists and owner is correct
        let token_owner = balance::get_token_owner(&env, token_id);
        if token_owner != owner {
            panic!("not token owner");
        }
        
        // Check if token is already listed
        if Self::is_token_listed(env.clone(), token_id) {
            panic!("token already listed");
        }
        
        // Create listing
        let listing = Listing {
            token_id,
            price,
            seller: owner.clone(),
        };
        
        // Store listing info
        env.storage().instance().set(&DataKey::Listed(token_id), &true);
        env.storage().instance().set(&DataKey::ListingPrice(token_id), &price);
        env.storage().instance().set(&DataKey::ListedBy(token_id), &owner);
        
        listing
    }

    // Cancel a token listing
    pub fn cancel_listing(env: Env, owner: Address, token_id: u64) {
        owner.require_auth();
        
        // Check if token is listed
        if !Self::is_token_listed(env.clone(), token_id) {
            panic!("token not listed");
        }
        
        // Check if caller is the lister
        let lister: Address = env.storage().instance().get(&DataKey::ListedBy(token_id)).unwrap();
        if lister != owner {
            panic!("not authorized to cancel listing");
        }
        
        // Remove listing
        env.storage().instance().remove(&DataKey::Listed(token_id));
        env.storage().instance().remove(&DataKey::ListingPrice(token_id));
        env.storage().instance().remove(&DataKey::ListedBy(token_id));
    }

    // Buy a listed token
    pub fn buy_token(env: Env, buyer: Address, token_id: u64) {
        buyer.require_auth();
        
        // Check if token is listed
        if !Self::is_token_listed(env.clone(), token_id) {
            panic!("token not listed");
        }
        
        // Get listing details
        let price: i128 = env.storage().instance().get(&DataKey::ListingPrice(token_id)).unwrap();
        let seller: Address = env.storage().instance().get(&DataKey::ListedBy(token_id)).unwrap();
        
        // Check if buyer isn't seller
        if buyer == seller {
            panic!("cannot buy your own token");
        }
        
        // Calculate royalty payment
        let royalty_percentage: u32 = env.storage().instance().get(&DataKey::Royalty).unwrap_or(DEFAULT_ROYALTY_PERCENTAGE);
        let royalty_recipient: Address = env.storage().instance().get(&DataKey::RoyaltyRecipient).unwrap_or(seller.clone());
        let royalty_amount = price * royalty_percentage as i128 / MAX_BASIS_POINTS as i128;
        
        // Calculate platform fee
        let platform_fee: u32 = env.storage().instance().get(&DataKey::PlatformFee).unwrap_or(DEFAULT_PLATFORM_FEE);
        let platform_address: Address = env.storage().instance().get(&DataKey::PlatformAddress).unwrap_or(seller.clone());
        let platform_fee_amount = price * platform_fee as i128 / MAX_BASIS_POINTS as i128;
        
        // Calculate seller payment
        let seller_amount = price - royalty_amount - platform_fee_amount;
        
        // Handle payments - in a real contract, this would call a token contract
        // For this example, we'll just do the ownership transfer without actual payments
        // since we can't make XLM payments directly from the contract
        
        // Transfer token ownership
        balance::set_token_owner(&env, token_id, &buyer);
        
        // Remove listing
        env.storage().instance().remove(&DataKey::Listed(token_id));
        env.storage().instance().remove(&DataKey::ListingPrice(token_id));
        env.storage().instance().remove(&DataKey::ListedBy(token_id));
    }

    // Check if token is listed
    pub fn is_token_listed(env: Env, token_id: u64) -> bool {
        env.storage().instance().get(&DataKey::Listed(token_id)).unwrap_or(false)
    }

    // Get token listing
    pub fn get_token_listing(env: Env, token_id: u64) -> Option<Listing> {
        if !Self::is_token_listed(env.clone(), token_id) {
            return None;
        }
        
        let price: i128 = env.storage().instance().get(&DataKey::ListingPrice(token_id)).unwrap();
        let seller: Address = env.storage().instance().get(&DataKey::ListedBy(token_id)).unwrap();
        
        Some(Listing {
            token_id,
            price,
            seller,
        })
    }

    // Get all listed tokens
    pub fn get_all_listings(env: Env) -> Vec<Listing> {
        let token_count = Self::get_token_count(env.clone());
        let mut listings = Vec::new(&env);
        
        for token_id in 0..token_count {
            if let Some(listing) = Self::get_token_listing(env.clone(), token_id) {
                listings.push_back(listing);
            }
        }
        
        listings
    }

    // Update royalty settings (admin only)
    pub fn update_royalty(env: Env, admin: Address, royalty_percentage: u32, royalty_recipient: Address) {
        admin::verify_admin(&env, &admin);
        
        if royalty_percentage > MAX_BASIS_POINTS {
            panic!("invalid royalty percentage");
        }
        
        env.storage().instance().set(&DataKey::Royalty, &royalty_percentage);
        env.storage().instance().set(&DataKey::RoyaltyRecipient, &royalty_recipient);
    }

    // Update platform fee settings (admin only)
    pub fn update_platform_fee(env: Env, admin: Address, platform_fee: u32, platform_address: Address) {
        admin::verify_admin(&env, &admin);
        
        if platform_fee > MAX_BASIS_POINTS {
            panic!("invalid platform fee");
        }
        
        env.storage().instance().set(&DataKey::PlatformFee, &platform_fee);
        env.storage().instance().set(&DataKey::PlatformAddress, &platform_address);
    }

    // Update admin (current admin only)
    pub fn update_admin(env: Env, admin: Address, new_admin: Address) {
        admin::verify_admin(&env, &admin);
        admin::write_administrator(&env, &new_admin);
    }
}
