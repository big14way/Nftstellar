export interface NFT {
  id: string;
  title: string;
  image: string;
  price: string;
  creator: string;
  likes: number;
  isListed: boolean;
  category: 'Art' | 'Collectibles' | 'Photography' | 'Music' | 'Gaming';
  collection?: string;
  description?: string;
  attributes?: {
    trait_type: string;
    value: string;
  }[];
}

export const mockNFTs: NFT[] = [
  {
    id: '1',
    title: 'Cosmic Horizon #1',
    image: '/nft-placeholder.png',
    price: '100',
    creator: '0x1234...5678',
    likes: 42,
    isListed: true,
    category: 'Art',
    collection: 'Cosmic Series',
    description: 'A mesmerizing view of the cosmic horizon, where stars meet the infinite void.',
    attributes: [
      { trait_type: 'Style', value: 'Abstract' },
      { trait_type: 'Colors', value: 'Multi' },
      { trait_type: 'Rarity', value: 'Rare' }
    ]
  },
  {
    id: '2',
    title: 'Stellar Dreams #7',
    image: '/nft-placeholder.png',
    price: '150',
    creator: '0x8765...4321',
    likes: 28,
    isListed: true,
    category: 'Art',
    collection: 'Stellar Dreams',
    description: 'Part of the exclusive Stellar Dreams collection, featuring ethereal space landscapes.',
    attributes: [
      { trait_type: 'Style', value: 'Digital Painting' },
      { trait_type: 'Colors', value: 'Blue' },
      { trait_type: 'Rarity', value: 'Common' }
    ]
  },
  {
    id: '3',
    title: 'Space Beats Vol. 1',
    image: '/nft-placeholder.png',
    price: '75',
    creator: '0x9876...1234',
    likes: 35,
    isListed: false,
    category: 'Music',
    description: 'An otherworldly musical experience inspired by the sounds of the cosmos.',
    attributes: [
      { trait_type: 'Duration', value: '3:45' },
      { trait_type: 'Genre', value: 'Electronic' },
      { trait_type: 'BPM', value: '128' }
    ]
  },
  {
    id: '4',
    title: 'Nebula Hunter',
    image: '/nft-placeholder.png',
    price: '200',
    creator: '0x4321...8765',
    likes: 56,
    isListed: true,
    category: 'Gaming',
    collection: 'Space Warriors',
    description: 'Exclusive character skin for the Space Warriors game.',
    attributes: [
      { trait_type: 'Class', value: 'Hunter' },
      { trait_type: 'Level', value: 'Legendary' },
      { trait_type: 'Power', value: '95' }
    ]
  },
  {
    id: '5',
    title: 'Deep Space Photography',
    image: '/nft-placeholder.png',
    price: '300',
    creator: '0xabcd...efgh',
    likes: 89,
    isListed: true,
    category: 'Photography',
    description: 'Real telescope capture of a distant galaxy cluster.',
    attributes: [
      { trait_type: 'Equipment', value: 'Professional' },
      { trait_type: 'Resolution', value: '8K' },
      { trait_type: 'Distance', value: '2.5M Light Years' }
    ]
  },
  {
    id: '6',
    title: 'Stellar Collectible Card #42',
    image: '/nft-placeholder.png',
    price: '50',
    creator: '0xijkl...mnop',
    likes: 15,
    isListed: true,
    category: 'Collectibles',
    collection: 'Stellar Cards',
    description: 'Limited edition trading card featuring rare cosmic events.',
    attributes: [
      { trait_type: 'Series', value: '1' },
      { trait_type: 'Rarity', value: 'Uncommon' },
      { trait_type: 'Edition', value: '42/100' }
    ]
  },
  {
    id: '7',
    title: 'Quantum Artifact',
    image: '/nft-placeholder.png',
    price: '500',
    creator: '0xqrst...uvwx',
    likes: 120,
    isListed: true,
    category: 'Art',
    collection: 'Quantum Series',
    description: 'A visualization of quantum mechanics in the cosmos.',
    attributes: [
      { trait_type: 'Dimension', value: '4D' },
      { trait_type: 'Animation', value: 'Yes' },
      { trait_type: 'Rarity', value: 'Ultra Rare' }
    ]
  },
  {
    id: '8',
    title: 'Space Station Alpha',
    image: '/nft-placeholder.png',
    price: '250',
    creator: '0xyzab...cdef',
    likes: 45,
    isListed: true,
    category: 'Gaming',
    collection: 'Space Stations',
    description: 'Virtual space station property in the Stellar Metaverse.',
    attributes: [
      { trait_type: 'Size', value: 'Large' },
      { trait_type: 'Location', value: 'Alpha Sector' },
      { trait_type: 'Facilities', value: '5' }
    ]
  }
];

export const categories = ['Art', 'Collectibles', 'Photography', 'Music', 'Gaming'] as const;
export const collections = ['Cosmic Series', 'Stellar Dreams', 'Space Warriors', 'Stellar Cards', 'Quantum Series', 'Space Stations']; 