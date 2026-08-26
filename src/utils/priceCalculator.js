/**
 * Dynamic booking price calculation based on peak hours and duration
 */
export const calculateBookingPrice = (court, startTimeStr, durationHours = 1, dateStr = '') => {
  if (!court) return { basePrice: 0, peakMultiplier: 1, total: 0, tax: 0, grandTotal: 0 };
  
  const startHour = parseInt(startTimeStr.split(':')[0], 10);
  const peakStart = parseInt((court.peakHoursStart || "18:00").split(':')[0], 10);
  const peakEnd = parseInt((court.peakHoursEnd || "22:00").split(':')[0], 10);
  
  const isPeak = startHour >= peakStart && startHour < peakEnd;
  const isWeekend = dateStr ? [0, 6].includes(new Date(dateStr).getDay()) : false;
  
  const hourlyRate = isPeak ? court.peakPricePerHour : court.basePricePerHour;
  const weekendMultiplier = isWeekend ? 1.15 : 1.0;
  
  const basePrice = Math.round(hourlyRate * durationHours * weekendMultiplier * 100) / 100;
  const serviceFee = 2.50; // standard platform fee
  const tax = Math.round(basePrice * 0.05 * 100) / 100; // 5% GST/Tax
  const grandTotal = Math.round((basePrice + serviceFee + tax) * 100) / 100;
  
  return {
    hourlyRate,
    isPeak,
    isWeekend,
    basePrice,
    serviceFee,
    tax,
    grandTotal
  };
};
