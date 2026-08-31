export const detectRegionFromSubdomain = () => {
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];

  const subdomainMap = {
    'pciusa': 'US',
    'pciuk': 'UK',
    'pcisafrica': 'ZA',
    'pcighana': 'GH',
    'admi': 'NG',      
    'localhost': 'NG' // Default for development
  };

  return subdomainMap[subdomain.toLowerCase()] || 'NG';
};

export const isMainDomain = () => {
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];

  return subdomain === 'admi' || subdomain === 'localhost' || hostname === 'localhost:3000';
};


export const getBrandName = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlRegion = urlParams.get('region');

  if (urlRegion) {
    return 'PowerCity International';
  }

  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];

  // PowerCity subdomains (removed 'pcingeria')
  const powercitySubdomains = ['pciusa', 'pciuk', 'pcisafrica', 'pcighana'];

  if (powercitySubdomains.includes(subdomain)) {
    return 'PowerCity International';
  }

  return 'Abel Damina Ministries International (ADMI)';
};


export const getRegionConfig = (regionCode) => {
  const configs = {
    'US': {
      code: 'US',
      name: 'USA',
      currency: 'USD',
      symbol: '$',
      flag: '🇺🇸',
      subdomain: 'pciusa'
    },
    'UK': {
      code: 'UK',
      name: 'UK',
      currency: 'USD',
      symbol: '$',
      flag: '🇬🇧',
      subdomain: 'pciuk'
    },
    'ZA': {
      code: 'ZA',
      name: 'South Africa',
      currency: 'USD',
      symbol: '$',
      flag: '🇿🇦',
      subdomain: 'pcisafrica'
    },
    'GH': {
      code: 'GH',
      name: 'Ghana',
      currency: 'NGN',
      symbol: '₦',
      flag: '🇬🇭',
      subdomain: 'pcighana'
    },
    'NG': {
      code: 'NG',
      name: 'Nigeria',
      currency: 'NGN',
      symbol: '₦',
      flag: '🌍',
      subdomain: 'admi'
    }
  };

  return configs[regionCode] || configs['NG'];
};

export const buildSubdomainUrl = (regionCode, path = '') => {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'drabeldamina.org'
    : 'localhost:3000';

  const regionConfig = getRegionConfig(regionCode);
  const subdomain = regionConfig.subdomain;

  return `https://${subdomain}.${baseUrl}${path}`;
};

export const shouldShowComingSoon = () => {
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];

  // Coming Soon regions: USA, UK, South Africa, Ghana
  const comingSoonSubdomains = ['pciusa', 'pciuk', 'pcisafrica', 'pcighana'];

  return comingSoonSubdomains.includes(subdomain.toLowerCase());
};

export const getRegionSpecificHomePage = () => {
  // First check URL parameter (for development)
  const urlParams = new URLSearchParams(window.location.search);
  const urlRegion = urlParams.get('region');

  if (urlRegion) {
    const regionMap = {
      'US': 'USA',
      'UK': 'UK',
      'ZA': 'SouthAfrica',
      'GH': 'Ghana',
      'NG': 'Nigeria'
    };
    return regionMap[urlRegion] || 'Nigeria';
  }

  // If no URL parameter, default to Nigeria (Global)
  // This handles localhost:3000 without parameters
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];

  if (subdomain === 'localhost' || subdomain === 'admi') {
    return 'Nigeria';
  }

  // Then check subdomain (for production)
  const subdomainToRegionMap = {
    'pciusa': 'USA',
    'pciuk': 'UK',
    'pcisafrica': 'SouthAfrica',
    'pcighana': 'Ghana'
    // ✅ Removed 'pcingeria' - Nigeria uses 'admi' (handled above)
  };

  return subdomainToRegionMap[subdomain.toLowerCase()] || 'Nigeria';
};