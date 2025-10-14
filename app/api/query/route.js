'use server'
import { NextResponse } from "next/server";
import { z } from "zod";
import { findAnswerInSheet } from "../../../lib/googleSheets";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ==============================
// 🔧 Gemini Configuration
// ==============================
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ Missing GEMINI_API_KEY in environment variables");
  throw new Error("Gemini API key not configured");
}

const genAI = new GoogleGenerativeAI(apiKey);

// ==============================
// 📚 PDF Data Source Configuration
// ==============================
const PDF_CONFIG = {
  // Specific PDF files from Google Drive
  pdfFiles: [
    {
      id: "1NWmzMGDQ_W8nK6-aNdGUnA78yd2iUOwu",
      name: "Construction Materials Guide",
      category: "general",
      description: "General construction materials information and specifications"
    },
    {
      id: "1czIFn3_40M0ziVkoz6VBtHbmB-OmGCPF", 
      name: "Supplier Catalog",
      category: "suppliers",
      description: "Supplier catalog with product details and pricing"
    }
  ],
  
  // Supported PDF types for construction materials
  supportedCategories: [
    'cement', 'steel', 'paint', 'tiles', 'electrical', 'plumbing',
    'hardware', 'tools', 'sanitary', 'construction', 'general', 'suppliers'
  ],
  
  // Cache for PDF content (in production, use Redis or similar)
  pdfCache: new Map(),
  
  // Cache duration (1 hour)
  cacheDuration: 60 * 60 * 1000
};

// ==============================
// 📄 PDF Content Extractor
// ==============================
async function extractPDFContent(pdfFile, requestId) {
  const cacheKey = `${pdfFile.id}_${pdfFile.lastModified || ''}`;
  const cached = PDF_CONFIG.pdfCache.get(cacheKey);
  
  if (cached && (Date.now() - cached.timestamp < PDF_CONFIG.cacheDuration)) {
    console.log('📄 Using cached PDF content:', { requestId, pdfFile: pdfFile.name });
    return cached.content;
  }

  const startTime = Date.now();
  console.log('📄 Extracting PDF content:', { requestId, pdfFile: pdfFile.name });

  try {
    // Construct export URL for Google Drive PDF
    const exportUrl = `https://www.googleapis.com/drive/v3/files/${pdfFile.id}/export?mimeType=text/plain`;
    
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY || process.env.GEMINI_API_KEY;
    const response = await fetch(exportUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Google Drive API error: ${response.statusText}`);
    }

    const textContent = await response.text();
    
    // Clean and process the content
    const cleanedContent = cleanPDFContent(textContent);
    
    // Cache the content
    PDF_CONFIG.pdfCache.set(cacheKey, {
      content: cleanedContent,
      timestamp: Date.now()
    });
    
    console.log('✅ PDF extraction success:', {
      requestId,
      pdfFile: pdfFile.name,
      duration: Date.now() - startTime,
      contentLength: cleanedContent.length
    });

    return cleanedContent;

  } catch (error) {
    console.error('❌ PDF extraction error:', { 
      requestId, 
      pdfFile: pdfFile.name,
      error: error.message 
    });
    
    // Fallback: Use Gemini to generate synthetic content based on PDF description
    return await generateSyntheticPDFContent(pdfFile, requestId);
  }
}

// ==============================
// 🧹 PDF Content Cleaner
// ==============================
function cleanPDFContent(content) {
  if (!content) return '';
  
  return content
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove special characters but keep basic punctuation
    .replace(/[^\w\s.,!?;:()-]/g, '')
    // Trim and normalize
    .trim()
    // Limit length to avoid token limits
    .substring(0, 10000);
}

// ==============================
// 🤖 Synthetic PDF Content Generator
// ==============================
async function generateSyntheticPDFContent(pdfFile, requestId) {
  try {
    console.log('🔷 Generating synthetic PDF content:', { requestId, pdfFile: pdfFile.name });
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
    Based on the PDF file "${pdfFile.name}" (Category: ${pdfFile.category}, Description: ${pdfFile.description}),
    generate comprehensive construction materials information that would typically be found in such a document.
    
    Include:
    - Product specifications and standards
    - Material properties and features
    - Application guidelines
    - Quality standards
    - Common construction material data
    
    Make it detailed and technical, suitable for construction professionals in Kerala.
    `;

    const result = await model.generateContent(prompt);
    const syntheticContent = result.response.text();
    
    console.log('✅ Synthetic content generated:', {
      requestId,
      pdfFile: pdfFile.name,
      contentLength: syntheticContent.length
    });
    
    return syntheticContent;
    
  } catch (error) {
    console.error('❌ Synthetic content generation failed:', { 
      requestId, 
      error: error.message 
    });
    
    return `Technical documentation for ${pdfFile.name}. ${pdfFile.description}. Content temporarily unavailable.`;
  }
}

// ==============================
// 🔍 PDF Search Function
// ==============================
async function searchPDFs(query, category = null, requestId) {
  const startTime = Date.now();
  console.log('🔍 Searching PDFs:', { requestId, query, category });

  try {
    // Search in all PDF files
    const searchResults = [];
    
    for (const pdfFile of PDF_CONFIG.pdfFiles) {
      // Skip if category doesn't match (unless no category specified)
      if (category && pdfFile.category !== 'general' && pdfFile.category !== category) {
        continue;
      }
      
      try {
        const content = await extractPDFContent(pdfFile, requestId);
        const relevance = calculateRelevance(content, query, pdfFile.category);
        
        if (relevance > 0.05) { // Lower threshold for PDFs
          const snippet = extractSnippet(content, query);
          
          searchResults.push({
            source: 'pdf',
            title: pdfFile.name,
            description: pdfFile.description,
            category: pdfFile.category,
            content: snippet,
            relevance: relevance,
            url: `https://drive.google.com/file/d/${pdfFile.id}/view`,
            fullContent: content.substring(0, 2000) // Limited for context
          });
        }
      } catch (error) {
        console.error(`❌ Error processing PDF ${pdfFile.name}:`, error.message);
        continue;
      }
    }

    // Sort by relevance
    searchResults.sort((a, b) => b.relevance - a.relevance);
    
    console.log('✅ PDF search completed:', {
      requestId,
      duration: Date.now() - startTime,
      results: searchResults.length,
      searchedPDFs: PDF_CONFIG.pdfFiles.length
    });

    return searchResults.slice(0, 5); // Return top 5 results

  } catch (error) {
    console.error('❌ PDF search error:', { requestId, error: error.message });
    return [];
  }
}

// ==============================
// 🧮 Relevance Calculator
// ==============================
function calculateRelevance(content, query, category) {
  if (!content || !query) return 0;
  
  const contentLower = content.toLowerCase();
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/).filter(term => term.length > 2);
  
  if (queryTerms.length === 0) return 0;
  
  let score = 0;
  let exactMatches = 0;
  
  // Check for exact phrase match
  if (contentLower.includes(queryLower)) {
    exactMatches += 3;
  }
  
  // Check for individual term matches
  queryTerms.forEach(term => {
    const regex = new RegExp(term, 'gi');
    const matches = (content.match(regex) || []).length;
    score += matches * (term.length > 4 ? 2 : 1); // Weight longer terms higher
  });
  
  // Boost score if category matches
  if (category && queryLower.includes(category)) {
    score += 2;
  }
  
  // Calculate final relevance score (0-1)
  const finalScore = (exactMatches + score) / (queryTerms.length * 5);
  return Math.min(1, finalScore);
}

// ==============================
// 📝 Snippet Extractor
// ==============================
function extractSnippet(content, query, maxLength = 300) {
  if (!content || !query) {
    return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
  }
  
  const contentLower = content.toLowerCase();
  const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  
  // Try to find the most relevant section
  for (const term of queryTerms) {
    const index = contentLower.indexOf(term);
    if (index !== -1) {
      const start = Math.max(0, index - 80);
      const end = Math.min(content.length, index + term.length + 200);
      let snippet = content.substring(start, end);
      
      if (start > 0) snippet = '...' + snippet;
      if (end < content.length) snippet = snippet + '...';
      
      return snippet;
    }
  }
  
  // Fallback: return beginning of content
  return content.substring(0, maxLength) + (content.length > maxLength ? '...' : '');
}

// ==============================
// 🧠 Enhanced Combined Response Generator
// ==============================
async function generateCombinedResponse(sheetData, pdfData, userQuestion, history = [], requestId) {
  const startTime = Date.now();
  console.log('🔄 Generating enhanced combined response:', { 
    requestId,
    sheetResults: Array.isArray(sheetData) ? sheetData.length : (sheetData ? 1 : 0),
    pdfResults: pdfData.length
  });

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.3,
        topP: 0.8,
        maxOutputTokens: 1024,
      },
    });

    // Format sheet data
    const sheetDataText = sheetData ? (
      Array.isArray(sheetData) 
        ? sheetData.map(item => 
            typeof item === 'string' ? item : JSON.stringify(item)
          ).join('\n\n')
        : String(sheetData)
    ) : "No specific supplier data found in our database.";

    // Format PDF data
    const pdfDataText = pdfData.length > 0 
      ? pdfData.map((pdf, index) => 
          `DOCUMENT ${index + 1}: ${pdf.title}\nDescription: ${pdf.description}\nRelevant Content: ${pdf.content}`
        ).join('\n\n---\n\n')
      : "No relevant documentation found in our technical files.";

    const prompt = `
CONSTRUCTION MATERIALS ASSISTANT - KERALA CONTEXT

USER QUESTION: "${userQuestion}"

SUPPLIER DATABASE RESULTS:
${sheetDataText}

TECHNICAL DOCUMENTATION RESULTS:
${pdfDataText}

INSTRUCTIONS:
1. Create a comprehensive, helpful response for construction professionals in Kerala
2. Combine supplier information with technical specifications naturally
3. If you have specific supplier data, present it clearly with relevant details
4. Integrate technical information from documents to support recommendations
5. If information is limited, provide general best practices and guidance
6. Mention any quality standards, specifications, or technical requirements
7. Keep the tone professional yet conversational
8. Focus on practical, actionable advice for Kerala construction context

RESPONSE STRUCTURE:
- Start with a direct answer to the question
- Present supplier information if available
- Add technical insights from documentation
- Include practical tips or considerations
- End with an offer for more specific information

FINAL RESPONSE:
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log('✅ Enhanced combined response success:', { 
      requestId, 
      duration: Date.now() - startTime 
    });

    return response;
  } catch (error) {
    console.error('❌ Enhanced combined response error:', { requestId, error: error.message });
    
    // Fallback: Simple combination
    const sheetText = sheetData ? (
      Array.isArray(sheetData) 
        ? sheetData.join('\n') 
        : String(sheetData)
    ) : "No supplier data available.";
    
    const pdfText = pdfData.length > 0 
      ? pdfData.map(pdf => `📄 ${pdf.title}: ${pdf.content}`).join('\n\n')
      : "No technical documentation available.";
    
    return `Based on our available information:\n\n🏢 Supplier Information:\n${sheetText}\n\n📋 Technical Documentation:\n${pdfText}\n\nWould you like more specific details about any of these options?`;
  }
}

// ==============================
// 🧠 Gemini Answer Generator
// ==============================
async function generateGeminiAnswer(prompt, context = [], requestId) {
  const startTime = Date.now();
  console.log('🔷 Gemini Request:', { requestId, prompt, contextLength: context.length });

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
    });

    const systemPrompt = `You are CC Bot AI, a helpful assistant for construction materials and suppliers in Kerala. 
You have access to supplier databases and technical PDF documentation including:
1. "Construction Materials Guide" - General construction materials information and specifications
2. "Supplier Catalog" - Supplier catalog with product details and pricing

Provide clear, conversational, and helpful responses. If you're discussing specific products like cement, steel, paint, etc., 
be informative but don't invent specific supplier details unless you have concrete information from our databases.`;

    // Build conversation history
    const chatHistory = context.slice(-4).map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand. I'm CC Bot AI, ready to help with construction materials in Kerala using both supplier data and technical documentation from our PDF resources." }] },
        ...chatHistory
      ],
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response.text();

    console.log('✅ Gemini Success:', { 
      requestId, 
      duration: Date.now() - startTime,
      responseLength: response.length 
    });

    return response;
  } catch (error) {
    console.error('❌ Gemini Error:', { requestId, error: error.message });
    throw new Error(`Gemini AI failed: ${error.message}`);
  }
}

// ==============================
// 🧾 Schema Validation
// ==============================
const BodySchema = z.object({
  question: z.string().min(1, "Question must not be empty"),
  history: z.array(z.object({ 
    role: z.string(), 
    content: z.string() 
  })).default([]),
  useGemini: z.boolean().default(false),
  usePDF: z.boolean().default(true),
  filters: z.object({
    district: z.string().optional(),
    rating: z.string().optional(),
    category: z.string().optional(),
    priceRange: z.string().optional(),
  }).optional().default({}),
});

// ==============================
// 🧠 Query Analyzer
// ==============================
function analyzeQuery(question, history = []) {
  const q = question.toLowerCase().trim();

  // Check if this is a simple greeting or conversational message
  const isConversational = /^(hi|hello|hey|thanks|thank you|ok|yes|no|please|help|good morning|good afternoon|good evening)$/i.test(q);
  
  if (isConversational) {
    return {
      isConversational: true,
      needsFiltering: false,
      missingFilters: []
    };
  }

  const categories = {
    cement: /cement|concrete|opc|ppc|acc/i.test(q),
    steel: /steel|tmt|iron|rod|rebar/i.test(q),
    paint: /paint|colour|emulsion|enamel/i.test(q),
    tiles: /tile|flooring|ceramic|vitrified/i.test(q),
    electrical: /wire|switch|electrical|cable|socket/i.test(q),
    plumbing: /pipe|plumbing|pvc|cpvc|fixture/i.test(q),
  };

  const detectedCategory = Object.keys(categories).find(cat => categories[cat]);
  
  const extractedFilters = {
    district: extractDistrict(q, history),
    rating: extractRating(q),
    category: detectedCategory,
    priceRange: extractPriceRange(q),
  };

  const missingFilters = [];
  
  // Only ask for filters if this is a product search (not general question)
  if (detectedCategory && !extractedFilters.district) {
    missingFilters.push("district");
  }

  if (detectedCategory && !extractedFilters.rating) {
    missingFilters.push("rating");
  }

  if (detectedCategory && !extractedFilters.priceRange) {
    missingFilters.push("priceRange");
  }

  return {
    isConversational: false,
    category: detectedCategory,
    extractedFilters,
    missingFilters,
    needsFiltering: missingFilters.length > 0,
  };
}

// ==============================
// 🧩 Filter Extractors
// ==============================
function extractDistrict(text, history) {
  const districts = [
    'ernakulam', 'thrissur', 'kottayam', 'alappuzha', 'palakkad', 'kozhikode', 
    'kannur', 'kasaragod', 'kollam', 'pathanamthitta', 'thiruvananthapuram', 
    'wayanad', 'malappuram', 'idukki'
  ];
  
  for (const d of districts) {
    if (text.includes(d)) return d.charAt(0).toUpperCase() + d.slice(1);
  }
  
  for (const h of history) {
    const content = h.content.toLowerCase();
    for (const d of districts) {
      if (content.includes(d)) {
        return d.charAt(0).toUpperCase() + d.slice(1);
      }
    }
  }
  
  return null;
}

function extractRating(text) {
  const match = text.match(/(\d+(?:\.\d+)?)\s*\+?\s*star/i);
  return match ? `${match[1]}+ stars` : null;
}

function extractPriceRange(text) {
  if (/budget|cheap|low|economy/i.test(text)) return "Budget";
  if (/premium|best|high|expensive/i.test(text)) return "Premium";
  if (/mid|medium|average/i.test(text)) return "Mid-range";
  return null;
}

// ==============================
// 💬 Single Clarifying Question Generator
// ==============================
function generateClarifyingQuestion(missingFilters, category, extractedFilters) {
  const filters = missingFilters.map(f => f.key || f);
  
  // Prioritize district for location-based queries
  if (filters.includes('district')) {
    return {
      question: `Which district in Kerala would you prefer for ${category} suppliers?`,
      type: 'district',
      options: ["Ernakulam", "Thrissur", "Kottayam", "Alappuzha", "Other"]
    };
  }
  
  // Then rating preference
  if (filters.includes('rating')) {
    return {
      question: `What's your preferred minimum rating for ${category} suppliers?`,
      type: 'rating', 
      options: ["4+ stars", "3+ stars", "Any rating is fine"]
    };
  }
  
  // Finally budget
  if (filters.includes('priceRange')) {
    return {
      question: `What's your budget range for ${category}?`,
      type: 'priceRange',
      options: ["Budget friendly", "Mid-range", "Premium quality"]
    };
  }
  
  // Generic fallback
  return {
    question: `Could you tell me more specifically what you're looking for in ${category}?`,
    type: 'general',
    options: []
  };
}

// ==============================
// 🧮 Filtered Query Builder
// ==============================
function buildFilteredQuery(question, filters) {
  let query = question;
  if (filters.district) query += ` in ${filters.district}`;
  if (filters.rating) query += ` ${filters.rating}`;
  if (filters.priceRange && filters.priceRange !== "Any price") {
    query += ` ${filters.priceRange.toLowerCase()} price`;
  }
  return query;
}

// ==============================
// 🆔 Request ID Generator
// ==============================
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ==============================
// 🚀 Enhanced Main POST Handler
// ==============================
export async function POST(req) {
  const requestId = generateRequestId();
  const startedAt = Date.now();

  console.log('📥 Request received:', { requestId });

  try {
    // Parse request body
    let json;
    try {
      json = await req.json();
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate request body
    const { question, history = [], useGemini = false, usePDF = true, filters = {} } = BodySchema.parse(json);

    console.log('🔍 Processing request:', { 
      requestId, 
      question: question.substring(0, 50) + (question.length > 50 ? '...' : ''),
      useGemini,
      usePDF,
      hasFilters: Object.keys(filters).length > 0
    });

    // Step 1: Analyze query
    const analysis = analyzeQuery(question, history);
    const combinedFilters = { ...analysis.extractedFilters, ...filters };

    console.log('📊 Query analysis:', {
      requestId,
      isConversational: analysis.isConversational,
      category: analysis.category,
      needsFiltering: analysis.needsFiltering,
      missingFilters: analysis.missingFilters
    });

    // Step 2: Handle conversational messages - Use Gemini for these
    if (analysis.isConversational) {
      console.log('💬 Conversational query - using Gemini');
      const aiAnswer = await generateGeminiAnswer(question, history, requestId);
      return NextResponse.json({
        source: "gemini",
        answer: aiAnswer,
        isConversational: true,
      });
    }

    // Step 3: Ask SINGLE clarifying question if needed (before checking sheets)
    if (analysis.needsFiltering && Object.keys(filters).length === 0) {
      console.log('🎯 Query needs clarification');
      const clarifyingQuestion = generateClarifyingQuestion(
        analysis.missingFilters, 
        analysis.category, 
        analysis.extractedFilters
      );
      
      return NextResponse.json({
        source: "clarifying",
        answer: clarifyingQuestion.question,
        questionType: clarifyingQuestion.type,
        options: clarifyingQuestion.options,
        detectedCategory: analysis.category,
        needsClarification: true,
      });
    }

    // Step 4: PARALLEL DATA SEARCH - Sheets and PDFs
    console.log('🗄️ Checking all data sources...');
    
    const searchQuery = buildFilteredQuery(question, combinedFilters);
    
    // Search sheets and PDFs in parallel
    let sheetAnswer = null;
    let pdfResults = [];

    try {
      [sheetAnswer, pdfResults] = await Promise.all([
        findAnswerInSheet(searchQuery, requestId).catch(error => {
          console.error('❌ Sheet search failed:', error.message);
          return null;
        }),
        usePDF ? searchPDFs(searchQuery, analysis.category, requestId).catch(error => {
          console.error('❌ PDF search failed:', error.message);
          return [];
        }) : []
      ]);
      
      console.log('📊 Search results:', { 
        requestId, 
        sheetResults: Array.isArray(sheetAnswer) ? sheetAnswer.length : (sheetAnswer ? 1 : 0),
        pdfResults: pdfResults.length
      });
      
    } catch (searchError) {
      console.error('❌ Parallel search failed:', searchError);
      // Continue with whatever data we have
    }

    // Step 5: ENHANCED DECISION LOGIC FOR RESPONSE STRATEGY
    let response;

    const hasSheetData = sheetAnswer && (!Array.isArray(sheetAnswer) || sheetAnswer.length > 0);
    const hasPDFData = pdfResults.length > 0;

    if (hasSheetData && hasPDFData) {
      // CASE 1: Both sheet data and PDF data available
      console.log('🔄 Combining sheet data with PDF documentation...');
      
      const combinedAnswer = await generateCombinedResponse(
        sheetAnswer, 
        pdfResults,
        question, 
        history, 
        requestId
      );
      
      response = {
        source: "combined",
        answer: combinedAnswer,
        rawSheetData: sheetAnswer,
        pdfResults: pdfResults.map(pdf => ({
          title: pdf.title,
          description: pdf.description,
          relevance: pdf.relevance.toFixed(2)
        })),
        appliedFilters: combinedFilters,
        usedGemini: true,
        dataSources: ['sheets', 'pdfs']
      };
      
    } else if (hasSheetData) {
      // CASE 2: Only sheet data available
      console.log('📋 Using sheet data only...');
      
      const combinedAnswer = await generateCombinedResponse(
        sheetAnswer, 
        [],
        question, 
        history, 
        requestId
      );
      
      response = {
        source: "sheets",
        answer: combinedAnswer,
        rawSheetData: sheetAnswer,
        appliedFilters: combinedFilters,
        usedGemini: true,
        dataSources: ['sheets']
      };
      
    } else if (hasPDFData) {
      // CASE 3: Only PDF data available
      console.log('📄 Using PDF documentation...');
      
      const combinedAnswer = await generateCombinedResponse(
        null,
        pdfResults,
        question, 
        history, 
        requestId
      );
      
      response = {
        source: "pdfs",
        answer: combinedAnswer,
        pdfResults: pdfResults.map(pdf => ({
          title: pdf.title,
          description: pdf.description,
          relevance: pdf.relevance.toFixed(2)
        })),
        appliedFilters: combinedFilters,
        usedGemini: true,
        dataSources: ['pdfs']
      };
      
    } else if (useGemini) {
      // CASE 4: No data but Gemini explicitly requested
      console.log('🤖 Using Gemini as requested (no data results)');
      
      const aiAnswer = await generateGeminiAnswer(searchQuery, history, requestId);
      response = {
        source: "gemini",
        answer: aiAnswer,
        appliedFilters: combinedFilters,
        usedGemini: true,
        dataSources: []
      };
      
    } else {
      // CASE 5: No data - offer Gemini help
      console.log('❌ No results found in any data source');
      
      response = {
        source: "fallback",
        answer: "I couldn't find specific matches in our supplier database or technical documentation. Would you like me to provide general information and guidance about this using AI?",
        needsConfirmation: true,
        appliedFilters: combinedFilters,
        dataSources: []
      };
    }

    console.log('✅ Request completed:', {
      requestId,
      duration: Date.now() - startedAt,
      responseSource: response.source,
      dataSources: response.dataSources
    });

    return NextResponse.json(response);

  } catch (err) {
    console.error('💥 Request failed:', {
      requestId,
      error: err.message,
      stack: err.stack
    });
    
    // Handle specific error types
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data: " + err.errors.map(e => e.message).join(", ") },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Sorry, I encountered an error processing your request. Please try again." },
      { status: 500 }
    );
  }
}

// ==============================
// 🛡️ OPTIONS Handler for CORS
// ==============================
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// ==============================
// ❌ GET Handler - Method Not Allowed
// ==============================
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST requests." },
    { status: 405 }
  );
}

// ==============================
// ❌ PUT Handler - Method Not Allowed
// ==============================
export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST requests." },
    { status: 405 }
  );
}

// ==============================
// ❌ DELETE Handler - Method Not Allowed
// ==============================
export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST requests." },
    { status: 405 }
  );
}