const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatINR(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return '₹0';
  return inrFormatter.format(amount);
}
