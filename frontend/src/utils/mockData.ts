import { NFTToken, NFTListing } from '../sdk';

export const mockNFTs: NFTToken[] = [
  {
    tokenId: '1',
    owner: 'GDNF4JV2KDXZQL7LVJIRY3ZRHISM43LSXCVXCBM3EQZ7KX3INGK5GZXL',
    uri: 'ipfs://QmTBNJGFNkHW7fHmquFxHQ8GnWjnCBB3xKmprcrTViTcXD'
  },
  {
    tokenId: '2',
    owner: 'GDNF4JV2KDXZQL7LVJIRY3ZRHISM43LSXCVXCBM3EQZ7KX3INGK5GZXL',
    uri: 'ipfs://QmNUgFJw4SvWaefACzKsifKjNeGdS8mDXm9DxMvXLyGirW'
  },
  {
    tokenId: '3',
    owner: 'GBGF7JJGWKXAONAYYCCW6D2CJRHJHFV7AGTLWF3HAHBPHPUZSRYSDLXU',
    uri: 'ipfs://QmPAJsvHDFdgARGMDKGPnajNw6XWRs3KNztUiXFfK9nXvJ'
  }
];

export const mockListings: NFTListing[] = [
  {
    tokenId: '3',
    price: '100',
    seller: 'GBGF7JJGWKXAONAYYCCW6D2CJRHJHFV7AGTLWF3HAHBPHPUZSRYSDLXU'
  },
  {
    tokenId: '4',
    price: '200',
    seller: 'GBGF7JJGWKXAONAYYCCW6D2CJRHJHFV7AGTLWF3HAHBPHPUZSRYSDLXU'
  }
]; 