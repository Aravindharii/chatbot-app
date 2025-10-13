const rawData = [
  " |  |  |  |  | Alappuzha | TMT | Building materials store | Kadakampally Agencies |  | 094477 73889 | P O, Kadakampally Agencies Charamangalam Muhamma, Alappuzha, Kerala 688525 | Alappuzha | Kanjikkuzhi | 688525 | 48 | 4.6 | 16196223968314042944"
];

function parseSuppliersHeuristicWithIcons(rawData) {
  if (!Array.isArray(rawData)) return [];

  return rawData.map((item, rowIndex) => {
    if (typeof item !== 'string') return item;

    console.log(`\n🧩 Parsing row ${rowIndex + 1}:`);
    const parts = item.split('|').map(p => p.trim());
    const parsed = {};

    parts.forEach((part, i) => {
      if (!part) return;

      console.log(`  🔹 Part[${i}]: "${part}"`);

      // 📍 PinCode: 6-digit number
      if (/^\d{6}$/.test(part)) {
        parsed.pinCode = part;
        console.log(`    📍 → Detected pinCode`);
      }

      // 🏠 Address: contains commas (check before name/brand)
      else if (/,/.test(part)) {
        parsed.address = part;
        console.log(`    🏠 → Detected address`);
      }

      // 📞 Phone: exactly 10 digits (ignore spaces)
      else if (/^\d{10}$/.test(part.replace(/\s/g, ''))) {
        parsed.phone = part;
        console.log(`    📞 → Detected phone`);
      }

      // ⭐ Rating: number between 0–5 (with decimal allowed)
      else if (!isNaN(parseFloat(part)) && parseFloat(part) >= 0 && parseFloat(part) <= 5) {
        parsed.rating = part;
        console.log(`    ⭐ → Detected rating`);
      }

      // 🧱 Category: TMT, materials, hardware, etc.
      else if (/(TMT|materials|construction|hardware)/i.test(part)) {
        parsed.category = part;
        console.log(`    🧱 → Detected category`);
      }

      // 🏷️ Name / Brand: contains keywords like Agencies, Store, Traders
      else if (/(agencies|store|traders|building)/i.test(part)) {
        parsed.name = parsed.name || part;
        parsed.brand = parsed.brand || part;
        console.log(`    🏷️ → Detected name/brand`);
      }

      // 🏙️ City / 🗺️ District: capitalized words (heuristic)
      else if (/^[A-Z][a-z]+/.test(part)) {
        if (!parsed.city) {
          parsed.city = part;
          console.log(`    🏙️ → Detected city`);
        } else if (!parsed.district) {
          parsed.district = part;
          console.log(`    🗺️ → Detected district`);
        }
      }

      // 🌐 Website: starts with http or https
      else if (/^https?:\/\//i.test(part)) {
        parsed.website = part;
        console.log(`    🌐 → Detected website`);
      }
    });

    // 🧩 Fallback defaults
    parsed.name = parsed.name || 'Unknown';
    parsed.brand = parsed.brand || parsed.name;
    parsed.district = parsed.district || '';
    parsed.category = parsed.category || '';
    parsed.address = parsed.address || '';
    parsed.city = parsed.city || '';
    parsed.pinCode = parsed.pinCode || '';
    parsed.phone = parsed.phone || '';
    parsed.rating = parsed.rating || '';

    console.log('✅ Parsed object:', parsed);
    return parsed;
  });
}

// ▶️ Run parser with icons
const parsedSuppliers = parseSuppliersHeuristicWithIcons(rawData);
