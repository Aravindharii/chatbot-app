import { google } from "googleapis";

const sheets = google.sheets("v4");

// Cache JWT client to avoid recreating on every request
let cachedJwtClient = null;
let jwtExpiry = 0;

function getJwtClient() {
  const now = Date.now();
  
  if (cachedJwtClient && now < jwtExpiry) {
    return cachedJwtClient;
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  
  if (!clientEmail || !privateKey) {
    throw new Error("Missing Google service account credentials");
  }

  cachedJwtClient = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  jwtExpiry = now + 55 * 60 * 1000;
  
  return cachedJwtClient;
}

// Cache sheet data with TTL
const cache = {
  data: null,
  structured: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000, // 5 minutes
};

// Fetch and structure sheet data
async function fetchSheetData(sheetId, auth) {
  const now = Date.now();
  
  if (cache.structured && now - cache.timestamp < cache.ttl) {
    console.log(`[googleSheets] Using cached data (age: ${Math.round((now - cache.timestamp) / 1000)}s)`);
    return cache.structured;
  }

  console.log(`[googleSheets] Fetching fresh data from sheet`);
  const range = "A:Z";
  
  const res = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId: sheetId,
    range,
  });

  const rows = res.data.values || [];
  
  if (rows.length === 0) {
    console.log(`[googleSheets] No data in sheet`);
    return [];
  }

  // Structure data with headers
  const headers = rows[0].map(h => String(h || "").trim());
  const dataRows = rows.slice(1).filter(row => row.some(cell => cell && String(cell).trim()));
  
  const structured = dataRows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = String(row[index] || "").trim();
    });
    return obj;
  });
  
  cache.data = rows;
  cache.structured = structured;
  cache.timestamp = now;
  
  console.log(`[googleSheets] ✅ Loaded ${structured.length} rows with columns: ${headers.join(', ')}`);
  
  return structured;
}

// Calculate relevance score
function calculateRelevance(row, queryTerms, filters = {}) {
  let score = 0;
  const rowText = Object.values(row).join(' ').toLowerCase();
  
  queryTerms.forEach(term => {
    if (term.length < 2) return;
    const regex = new RegExp(term, 'gi');
    const matches = (rowText.match(regex) || []).length;
    const weight = term.length > 4 ? 2 : 1;
    score += matches * weight;
  });
  
  const fullQuery = queryTerms.join(' ');
  if (rowText.includes(fullQuery)) {
    score += 10;
  }
  
  if (filters.category) {
    const categoryFields = ['Category', 'Type', 'Products', 'Specialization', 'Material'];
    categoryFields.forEach(field => {
      if (row[field] && row[field].toLowerCase().includes(filters.category.toLowerCase())) {
        score += 5;
      }
    });
  }
  
  if (filters.district) {
    const locationFields = ['District', 'Location', 'City', 'Address', 'Area'];
    locationFields.forEach(field => {
      if (row[field] && row[field].toLowerCase().includes(filters.district.toLowerCase())) {
        score += 5;
      }
    });
  }
  
  return score;
}

// Apply filters
function applyFilters(data, filters = {}) {
  let filtered = [...data];
  
  console.log(`[googleSheets] Applying filters:`, filters);
  
  if (filters.district) {
    filtered = filtered.filter(row => {
      const district = filters.district.toLowerCase();
      return (
        (row.District && row.District.toLowerCase().includes(district)) ||
        (row.Location && row.Location.toLowerCase().includes(district)) ||
        (row.City && row.City.toLowerCase().includes(district)) ||
        (row.Address && row.Address.toLowerCase().includes(district)) ||
        (row.Area && row.Area.toLowerCase().includes(district))
      );
    });
    console.log(`[googleSheets] After district filter: ${filtered.length} rows`);
  }
  
  if (filters.rating) {
    const minRating = parseFloat(filters.rating.replace(/[^\d.]/g, ''));
    filtered = filtered.filter(row => {
      const rating = parseFloat(row.Rating || row.Stars || row.rating || '0');
      return rating >= minRating;
    });
    console.log(`[googleSheets] After rating filter (${minRating}+): ${filtered.length} rows`);
  }
  
  if (filters.category) {
    filtered = filtered.filter(row => {
      const category = filters.category.toLowerCase();
      return (
        (row.Category && row.Category.toLowerCase().includes(category)) ||
        (row.Type && row.Type.toLowerCase().includes(category)) ||
        (row.Products && row.Products.toLowerCase().includes(category)) ||
        (row.Specialization && row.Specialization.toLowerCase().includes(category)) ||
        (row.Material && row.Material.toLowerCase().includes(category))
      );
    });
    console.log(`[googleSheets] After category filter: ${filtered.length} rows`);
  }
  
  if (filters.priceRange) {
    filtered = filtered.filter(row => {
      const priceRange = filters.priceRange.toLowerCase();
      return row.PriceRange && row.PriceRange.toLowerCase().includes(priceRange);
    });
    console.log(`[googleSheets] After price filter: ${filtered.length} rows`);
  }
  
  return filtered;
}

// Main search function
export async function findAnswerInSheet(question, requestId = null, filters = {}) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("GOOGLE_SHEET_ID not set");

  const startTime = Date.now();
  console.log(`[googleSheets] 🔍 Starting search`);
  console.log(`[googleSheets] Question: "${question}"`);
  console.log(`[googleSheets] Filters:`, filters);

  const auth = getJwtClient();
  
  if (!cachedJwtClient || Date.now() >= jwtExpiry) {
    await auth.authorize();
  }

  const allData = await fetchSheetData(sheetId, auth);
  
  if (allData.length === 0) {
    console.log(`[googleSheets] ❌ No data found in sheet`);
    return null;
  }

  // Apply filters first
  let filteredData = applyFilters(allData, filters);
  
  if (filteredData.length === 0) {
    console.log(`[googleSheets] ❌ No results after applying filters`);
    return null;
  }

  // Search within filtered results
  const qNorm = question.trim().toLowerCase();
  const queryTerms = qNorm.split(/\s+/).filter(term => term.length > 2);
  
  console.log(`[googleSheets] Query terms: ${queryTerms.join(', ')}`);

  // Score all filtered rows
  const scoredResults = filteredData.map(row => ({
    ...row,
    _relevanceScore: calculateRelevance(row, queryTerms, filters)
  }));

  // Filter out zero scores and sort
  const matchedResults = scoredResults
    .filter(row => row._relevanceScore > 0)
    .sort((a, b) => b._relevanceScore - a._relevanceScore);

  if (matchedResults.length === 0) {
    console.log(`[googleSheets] ❌ No matching results found`);
    return null;
  }

  // Remove score field
  const results = matchedResults.map(({ _relevanceScore, ...row }) => row);
  
  console.log(`[googleSheets] ✅ Found ${results.length} results in ${Date.now() - startTime}ms`);
  console.log(`[googleSheets] Top result:`, results[0]);

  return results.slice(0, 15); // Return up to 15 results
}

export function clearSheetCache() {
  cache.data = null;
  cache.structured = null;
  cache.timestamp = 0;
  console.log(`[googleSheets] Cache cleared`);
}

export async function warmupCache() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return;
  
  try {
    const auth = getJwtClient();
    await auth.authorize();
    await fetchSheetData(sheetId, auth);
    console.log(`[googleSheets] Cache warmed up successfully`);
  } catch (error) {
    console.error(`[googleSheets] Failed to warm up cache:`, error.message);
  }
}
