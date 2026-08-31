import homeUsa from '../../../assets/home_usa.png';
import homeCommunity from '../../../assets/home_community.jpg';

/**
 * Per-region data for the shared region home sections.
 *
 * These objects capture ONLY the values that differ between the USA, UK,
 * Ghana and South Africa home pages (colours, emoji, translation-key suffixes
 * and the region-specific data arrays). The JSX itself lives in the shared
 * RegionHome*Section components so the rendered output stays identical.
 */

export const usaConfig = {
  key: 'usa',
  emoji: '🇺🇸',
  badgeLabel: 'POWERCITY INTERNATIONAL USA',
  imageAlt: 'Powercity International USA',
  regionParam: 'US',
  // Hero
  hero: {
    overlayGradient: 'from-blue-900/80 via-primary-600/50 to-red-900/70',
    starsOverlay: true,
    subtitleKey: 'hero.subtitleUSA',
    decorative: ['bg-blue-500', 'bg-red-500', 'bg-white'],
    floating: ['bg-white', 'bg-blue-400', 'bg-red-400'],
  },
  // Welcome
  welcome: {
    badgeKey: 'welcome.badgeUSA',
    headingKey: 'welcome.headingUSA',
    subtitleKey: 'welcome.subtitleUSA',
    decorative: ['bg-blue-500', 'bg-red-500'],
  },
  // Presence
  presence: {
    image: homeUsa,
    initial: 'SOUTH',
    headingKey: 'presence.headingUSA',
    subtitleKey: 'presence.subtitleUSA',
    tabGradient: 'from-blue-600 to-red-600',
    imageOverlay: 'from-blue-900/60',
    itemsLabelKey: 'presence.statesLabel',
    itemsKey: 'states',
    chipGradient: 'from-blue-500/20 to-red-500/20',
    focusBullets: ['bg-blue-400', 'bg-red-400', 'bg-white', 'bg-yellow-400'],
    regions: [
      {
        code: 'SOUTH',
        name: 'Southern States',
        description: 'Our vibrant campuses in the heart of the South spreading the Gospel.',
        states: ['Texas', 'Florida', 'Georgia', 'North Carolina'],
        highlight: 'Houston Campus - Our flagship USA location',
      },
      {
        code: 'NORTHEAST',
        name: 'Northeast',
        description: 'Reaching the metropolitan areas of the Northeast with the transforming power of Christ.',
        states: ['New York', 'New Jersey', 'Pennsylvania', 'Maryland'],
        highlight: 'Growing presence in the Tri-State area',
      },
      {
        code: 'WEST',
        name: 'West Coast',
        description: 'Expanding ministry along the Pacific coast and western territories.',
        states: ['California', 'Washington', 'Arizona', 'Nevada'],
        highlight: 'New campuses launching soon',
      },
      {
        code: 'MIDWEST',
        name: 'Midwest',
        description: "Building faith communities in America's heartland.",
        states: ['Illinois', 'Ohio', 'Michigan', 'Minnesota'],
        highlight: 'Community-focused ministry',
      },
    ],
  },
  // Atmosphere
  atmosphere: {
    overlayGradient: 'from-blue-900/80 via-primary-600/60 to-red-900/80',
    encounterKey: 'atmosphere.encounterUSA',
    listIcons: [
      { wrap: 'bg-blue-500/30', text: 'text-blue-300' },
      { wrap: 'bg-red-500/30', text: 'text-red-300' },
      { wrap: 'bg-yellow-500/30', text: 'text-yellow-300' },
      { wrap: 'bg-white/20', text: 'text-white' },
    ],
    cardGradient: 'from-blue-500 to-red-500',
    cardFloating: ['bg-blue-500', 'bg-red-500'],
    bottomFloating: 'bg-yellow-400',
  },
  // Leadership
  leadership: {
    imageOverlay: 'from-blue-900/50',
    imageAlt: 'Powercity International USA Leadership',
    decorative: ['bg-blue-500', 'bg-red-500'],
    headingKey: 'leadership.headingUSA',
    descKey: 'leadership.descUSA',
    visionBoxGradient: 'from-blue-900/50 to-red-900/50',
    visionKey: 'leadership.visionUSA',
    visionDescKey: 'leadership.visionDescUSA',
    values: [
      { wrap: 'bg-blue-500/20', text: 'text-blue-400' },
      { wrap: 'bg-red-500/20', text: 'text-red-400' },
      { wrap: 'bg-yellow-500/20', text: 'text-yellow-400' },
      { wrap: 'bg-white/20', text: 'text-white' },
    ],
  },
};

export const ukConfig = {
  key: 'uk',
  emoji: '🇬🇧',
  badgeLabel: 'POWERCITY INTERNATIONAL UK',
  imageAlt: 'Powercity International UK',
  regionParam: 'UK',
  hero: {
    overlayGradient: 'from-blue-900/80 via-primary-600/50 to-red-800/70',
    starsOverlay: false,
    subtitleKey: 'hero.subtitleUK',
    decorative: ['bg-blue-700', 'bg-red-700', 'bg-white'],
    floating: ['bg-white', 'bg-blue-400', 'bg-red-400'],
  },
  welcome: {
    badgeKey: 'welcome.badgeUK',
    headingKey: 'welcome.headingUK',
    subtitleKey: 'welcome.subtitleUK',
    decorative: ['bg-blue-700', 'bg-red-700'],
  },
  presence: {
    image: homeCommunity,
    initial: 'LONDON',
    headingKey: 'presence.headingUK',
    subtitleKey: 'presence.subtitleUK',
    tabGradient: 'from-blue-700 to-red-700',
    imageOverlay: 'from-blue-900/60',
    itemsLabelKey: 'presence.areasLabel',
    itemsKey: 'areas',
    chipGradient: 'from-blue-500/20 to-red-500/20',
    focusBullets: ['bg-blue-400', 'bg-red-400', 'bg-white', 'bg-yellow-400'],
    regions: [
      {
        code: 'LONDON',
        name: 'London & South East',
        description: 'Our thriving campuses in the capital city, spreading the Gospel across Greater London and the South East.',
        areas: ['Central London', 'East London', 'South London', 'Surrey'],
        highlight: 'London Campus - Our flagship UK location',
      },
      {
        code: 'MIDLANDS',
        name: 'Midlands',
        description: 'Reaching communities across the heart of England with the transforming power of Christ.',
        areas: ['Birmingham', 'Coventry', 'Leicester', 'Nottingham'],
        highlight: 'Growing presence in the Midlands',
      },
      {
        code: 'NORTH',
        name: 'North of England',
        description: 'Expanding ministry across the vibrant cities of Northern England.',
        areas: ['Manchester', 'Leeds', 'Liverpool', 'Sheffield'],
        highlight: 'New campuses launching soon',
      },
      {
        code: 'SCOTLAND',
        name: 'Scotland',
        description: 'Building faith communities across Scotland and the Celtic nations.',
        areas: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee'],
        highlight: 'Community-focused ministry',
      },
    ],
  },
  atmosphere: {
    overlayGradient: 'from-blue-900/80 via-primary-600/60 to-red-800/80',
    encounterKey: 'atmosphere.encounterUK',
    listIcons: [
      { wrap: 'bg-blue-500/30', text: 'text-blue-300' },
      { wrap: 'bg-red-500/30', text: 'text-red-300' },
      { wrap: 'bg-yellow-500/30', text: 'text-yellow-300' },
      { wrap: 'bg-white/20', text: 'text-white' },
    ],
    cardGradient: 'from-blue-700 to-red-700',
    cardFloating: ['bg-blue-700', 'bg-red-700'],
    bottomFloating: 'bg-yellow-400',
  },
  leadership: {
    imageOverlay: 'from-blue-900/50',
    imageAlt: 'Powercity International UK Leadership',
    decorative: ['bg-blue-700', 'bg-red-700'],
    headingKey: 'leadership.headingUK',
    descKey: 'leadership.descUK',
    visionBoxGradient: 'from-blue-900/50 to-red-900/50',
    visionKey: 'leadership.visionUK',
    visionDescKey: 'leadership.visionDescUK',
    values: [
      { wrap: 'bg-blue-500/20', text: 'text-blue-400' },
      { wrap: 'bg-red-500/20', text: 'text-red-400' },
      { wrap: 'bg-yellow-500/20', text: 'text-yellow-400' },
      { wrap: 'bg-white/20', text: 'text-white' },
    ],
  },
};

export const ghanaConfig = {
  key: 'ghana',
  emoji: '🇬🇭',
  badgeLabel: 'POWERCITY INTERNATIONAL GHANA',
  imageAlt: 'Powercity International Ghana',
  regionParam: 'GH',
  hero: {
    overlayGradient: 'from-red-900/80 via-primary-600/50 to-green-900/70',
    starsOverlay: false,
    subtitleKey: 'hero.subtitleGhana',
    decorative: ['bg-red-700', 'bg-yellow-500', 'bg-green-500'],
    floating: ['bg-white', 'bg-red-400', 'bg-yellow-400'],
  },
  welcome: {
    badgeKey: 'welcome.badgeGhana',
    headingKey: 'welcome.headingGhana',
    subtitleKey: 'welcome.subtitleGhana',
    decorative: ['bg-red-600', 'bg-yellow-500'],
  },
  presence: {
    image: homeCommunity,
    initial: 'GREATER_ACCRA',
    headingKey: 'presence.headingGhana',
    subtitleKey: 'presence.subtitleGhana',
    tabGradient: 'from-red-700 to-green-700',
    tabCodeReplace: true,
    imageOverlay: 'from-red-900/60',
    itemsLabelKey: 'presence.citiesLabel',
    itemsKey: 'cities',
    chipGradient: 'from-red-500/20 to-green-500/20',
    focusBullets: ['bg-red-400', 'bg-yellow-400', 'bg-white', 'bg-green-400'],
    regions: [
      {
        code: 'GREATER_ACCRA',
        name: 'Greater Accra',
        description: 'Our thriving campuses in the capital region, reaching Accra and surrounding communities with the Gospel.',
        cities: ['Accra', 'Tema', 'Madina', 'Kasoa'],
        highlight: 'Accra Campus - Our flagship Ghana location',
      },
      {
        code: 'ASHANTI',
        name: 'Ashanti Region',
        description: 'Reaching the heart of Ghana in Kumasi and the Ashanti region with the transforming power of Christ.',
        cities: ['Kumasi', 'Obuasi', 'Ejisu', 'Konongo'],
        highlight: 'Growing presence in Ashanti',
      },
      {
        code: 'WESTERN',
        name: 'Western Region',
        description: 'Expanding ministry across the vibrant Western Region of Ghana.',
        cities: ['Takoradi', 'Sekondi', 'Tarkwa', 'Axim'],
        highlight: 'New campuses launching soon',
      },
      {
        code: 'NORTHERN',
        name: 'Northern Region',
        description: 'Building faith communities across Northern Ghana.',
        cities: ['Tamale', 'Yendi', 'Bolgatanga', 'Wa'],
        highlight: 'Community-focused ministry',
      },
    ],
  },
  atmosphere: {
    overlayGradient: 'from-red-900/80 via-primary-600/60 to-green-900/80',
    encounterKey: 'atmosphere.encounterGhana',
    listIcons: [
      { wrap: 'bg-red-500/30', text: 'text-red-300' },
      { wrap: 'bg-yellow-500/30', text: 'text-yellow-300' },
      { wrap: 'bg-white/20', text: 'text-white' },
      { wrap: 'bg-green-500/30', text: 'text-green-300' },
    ],
    cardGradient: 'from-red-700 to-green-700',
    cardFloating: ['bg-red-600', 'bg-yellow-500'],
    bottomFloating: 'bg-green-400',
  },
  leadership: {
    imageOverlay: 'from-red-900/50',
    imageAlt: 'Powercity International Ghana Leadership',
    decorative: ['bg-red-600', 'bg-yellow-500'],
    headingKey: 'leadership.headingGhana',
    descKey: 'leadership.descGhana',
    visionBoxGradient: 'from-red-900/50 to-green-900/50',
    visionKey: 'leadership.visionGhana',
    visionDescKey: 'leadership.visionDescGhana',
    values: [
      { wrap: 'bg-red-500/20', text: 'text-red-400' },
      { wrap: 'bg-yellow-500/20', text: 'text-yellow-400' },
      { wrap: 'bg-green-500/20', text: 'text-green-400' },
      { wrap: 'bg-white/20', text: 'text-white' },
    ],
  },
};

export const southAfricaConfig = {
  key: 'south-africa',
  emoji: '🇿🇦',
  badgeLabel: 'POWERCITY INTERNATIONAL SOUTH AFRICA',
  imageAlt: 'Powercity International South Africa',
  regionParam: 'ZA',
  hero: {
    overlayGradient: 'from-green-900/80 via-primary-600/50 to-yellow-900/70',
    starsOverlay: false,
    subtitleKey: 'hero.subtitleSA',
    decorative: ['bg-green-600', 'bg-yellow-500', 'bg-white'],
    floating: ['bg-white', 'bg-green-400', 'bg-yellow-400'],
  },
  welcome: {
    badgeKey: 'welcome.badgeSA',
    headingKey: 'welcome.headingSA',
    subtitleKey: 'welcome.subtitleSA',
    decorative: ['bg-green-600', 'bg-yellow-500'],
  },
  presence: {
    image: homeCommunity,
    initial: 'GAUTENG',
    headingKey: 'presence.headingSA',
    subtitleKey: 'presence.subtitleSA',
    tabGradient: 'from-green-700 to-yellow-600',
    tabCodeReplace: true,
    imageOverlay: 'from-green-900/60',
    itemsLabelKey: 'presence.citiesLabel',
    itemsKey: 'cities',
    chipGradient: 'from-green-500/20 to-yellow-500/20',
    focusBullets: ['bg-green-400', 'bg-yellow-400', 'bg-white', 'bg-primary-400'],
    regions: [
      {
        code: 'GAUTENG',
        name: 'Gauteng',
        description: 'Our thriving campuses in the economic hub of South Africa, reaching Johannesburg, Pretoria and surrounding communities with the Gospel.',
        cities: ['Johannesburg', 'Pretoria', 'Soweto', 'Midrand'],
        highlight: 'Johannesburg Campus - Our flagship SA location',
      },
      {
        code: 'WESTERN_CAPE',
        name: 'Western Cape',
        description: 'Reaching communities in the beautiful Western Cape with the transforming power of Christ.',
        cities: ['Cape Town', 'Stellenbosch', 'George', 'Paarl'],
        highlight: 'Growing presence in the Cape',
      },
      {
        code: 'KWAZULU_NATAL',
        name: 'KwaZulu-Natal',
        description: 'Expanding ministry across the vibrant coastal province of KwaZulu-Natal.',
        cities: ['Durban', 'Pietermaritzburg', 'Richards Bay', 'Umhlanga'],
        highlight: 'New campuses launching soon',
      },
      {
        code: 'EASTERN_CAPE',
        name: 'Eastern Cape',
        description: 'Building faith communities across the Eastern Cape province.',
        cities: ['Port Elizabeth', 'East London', 'Mthatha', 'Grahamstown'],
        highlight: 'Community-focused ministry',
      },
    ],
  },
  atmosphere: {
    overlayGradient: 'from-green-900/80 via-primary-600/60 to-yellow-900/80',
    encounterKey: 'atmosphere.encounterSA',
    listIcons: [
      { wrap: 'bg-green-500/30', text: 'text-green-300' },
      { wrap: 'bg-yellow-500/30', text: 'text-yellow-300' },
      { wrap: 'bg-white/20', text: 'text-white' },
      { wrap: 'bg-primary-500/30', text: 'text-primary-300' },
    ],
    cardGradient: 'from-green-600 to-yellow-500',
    cardFloating: ['bg-green-500', 'bg-yellow-500'],
    bottomFloating: 'bg-yellow-400',
  },
  leadership: {
    imageOverlay: 'from-green-900/50',
    imageAlt: 'Powercity International South Africa Leadership',
    decorative: ['bg-green-600', 'bg-yellow-500'],
    headingKey: 'leadership.headingSA',
    descKey: 'leadership.descSA',
    visionBoxGradient: 'from-green-900/50 to-yellow-900/50',
    visionKey: 'leadership.visionSA',
    visionDescKey: 'leadership.visionDescSA',
    values: [
      { wrap: 'bg-green-500/20', text: 'text-green-400' },
      { wrap: 'bg-yellow-500/20', text: 'text-yellow-400' },
      { wrap: 'bg-primary-500/20', text: 'text-primary-400' },
      { wrap: 'bg-white/20', text: 'text-white' },
    ],
  },
};

export const regionHomeConfigs = {
  usa: usaConfig,
  uk: ukConfig,
  ghana: ghanaConfig,
  'south-africa': southAfricaConfig,
};

export default regionHomeConfigs;
