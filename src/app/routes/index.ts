import { lazier } from 'eth-hooks/helpers';

// the components and pages are lazy loaded for performance and bundle size reasons
// code is in the component file

export const YourCollectibles = lazier(() => import('./your-collectibles/YourCollectibles'), 'YourCollectibles');
export const ExampleUI = lazier(() => import('./exampleui/ExampleUI'), 'ExampleUI');
export const Checkout = lazier(() => import('./checkout/Checkout'), 'Checkout');
export const Subgraph = lazier(() => import('./subgraph/Subgraph'), 'Subgraph');
export const Hints = lazier(() => import('./hints/Hints'), 'Hints');
export const GiftNft = lazier(() => import('./gift-nft/GiftNft'), 'GiftNft');
export const Gift = lazier(() => import('./gift/Gift'), 'Gift');
export const GiftRequest = lazier(() => import('./gift-request/GiftRequest'), 'GiftRequest');
export const NftDetail = lazier(() => import('./nft-detail/NftDetail'), 'NftDetail');
export const Nfts = lazier(() => import('./nfts/Nfts'), 'Nfts');
export const GiftDetail = lazier(() => import('./gift/GiftDetail'), 'GiftDetail');
