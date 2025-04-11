/**
 * Format a balance with commas and decimal places
 * @param balance The balance to format
 * @returns The formatted balance string
 */
export function formatBalance(balance: string | number): string {
  const number = typeof balance === 'string' ? parseFloat(balance) : balance;
  if (isNaN(number)) return '0';
  
  // Format with commas for thousands and 7 decimal places max (Stellar's precision)
  return number.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 7
  });
}

/**
 * Format an address to show only the first and last few characters
 * @param address The address to format
 * @param start Number of characters to show at the start
 * @param end Number of characters to show at the end
 * @returns The formatted address string
 */
export function formatAddress(address: string, start: number = 4, end: number = 4): string {
  if (!address) return '';
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

/**
 * Format a date to a readable string
 * @param date The date to format
 * @returns The formatted date string
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
} 