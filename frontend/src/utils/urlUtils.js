export const ensureHttps = (url) => {
  // Return null for null/undefined/empty values
  if (!url) return null;
  
  // Convert to string if it's not already
  const urlString = String(url).trim();
  
  // Return null for empty strings
  if (!urlString) return null;
  
  // If it's already an HTTPS URL, return as is
  if (urlString.startsWith('https://')) return urlString;
  
  // If it's an HTTP URL, convert to HTTPS
  if (urlString.startsWith('http://')) {
    return urlString.replace('http://', 'https://');
  }
  
  // If it's a relative URL or missing protocol, add HTTPS
  if (!urlString.startsWith('http')) {
    return `https://${urlString}`;
  }
  
  return urlString;
}; 