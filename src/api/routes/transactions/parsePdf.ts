import { Request, Response, Router } from "express";
import dotenv from "dotenv";
import multer from "multer";
import { sendRes } from "../../../../types/response";
const { Translate } = require("@google-cloud/translate").v2;
const { PrismaClient } = require("@prisma/client");
const pdf = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const prisma = new PrismaClient();

dotenv.config();
const router = Router();

// Initialize AI services
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const geminiFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Initialize Google Translate
const translate = new Translate({
  key: process.env.GOOGLE_API_KEY,
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export const getPdfData = router.post(
  "/transactions/upload",
  upload.single("file"),
  async (req: any, res: Response) => {
    try {
      if (!req?.file) {
        return sendRes({
          success: false,
          res: res,
          code: 400,
          message: "No PDF file uploaded",
          data: null,
        });
      }

      // Extract text from PDF
      const pdfText = await extractTextFromPdf(req.file.buffer);

      // Use AI to clean and structure the raw text
      const cleanedText = await cleanTextWithAI(pdfText);

      // Parse transactions with AI assistance
      const transactions = await parseTransactionsWithAI(cleanedText);

      // Translate only specific fields that need translation
      const processedTransactions = await processTransactions(transactions);

      console.log("processed transaction", processedTransactions);

      // Store in database
      //   const createdTransactions = await prisma.transaction.createMany({
      //     data: processedTransactions,
      //     skipDuplicates: true,
      //   });

      return sendRes({
        success: true,
        res: res,
        code: 200,
        message: "PDF processed successfully",
        data: {
          //   count: createdTransactions.count,å
          sample: processedTransactions.slice(0, 3), // Return first 3 for preview
        },
      });
    } catch (error) {
      console.error(error);
      return sendRes({
        res: res,
        code: 500,
        data: null,
        message: error.message || "An error occurred while processing the PDF",
      });
    }
  }
);

// Helper functions
async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  const data = await pdf(pdfBuffer);
  return data.text;
}

async function translateText(text: string): Promise<string> {
  if (!text.trim()) return text;
  const [translation] = await translate.translate(text, "en");
  return translation;
}

async function cleanTextWithAI(text: string): Promise<string> {
  const prompt = `
  You are a document processing assistant. Below is raw text extracted from a Tamil Nadu property transaction PDF. 
  Please clean and structure this text and convert it to English while preserving all data points:
  
  1. Remove headers/footers/page numbers
  2. Fix line breaks that break up data fields
  3. Identify and separate individual transactions
  4. Preserve all numbers, dates, names, and property details
  
  Raw text:
  ${text}
  
  Return ONLY the cleaned text with no additional commentary.
  `;

  const result = await geminiFlash.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

async function parseTransactionsWithAI(text: string): Promise<any[]> {
  const prompt = `
  You are an expert at parsing Tamil Nadu property transaction documents. 
  Extract all transactions from the following text and return them as a JSON array.
  
  Each transaction should have these fields:
  - srNo: Serial number
  - docNo: Document number
  - dates: Execution/registration dates (split into executionDate and registrationDate if available)
  - nature: Nature of document (translate to English)
  - executants: Names of executants (buyers)
  - claimants: Names of claimants (sellers)
  - volPageNo: Volume and page number
  - considerationValue: Numeric value only
  - marketValue: Numeric value only
  - prNumber: PR number
  - propertyType: Type of property (translate to English)
  - propertyExtent: Extent of property
  - villageStreet: Village and street details
  - surveyNo: Survey number
  - plotNo: Plot number
  - scheduleRemarks: Any remarks
  
  Return ONLY the JSON array with no additional text or explanation.
  
  Text to parse:
  ${text}
  `;

  const result = await geminiFlash.generateContent(prompt);
  const response = await result.response;

  try {
    // Gemini sometimes adds markdown formatting, so we need to clean it
    const jsonString = response
      .text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : parsed.transactions || [];
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    return [];
  }
}

async function processTransactions(rawTransactions: any[]) {
  const processed = [];

  for (const raw of rawTransactions) {
    // Use AI to normalize names and addresses
    const normalizedNames = await normalizeNamesWithAI(
      raw.executants,
      raw.claimants
    );

    processed.push({
      documentNumber: raw.docNo,
      transactionDate: parseDate(
        raw.dates?.executionDate || raw.dates?.split("/")[0]?.trim() || ""
      ),
      registrationDate: parseDate(
        raw.dates?.registrationDate || raw.dates?.split("/")[1]?.trim() || ""
      ),
      nature: raw.nature, // Already translated by AI
      buyer: normalizedNames.buyer,
      seller: normalizedNames.seller,
      considerationValue: parseValue(raw.considerationValue),
      marketValue: parseValue(raw.marketValue),
      prNumber: raw.prNumber,
      propertyType: raw.propertyType, // Already translated by AI
      propertyExtent: raw.propertyExtent,
      village: raw.villageStreet?.split(",")[0]?.trim() || "",
      street: raw.villageStreet?.split(",")[1]?.trim() || "",
      surveyNumber: raw.surveyNo,
      plotNumber: raw.plotNo,
      remarks: raw.scheduleRemarks,
      originalData: JSON.stringify(raw), // Store original for reference
    });
  }

  return processed;
}

async function normalizeNamesWithAI(buyers: string, sellers: string) {
  const prompt = `
  Normalize these Tamil property transaction names into consistent formats:
  
  Buyers: ${buyers}
  Sellers: ${sellers}
  
  Return a JSON object with:
  - buyer: Array of normalized buyer names (split individuals, standardize formats)
  - seller: Array of normalized seller names
  
  Rules:
  1. Split combined names (e.g., "A and B" becomes ["A", "B"])
  2. Remove titles (Thiru/Tmt/Smt etc.)
  3. Standardize name formats (Last, First Middle)
  4. Handle Tamil-to-English transliteration
  
  Return ONLY the JSON with no additional text.
  `;

  const result = await geminiFlash.generateContent(prompt);
  const response = await result.response;

  try {
    // Clean the response in case Gemini adds markdown
    const jsonString = response
      .text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to normalize names:", e);
    return {
      buyer: [buyers],
      seller: [sellers],
    };
  }
}

const parseValue = async (valueStr: any): Promise<number> => {
  // Handle null/undefined cases
  if (valueStr === null || valueStr === undefined) return 0;

  // Convert to string if it isn't already
  const strValue = typeof valueStr === "string" ? valueStr : String(valueStr);

  // Handle empty string after conversion
  if (!strValue.trim()) return 0;

  try {
    // Try direct parsing first - handle Tamil number formats
    // Remove currency symbols, commas, and other non-numeric characters except decimal point
    const cleanedStr = strValue
      .replace(/[^\d.]/g, "") // Remove all non-digits and non-dots
      .replace(/^\./, "") // Remove leading dots
      .replace(/\.+$/, ""); // Remove trailing dots

    // Parse the numeric value
    const numericValue = parseFloat(cleanedStr);

    // Return if we got a valid number
    if (!isNaN(numericValue)) {
      return numericValue;
    }

    // If direct parsing fails, use AI for complex cases
    return await parseComplexValueWithAI(strValue);
  } catch (error) {
    console.error("Error parsing value:", error);
    return 0; // Fallback to 0 if any error occurs
  }
};

// Enhanced AI-based value parser
const parseComplexValueWithAI = async (valueStr: string): Promise<number> => {
  try {
    const prompt = `
      Extract JUST the numeric value from this Tamil property transaction value.
      Return ONLY the number with no text, symbols, or units.
      
      Examples:
      Input: "ரூ. 1,50,000/-" → 150000
      Input: "Five lakhs only" → 500000
      Input: "₹12,345.67" → 12345.67
      
      Value to parse: ${valueStr}
      `;

    const result = await geminiFlash.generateContent(prompt);
    const response = await result.response;
    const numericString = response.text().trim();

    // Clean the AI response in case it includes any non-numeric characters
    const cleaned = numericString.replace(/[^\d.]/g, "");
    return parseFloat(cleaned) || 0;
  } catch (error) {
    console.error("AI value parsing failed:", error);
    return 0;
  }
};

const parseDate = async (dateStr: string) => {
  // Enhanced date parsing with validation
  if (!dateStr) return new Date(NaN);

  // Try common formats
  const formats = [
    "dd-MMM-yyyy", // 07-Feb-2013
    "dd/MM/yyyy", // 07/02/2013
    "yyyy-MM-dd", // 2013-02-07
    "MM/dd/yyyy", // 02/07/2013
  ];

  for (const format of formats) {
    const date = tryParseDate(dateStr, format);
    if (!isNaN(date.getTime())) return date;
  }

  // Fallback to AI if standard parsing fails
  return parseComplexDateWithAI(dateStr);
};

function tryParseDate(dateStr: string, format: string): Date {
  // Simple date parser for known formats
  const parts = dateStr.split(/[\/-]/);
  if (format === "dd-MMM-yyyy" && parts.length === 3) {
    const months: Record<string, number> = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };
    const month = months[parts[1]];
    if (month !== undefined) {
      return new Date(parseInt(parts[2]), month, parseInt(parts[0]));
    }
  }
  // Add other format handlers as needed
  return new Date(NaN);
}

async function parseComplexDateWithAI(dateStr: string): Promise<Date> {
  const prompt = `
  Convert this Tamil property transaction date to ISO format (YYYY-MM-DD).
  Return ONLY the date in ISO format with no other text.
  
  Date to convert: ${dateStr}
  `;

  const result = await geminiFlash.generateContent(prompt);
  const response = await result.response;
  return new Date(response.text().trim());
}
