// --- DYNAMIC DATE UTILITY FOR FIFA ALL STARS ---
// Computes live dynamic dates from current browser/system time (new Date())

/**
 * Returns YYYY-MM-DD date string relative to today
 * @param {number} offsetDays - Days relative to today (+1 for tomorrow, -1 for yesterday)
 */
export const getTodayDate = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a YYYY-MM-DD or ISO date into human readable string (e.g. "Mon, Aug 31")
 */
export const formatDisplayDate = (dateString) => {
  if (!dateString) return 'Today';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

/**
 * Generates an array of date tabs dynamically from today onwards
 * @param {number} count - Number of consecutive days to generate
 */
export const generateDateTabs = (count = 10) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const tabs = [];

  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayName = days[d.getDay()];
    const dateNum = d.getDate();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const fullDate = `${year}-${month}-${day}`;

    let label = '';
    if (i === 0) label = `Today ${dateNum}`;
    else if (i === 1) label = `Tomorrow ${dateNum}`;
    else label = `${dayName} ${dateNum}`;

    tabs.push({
      label,
      val: fullDate,
      dayNum: dateNum,
      fullDate
    });
  }

  return tabs;
};
