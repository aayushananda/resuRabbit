import { NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import latexCache from "@/utils/latexCache";

// Overleaf's public compilation service
const OVERLEAF_LATEX_API = "https://texlive2020.latexonline.cc/compile";
// Alternative services if Overleaf fails
const PAPEERIA_LATEX_API = "https://papeeria.com/api/compile";
const LATEX_BASE_API = "https://latexbase.com/api/compile";

// Temp directory for storing files
const TEMP_DIR = path.join(process.cwd(), "temp");

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
    return true;
  } catch (error) {
    console.error("Error creating temp directory:", error);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const dirCreated = await ensureTempDir();
    if (!dirCreated) {
      return NextResponse.json(
        { error: "Could not create temporary directory" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { latex, engine = "pdflatex", options = {} } = body;

    if (!latex) {
      return NextResponse.json(
        { error: "LaTeX content is required" },
        { status: 400 }
      );
    }

    // Check cache first to avoid unnecessary requests
    const cachedPdfUrl = latexCache.get(latex);
    if (cachedPdfUrl) {
      return NextResponse.json({
        previewUrl: cachedPdfUrl,
        source: "cache",
        success: true,
      });
    }

    // Enhanced LaTeX with custom preamble based on options
    let enhancedLatex = latex;

    // Add paperSize and margin configurations if provided
    if (options?.paperSize || options?.margins) {
      // Extract document class line
      const docClassMatch = latex.match(
        /\\documentclass(\[[^\]]*\])?\{([^}]*)\}/
      );

      if (docClassMatch) {
        const docClassOptions = docClassMatch[1]
          ? docClassMatch[1].slice(1, -1).split(",")
          : [];
        const docClassName = docClassMatch[2];

        // Add paper size if needed
        if (
          options?.paperSize &&
          !docClassOptions.includes(options.paperSize)
        ) {
          docClassOptions.push(options.paperSize);
        }

        // Replace document class line
        const newDocClass = `\\documentclass[${docClassOptions.join(
          ","
        )}]{${docClassName}}`;
        enhancedLatex = enhancedLatex.replace(
          /\\documentclass(\[[^\]]*\])?\{([^}]*)\}/,
          newDocClass
        );

        // Add geometry package for margins if needed
        if (options?.margins) {
          const margins = options.margins;
          const geometrySettings = `\\usepackage[top=${margins.top},right=${margins.right},bottom=${margins.bottom},left=${margins.left}]{geometry}`;

          // Insert after document class
          enhancedLatex = enhancedLatex.replace(
            newDocClass,
            `${newDocClass}\n${geometrySettings}`
          );
        }
      }
    }

    // Try Overleaf's public compiler
    try {
      // Create form data with the LaTeX content
      const formData = new FormData();
      formData.append("fileContents", enhancedLatex);
      formData.append("engine", engine);

      // Send request to Overleaf's public compiler
      const overleafResponse = await axios.post(OVERLEAF_LATEX_API, formData, {
        headers: {
          ...formData.getHeaders(),
          Accept: "application/pdf",
        },
        responseType: "arraybuffer",
        timeout: options?.timeout || 30000,
      });

      // Generate unique filename for PDF
      const pdfFilename = `resume_${uuidv4()}.pdf`;
      const pdfFilePath = path.join(TEMP_DIR, pdfFilename);

      // Write PDF file
      await fs.writeFile(pdfFilePath, Buffer.from(overleafResponse.data));

      // Generate URL for accessing the PDF
      const previewUrl = `/api/view-pdf?file=${pdfFilename}`;

      // Cache the result
      latexCache.set(latex, previewUrl);

      return NextResponse.json({
        previewUrl,
        source: "overleaf",
        success: true,
      });
    } catch (overleafError) {
      console.error("Overleaf API error:", overleafError);

      // Try alternative services
      try {
        // Papeeria as alternative service
        const formData = new FormData();
        formData.append("latex", enhancedLatex);
        formData.append("engine", engine);

        const alternativeResponse = await axios.post(
          PAPEERIA_LATEX_API,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              Accept: "application/pdf",
            },
            responseType: "arraybuffer",
            timeout: options?.timeout || 30000,
          }
        );

        // Generate unique filename for PDF
        const pdfFilename = `resume_${uuidv4()}.pdf`;
        const pdfFilePath = path.join(TEMP_DIR, pdfFilename);

        // Write PDF file
        await fs.writeFile(pdfFilePath, Buffer.from(alternativeResponse.data));

        // Generate URL for accessing the PDF
        const previewUrl = `/api/view-pdf?file=${pdfFilename}`;

        // Cache the result
        latexCache.set(latex, previewUrl);

        return NextResponse.json({
          previewUrl,
          source: "papeeria",
          success: true,
        });
      } catch (alternativeError) {
        console.error("Alternative API error:", alternativeError);
        return NextResponse.json(
          {
            error: "All LaTeX compilation services failed",
            details: overleafError.message,
          },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Error processing LaTeX:", error);
    return NextResponse.json(
      {
        error: `Server error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
