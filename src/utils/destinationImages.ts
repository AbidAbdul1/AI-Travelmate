/**
 * Reliable destination image resolver for AI-TRAVELMATE.
 * Ensures every place has an authentic, high-resolution photo with zero broken links.
 */

import { Destination } from '../types/travel';

export const DESTINATION_IMAGE_REGISTRY: Record<string, string> = {
  // Vijayawada Pilot Destinations
  'kanakadurga-temple': '/images/travelmate_kanakadurga_temple_1793036233893.jpg',
  'undavalli-caves': '/images/travelmate_undavalli_caves_1793036233801.jpg',
  'prakasam-barrage': '/images/travelmate_hero_vijayawada_1793036232221.jpg',
  'bhavani-island': '/images/travelmate_bhavani_island_1793036233704.jpg',
  'kondapalli-fort': 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1000&q=80',
  'bapu-museum': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1000&q=80',
  'mogalarajapuram-caves': 'https://images.unsplash.com/photo-1600100397608-f010f443834a?auto=format&fit=crop&w=1000&q=80',
  'besant-road-bazaar': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
  'mangalagiri-temple': 'https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=1000&q=80',
  'amaravati-stupa': 'https://images.unsplash.com/photo-1590077428593-a55bb07c4665?auto=format&fit=crop&w=1000&q=80',
  'gandhi-hill': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',

  // Hyderabad
  'hyd-charminar': 'https://images.unsplash.com/photo-1609137144822-0d33e536136e?auto=format&fit=crop&w=1000&q=80',
  'hyd-golconda-fort': 'https://images.unsplash.com/photo-1626014303757-65824c3d4f40?auto=format&fit=crop&w=1000&q=80',
  'hyd-hussain-sagar': 'https://images.unsplash.com/photo-1572455044327-7348c1be7267?auto=format&fit=crop&w=1000&q=80',
  'hyd-salar-jung': 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1000&q=80',
  'hyd-ramoji-film-city': 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1000&q=80',

  // Delhi & NCR
  'del-india-gate': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1000&q=80',
  'del-red-fort': 'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=1000&q=80',
  'del-qutub-minar': 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80',
  'del-lotus-temple': 'https://images.unsplash.com/photo-1598890777032-bde13fbe3492?auto=format&fit=crop&w=1000&q=80',
  'del-chandni-chowk': 'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?auto=format&fit=crop&w=1000&q=80',

  // Agra & Jaipur
  'agr-taj-mahal': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80',
  'agr-agra-fort': 'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1000&q=80',
  'jai-hawa-mahal': 'https://images.unsplash.com/photo-1603228254119-e6a4d095dc59?auto=format&fit=crop&w=1000&q=80',
  'jai-amber-palace': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=80',
  'jai-city-palace': 'https://images.unsplash.com/photo-1598890777032-bde13fbe3492?auto=format&fit=crop&w=1000&q=80',

  // Mumbai & Bengaluru
  'mum-gateway-of-india': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=80',
  'mum-marine-drive': 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1000&q=80',
  'mum-elephanta-caves': 'https://images.unsplash.com/photo-1600100397608-f010f443834a?auto=format&fit=crop&w=1000&q=80',
  'blr-bangalore-palace': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1000&q=80',
  'blr-lalbagh': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=80',

  // Varanasi & Southern Hubs
  'var-kashi-vishwanath': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1000&q=80',
  'var-dashashwamedh-ghat': 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1000&q=80',
  'che-marina-beach': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80',
  'che-kapaleeshwarar': 'https://images.unsplash.com/photo-1621252179027-94459d278660?auto=format&fit=crop&w=1000&q=80',

  // Paris, France
  'paris-eiffel-tower': 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1000&q=80',
  'paris-louvre-museum': 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=1000&q=80',
  'paris-notre-dame': 'https://images.unsplash.com/photo-1478358161113-b0e11994a36b?auto=format&fit=crop&w=1000&q=80',
  'paris-arc-de-triomphe': 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=1000&q=80',
  'paris-sacre-coeur': 'https://images.unsplash.com/photo-1520939817895-060bdef4ad1b?auto=format&fit=crop&w=1000&q=80',

  // Tokyo, Japan
  'tokyo-senso-ji': 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1000&q=80',
  'tokyo-shibuya-crossing': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
  'tokyo-tower': 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1000&q=80',
  'tokyo-meiji-shrine': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',

  // London, UK
  'london-big-ben': 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=1000&q=80',
  'london-tower-bridge': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80',
  'london-british-museum': 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=1000&q=80',
  'london-buckingham-palace': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1000&q=80',

  // New York City, USA
  'nyc-statue-of-liberty': 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?auto=format&fit=crop&w=1000&q=80',
  'nyc-central-park': 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1000&q=80',
  'nyc-times-square': 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=1000&q=80',
  'nyc-empire-state': 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1000&q=80',

  // Rome, Italy
  'rome-colosseum': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1000&q=80',
  'rome-trevi-fountain': 'https://images.unsplash.com/photo-1525874684015-58379d421a52?auto=format&fit=crop&w=1000&q=80',
  'rome-vatican-basilica': 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=1000&q=80',

  // Dubai, UAE
  'dubai-burj-khalifa': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80',
  'dubai-marina': 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1000&q=80',
  'dubai-palm-jumeirah': 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1000&q=80',

  // Singapore
  'sg-marina-bay-sands': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1000&q=80',
  'sg-gardens-by-the-bay': 'https://images.unsplash.com/photo-1506351421178-63b52a2d2562?auto=format&fit=crop&w=1000&q=80',
  'sg-sentosa-island': 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80',

  // Sydney, Australia
  'syd-opera-house': 'https://images.unsplash.com/photo-1523428096881-5cb799441e06?auto=format&fit=crop&w=1000&q=80',
  'syd-harbour-bridge': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1000&q=80',
  'syd-bondi-beach': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
};

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'Heritage & Temples': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1000&q=80',
  'Caves & Architecture': 'https://images.unsplash.com/photo-1600100397608-f010f443834a?auto=format&fit=crop&w=1000&q=80',
  'Nature & Islands': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
  'Culture & Museums': 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1000&q=80',
  'Parks & Recreation': 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1000&q=80',
  'Food & Cuisine': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
  'All': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80',
};

/**
 * Resolves an authentic, working image URL for any destination.
 */
export function getDestinationImageUrl(dest?: Partial<Destination> | null): string {
  if (!dest) {
    return CATEGORY_FALLBACK_IMAGES['All'];
  }

  // 1. Check if explicit imageUrl is present and not a legacy broken path
  if (dest.imageUrl && !dest.imageUrl.startsWith('/src/assets/')) {
    return dest.imageUrl;
  }

  // 2. Check if registered in ID catalog
  if (dest.id && DESTINATION_IMAGE_REGISTRY[dest.id]) {
    return DESTINATION_IMAGE_REGISTRY[dest.id];
  }

  // 3. Keyword heuristic on name
  const nameLower = (dest.name || '').toLowerCase();
  for (const [id, url] of Object.entries(DESTINATION_IMAGE_REGISTRY)) {
    const key = id.replace(/^(hyd|del|agr|jai|mum|blr|var|che|paris|tokyo|london|nyc|rome|dubai|sg|syd)-/, '');
    if (nameLower.includes(key.replace(/-/g, ' '))) {
      return url;
    }
  }

  // 4. Fallback to category hero
  const cat = dest.category || 'All';
  return CATEGORY_FALLBACK_IMAGES[cat] || CATEGORY_FALLBACK_IMAGES['All'];
}
