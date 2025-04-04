
// Format currency values (e.g. $10.00)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount / 100);
};

// Format dates (e.g. Mar 15, 2024)
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
};

// Format student number for display
export const formatStudentNumber = (studentNumber: string): string => {
  return studentNumber || 'N/A';
};

// Format percentage (e.g. 75%)
export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};
