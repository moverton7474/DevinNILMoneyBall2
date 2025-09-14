import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export const formatCurrency = (value: string | number | Decimal): string => {
  let num: number;
  
  if (value instanceof Decimal) {
    num = value.toNumber();
  } else if (typeof value === 'string') {
    num = new Decimal(value).toNumber();
  } else {
    num = value;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

export const formatDecimal = (value: string | number | Decimal, decimals: number = 2): string => {
  if (value instanceof Decimal) {
    return value.toFixed(decimals);
  } else if (typeof value === 'string') {
    return new Decimal(value).toFixed(decimals);
  } else {
    return new Decimal(value).toFixed(decimals);
  }
};
