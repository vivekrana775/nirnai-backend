import { Request, Response, Router } from "express";
import dotenv from "dotenv";
import multer from "multer";
import { sendRes } from "../../../../types/response";
const { Translate } = require("@google-cloud/translate").v2;
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const pdf = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");

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

      console.log("transactions", transactions);

      // Translate only specific fields that need translation
      const processedTransactions = await processTransactions(transactions);

      return sendRes({
        success: true,
        res: res,
        code: 200,
        message: "PDF processed successfully",
        data: {
          processedTransactions,
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

const parseTransactionsWithAI = async (text: string) => {
  const prompt = `
  You are an expert at parsing Tamil Nadu property transaction documents. 
  Extract all transactions and each parameter of transaction from the following text and return them as a JSON array.
  
  Each transaction should have these fields:
  - srNo: Serial Number
  - docNoAndYear: Document No.& Year
  - dates: Date of Execution & Date of Presentation & Date of Registration (Array of strings)
  - nature: Nature of document 
  - executants: Names of executants (buyers) (Array of Strings)
  - claimants: Names of claimants (sellers) (Array of Strings)
  - volPageNo: Volume and page number
  - considerationValue: Consideration Value (Numeric value only)
  - marketValue: Market Value (Numeric value only)
  - prNumber: PR Number (Array of strings)
  - documentRemarks: Document Remarks (String)
  - propertyType: Property Type (Type of property)
  - propertyExtent: Property Extent (Extent of property)
  - villageStreet: Village & Street (Village and street details)
  - surveyNo: Survey No (Array of String)
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
};

const processTransactions = async (rawTransactions: any[]) => {
  const processed = [];

  for (let transaction of rawTransactions) {
    try {
      const createdTransaction = await prisma.transaction.create({
        data: transaction,
      });
      processed.push(createdTransaction);
    } catch (error) {
      console.log("error creating transaction", error);
    }
  }

  return processed;
};
