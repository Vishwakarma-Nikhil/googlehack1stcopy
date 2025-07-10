import { format } from 'date-fns';

// Format date to YYYY-MM-DD string
export const formatDate = (date) => {
  return format(date, 'yyyy-MM-dd');
};

// Simple function to increment date by days
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Parse date from string
export const parseDate = (text) => {
  try {
    // Better date parsing
    const parts = text.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
      const day = parseInt(parts[2]);
      
      const newDate = new Date(year, month, day);
      if (!isNaN(newDate.getTime())) {
        return newDate;
      }
    }
    return null;
  } catch (error) {
    console.log("Date parsing error:", error);
    return null;
  }
};
