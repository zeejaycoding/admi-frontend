export const CURRENCIES = [
  {
    code: "USD",
    symbol: "$",
    displayName: "US Dollar",
  },
  {
    code: "GBP",
    symbol: "£",
    displayName: "British Pound Sterling",
  },
  {
    code: "NGN",
    symbol: "₦",
    displayName: "Nigerian Naira",
  },
  {
    code: "GHS",
    symbol: "₵",
    displayName: "Ghanaian Cedi",
  },
  {
    code: "ZAR",
    symbol: "R",
    displayName: "South African Rand",
  },
];

export const DEFAULT_CURRENCY = "USD";

export const getCurrencyByCode = (code) => {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
};

export const getCurrencySymbol = (code) => {
  return getCurrencyByCode(code).symbol;
};

export const formatAmount = (value, currencyCode) => {
  const symbol = getCurrencySymbol(currencyCode);
  const num = Number(value || 0);
  return `${symbol}${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
