use soroban_sdk::{contracttype, Address, String};

// Ledger lifetimes and TTL extensions
pub const DAY_IN_LEDGERS: u32 = 17280;
pub const INSTANCE_LIFETIME_THRESHOLD: u32 = DAY_IN_LEDGERS * 30; // ~30 days
pub const INSTANCE_BUMP_AMOUNT: u32 = DAY_IN_LEDGERS * 30; // ~30 days
pub const BALANCE_LIFETIME_THRESHOLD: u32 = DAY_IN_LEDGERS * 30; // ~30 days
pub const BALANCE_BUMP_AMOUNT: u32 = DAY_IN_LEDGERS * 30; // ~30 days

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,                // Admin address
    TokenMetadata,        // NFT collection metadata
    Balance(u64),         // NFT owner by token ID
    TokenURI(u64),        // NFT token URI for each token id
    TokenCount,           // Total NFTs minted
    Approval(u64, Address), // Approval for a specific token and address
    Listed(u64),          // NFT listed for sale by token ID
    ListingPrice(u64),    // Price of listed NFT by token ID
    ListedBy(u64),        // Who listed the NFT by token ID
    Royalty,              // Royalty percentage (in basis points, e.g., 250 = 2.5%)
    RoyaltyRecipient,     // Address to receive royalties
    PlatformFee,          // Platform fee percentage (in basis points)
    PlatformAddress,      // Address to receive platform fees
}

#[contracttype]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub description: String,
    pub base_uri: String,
}

#[contracttype]
pub struct Listing {
    pub token_id: u64,
    pub price: i128,
    pub seller: Address,
}

#[contracttype]
pub struct NFTToken {
    pub token_id: u64,
    pub owner: Address,
    pub uri: String,
} 