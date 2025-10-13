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
Provide clear, conversational, and helpful responses. If you're discussing specific products like cement, steel, paint, etc., 
be informative but don't invent specific supplier details unless you have concrete information.`;

    // Build conversation history
    const chatHistory = context.slice(-4).map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand. I'm CC Bot AI, ready to help with construction materials in Kerala." }] },
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
// 🧠 Combined Response Generator
// ==============================
async function generateCombinedResponse(sheetData, userQuestion, history = [], requestId) {
  const startTime = Date.now();
  console.log('🔄 Generating combined response:', { requestId });

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.3, // Lower temperature for more factual responses
        topP: 0.8,
        maxOutputTokens: 1024,
      },
    });

    const sheetDataText = Array.isArray(sheetData) 
      ? sheetData.map(item => 
          typeof item === 'string' ? item : JSON.stringify(item)
        ).join('\n\n')
      : String(sheetData);

    const prompt = `
USER QUESTION: "${userQuestion}"

DATABASE RESULTS:
${sheetDataText}

INSTRUCTIONS:
- Create a helpful, conversational response that incorporates the database results naturally
- If database results are specific suppliers/products, present them clearly
- Add relevant construction advice, tips, or additional information to complement the database results
- Keep the tone professional but friendly
- If database results are limited, acknowledge this and provide general guidance
- Focus on being helpful for construction materials in Kerala context

RESPONSE:`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log('✅ Combined response success:', { 
      requestId, 
      duration: Date.now() - startTime 
    });

    return response;
  } catch (error) {
    console.error('❌ Combined response error:', { requestId, error: error.message });
    // Fallback to simple concatenation if AI fails
    const sheetText = Array.isArray(sheetData) 
      ? sheetData.join('\n') 
      : String(sheetData);
    return `Based on our database:\n\n${sheetText}\n\nIs there anything specific about these options you'd like to know more about?`;
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
// 🚀 Main POST Handler
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
    const { question, history = [], useGemini = false, filters = {} } = BodySchema.parse(json);

    console.log('🔍 Processing request:', { 
      requestId, 
      question: question.substring(0, 50) + (question.length > 50 ? '...' : ''),
      useGemini,
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

    // Step 4: ALWAYS CHECK SHEETS FIRST (Priority: Database)
    console.log('🗄️ Checking sheet database first...');
    
    const searchQuery = buildFilteredQuery(question, combinedFilters);
    let sheetAnswer = null;
    
    try {
      sheetAnswer = await findAnswerInSheet(searchQuery, requestId);
      console.log('📋 Sheet results:', { 
        requestId, 
        hasResults: !!sheetAnswer,
        resultsCount: Array.isArray(sheetAnswer) ? sheetAnswer.length : 1
      });
      console.log('📋 Sheet results:', { 
  requestId, 
  hasResults: !!sheetAnswer,
  resultsCount: Array.isArray(sheetAnswer) ? sheetAnswer.length : 1
});
    } catch (sheetError) {
      console.error('❌ Sheet query failed:', sheetError);
      sheetAnswer = null;
    }

    // Step 5: DECISION LOGIC FOR RESPONSE STRATEGY
    let response;

    if (sheetAnswer && (!Array.isArray(sheetAnswer) || sheetAnswer.length > 0)) {
      // CASE 1: We have sheet data - combine with AI for intelligent response
      console.log('🔄 Combining sheet data with AI...');
      
      const combinedAnswer = await generateCombinedResponse(
        sheetAnswer, 
        question, 
        history, 
        requestId
      );
      
      response = {
        source: "combined",
        answer: combinedAnswer,
        rawSheetData: sheetAnswer,
        appliedFilters: combinedFilters,
        usedGemini: true,
      };
      
    } else if (useGemini) {
      // CASE 2: No sheet data but Gemini explicitly requested
      console.log('🤖 Using Gemini as requested (no sheet results)');
      
      const aiAnswer = await generateGeminiAnswer(searchQuery, history, requestId);
      response = {
        source: "gemini",
        answer: aiAnswer,
        appliedFilters: combinedFilters,
        usedGemini: true,
      };
      
    } else {
      // CASE 3: No sheet data - offer Gemini help
      console.log('❌ No results found in sheets');
      
      response = {
        source: "fallback",
        answer: "I couldn't find specific matches in our supplier database. Would you like me to provide general information and guidance about this using AI?",
        needsConfirmation: true,
        appliedFilters: combinedFilters,
      };
    }

    console.log('✅ Request completed:', {
      requestId,
      duration: Date.now() - startedAt,
      responseSource: response.source
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