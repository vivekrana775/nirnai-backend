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

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, //25 mb
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export const getPdfData = router.post(
  "/transaction/upload",
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

      // 1. Extract and chunk the text
      const textChunks = await extractAndChunkTextFromPdf(req.file.buffer);

      sendRes({
        success: true,
        res: res,
        code: 202,
        message: "PDF processed successfully",
        data: {
          processedTransactions: [],
        },
      });

      let allTransactions = [];

      // 2. Process each chunk with the AI
      for (const chunk of textChunks) {
        const transactions = await parseTransactionsWithAI(chunk);
        if (transactions.length > 0) {
          allTransactions.push(...transactions);
        }
      }

      // 3. Save all transactions to the database
      const processedTransactions = await processTransactions(allTransactions);
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

async function extractAndChunkTextFromPdf(
  pdfBuffer: Buffer
): Promise<string[]> {
  const data = await pdf(pdfBuffer);
  const text = data.text;
  const chunkSize = 8000; // Define a chunk size (in characters)
  const overlap = 500; // Define overlap to avoid cutting data in the middle
  const chunks = [];

  for (let i = 0; i < text.length; i += chunkSize - overlap) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  return chunks;
}

const parseTransactionsWithAI = async (text: string) => {
  const prompt = `
  You are an expert at parsing Tamil Nadu property transaction documents. 
  Extract all transactions each parameter of transaction from the following text and return them as a JSON array.
  
  Each transaction should have these fields:
  - srNo: Serial Number (Int)
  - docNoAndYear: Document No.& Year (String)
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
  - propertyExtent: Property Extent (String)
  - villageStreet: Village & Street (Village and street details)
  - surveyNo: Survey No (Array of String)
  - plotNo: Plot number
  - scheduleRemarks: Any remarks
  
  Return ONLY the JSON array with no additional text or explanation and convert tamil text to english. If no transactions are found in this chunk, return an empty array [].
  
  Text to parse:
  ${text}
  `;

  try {
    const result = await geminiFlash.generateContent(prompt);
    const response = await result.response;

    const jsonString = response
      .text()
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : parsed.transactions || [];
  } catch (e) {
    console.error("Failed to parse AI response:", e);
    // Return an empty array on error to avoid crashing the whole process
    return [];
  }
};

const processTransactions = async (rawTransactions: any[]) => {
  const processed = [];
  for (let transaction of rawTransactions) {
    try {
      // Basic validation to avoid saving empty objects
      if (transaction.docNoAndYear) {
        const createdTransaction = await prisma.transaction.create({
          data: transaction,
        });
        processed.push(createdTransaction);
      }
    } catch (error) {
      console.log("Error creating transaction:", error.message);
    }
  }
  return processed;
};
