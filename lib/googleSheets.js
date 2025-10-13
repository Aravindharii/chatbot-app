import { google } from "googleapis";

const sheets = google.sheets("v4");

// Cache JWT client to avoid recreating on every request
let cachedJwtClient = null;
let jwtExpiry = 0;

function getJwtClient() {
  const now = Date.now();
  
  // Reuse existing client if still valid (expires in 1 hour, refresh at 55 min)
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

  // Set expiry to 55 minutes from now (tokens last 1 hour)
  jwtExpiry = now + 55 * 60 * 1000;
  
  return cachedJwtClient;
}

// Cache sheet data with TTL
const cache = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000, // 5 minutes cache
};

async function fetchSheetData(sheetId, auth) {
  const now = Date.now();
  
  // Return cached data if still valid
  if (cache.data && now - cache.timestamp < cache.ttl) {
    console.log(`[googleSheets] Using cached data (age: ${Math.round((now - cache.timestamp) / 1000)}s)`);
    return cache.data;
  }

  console.log(`[googleSheets] Fetching fresh data from sheet`);
  const range = "A:Z";
  
  const res = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId: sheetId,
    range,
  });

  const rows = res.data.values || [];
  
  // Cache the processed data
  cache.data = rows;
  cache.timestamp = now;
  
  return rows;
}

// Precompute normalized data structure for faster searching
function buildSearchIndex(rows) {
  if (rows.length === 0) return [];

  const dataRows = rows.slice(1).filter(row => row.some(cell => cell && cell.trim()));
  
  return dataRows.map(row => ({
    original: row,
    normalized: row.map(cell => String(cell || "").trim().toLowerCase()),
    joined: row.join(" | ").toLowerCase(), // Pre-join for faster matching
  }));
}

export async function findAnswerInSheet(question, requestId = null) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("GOOGLE_SHEET_ID not set");

  const startTime = Date.now();
  console.log(`[googleSheets] Starting search for question: "${question.slice(0, 50)}..."`);

  const auth = getJwtClient();
  
  // Only authorize if not already authorized
  if (!cachedJwtClient || Date.now() >= jwtExpiry) {
    await auth.authorize();
  }

  const rows = await fetchSheetData(sheetId, auth);
  
  if (rows.length === 0) {
    console.log(`[googleSheets] No data found in sheet`);
    return null;
  }

  const searchIndex = buildSearchIndex(rows);
  console.log(`[googleSheets] Processing ${searchIndex.length} rows`);

  const qNorm = question.trim().toLowerCase();

  // Optimized search with early exit
  // 1. First pass: Exact cell match (fastest)
  for (const item of searchIndex) {
    for (let j = 0; j < item.normalized.length; j++) {
      if (item.normalized[j] === qNorm) {
        const result = item.original.join(" | ");
        console.log(`[googleSheets] ✓ Exact match found in ${Date.now() - startTime}ms`);
        console.log(`[googleSheets] Question: "${question}"`);
        console.log(`[googleSheets] Answer: "${result}"`);
        return result;
      }
    }
  }

  // 2. Second pass: Partial matches
  for (const item of searchIndex) {
    // Check if entire row contains the question
    if (item.joined.includes(qNorm)) {
      const result = item.original.join(" | ");
      console.log(`[googleSheets] ✓ Partial match found in ${Date.now() - startTime}ms`);
      console.log(`[googleSheets] Question: "${question}"`);
      console.log(`[googleSheets] Answer: "${result}"`);
      return result;
    }
    
    // Check if question contains any cell (reverse match)
    for (const cellNorm of item.normalized) {
      if (cellNorm && qNorm.includes(cellNorm) && cellNorm.length > 3) {
        const result = item.original.join(" | ");
        console.log(`[googleSheets] ✓ Reverse match found in ${Date.now() - startTime}ms`);
        console.log(`[googleSheets] Question: "${question}"`);
        console.log(`[googleSheets] Answer: "${result}"`);
        return result;
      }
    }
  }

  console.log(`[googleSheets] ✗ No matches found (searched in ${Date.now() - startTime}ms)`);
  console.log(`[googleSheets] Question: "${question}"`);
  return null;
}

// Optional: Function to manually clear cache if needed
export function clearSheetCache() {
  cache.data = null;
  cache.timestamp = 0;
  console.log(`[googleSheets] Cache cleared`);
}

// Optional: Function to warm up cache on server start
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