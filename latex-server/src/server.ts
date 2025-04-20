// server.ts
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

// Define interface for request body
interface LaTeXRequest {
  latex: string;
}

// Define params interface for routes with parameters
interface PreviewParams {
  filename: string;
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public')); // For serving generated files

// Create directory for temporary files
const tempDir = path.join(__dirname, 'temp');
const publicDir = path.join(__dirname, 'public');

// Ensure directories exist
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

// API endpoint for LaTeX compilation
app.post('/api/compile-latex', async (req: Request<{}, {}, LaTeXRequest>, res: Response) => {
  try {
    const { latex } = req.body;
    if (!latex) {
      return res.status(400).json({ error: 'LaTeX code is required' });
    }

    // Create a unique ID for this compilation
    const jobId = uuidv4();
    const baseFilename = `resume_${jobId}`;
    const texFilePath = path.join(tempDir, `${baseFilename}.tex`);
    
    // Write LaTeX to a temporary file
    fs.writeFileSync(texFilePath, latex);
    
    // Compile LaTeX to PDF using pdflatex
    await compileLaTeX(texFilePath, tempDir);
    
    // If compilation successful, move PDF to public dir for serving
    const pdfTempPath = path.join(tempDir, `${baseFilename}.pdf`);
    const pdfPublicPath = path.join(publicDir, `${baseFilename}.pdf`);
    
    fs.copyFileSync(pdfTempPath, pdfPublicPath);
    
    // Return the URL for preview
    const previewUrl = `/api/preview/${baseFilename}.pdf`;
    
    res.json({ 
      previewUrl,
      pdfFilename: `${baseFilename}.pdf`
    });
  } catch (error) {
    console.error('LaTeX compilation error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error compiling LaTeX' });
  }
});

// Endpoint for PDF download
app.post('/api/download-pdf', async (req: Request<{}, {}, LaTeXRequest>, res: Response) => {
  try {
    const { latex } = req.body;
    if (!latex) {
      return res.status(400).json({ error: 'LaTeX code is required' });
    }

    // Create unique file for this download
    const jobId = uuidv4();
    const baseFilename = `resume_${jobId}`;
    const texFilePath = path.join(tempDir, `${baseFilename}.tex`);
    
    // Write LaTeX to file
    fs.writeFileSync(texFilePath, latex);
    
    // Compile LaTeX to PDF
    await compileLaTeX(texFilePath, tempDir);
    
    const pdfPath = path.join(tempDir, `${baseFilename}.pdf`);
    
    // Send the PDF file as response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=resume.pdf`);
    
    // Stream the file to response
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);
    
    // Clean up the file after sending
    fileStream.on('end', () => {
      cleanupFiles(baseFilename);
    });
  } catch (error) {
    console.error('PDF download error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Error generating PDF' });
  }
});

// Endpoint for PDF preview
app.get('/api/preview/:filename', (req: Request<PreviewParams>, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(publicDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/pdf');
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.status(404).json({ error: 'PDF not found' });
  }
});

// Helper function to compile LaTeX
function compileLaTeX(texFilePath: string, outputDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Run pdflatex command in the output directory
    const command = `pdflatex -interaction=nonstopmode -output-directory=${outputDir} "${texFilePath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('pdflatex error:', stdout);
        reject(new Error(`LaTeX compilation failed: ${stdout}`));
        return;
      }
      resolve();
    });
  });
}

// Helper function to clean up temporary files
function cleanupFiles(baseFilename: string): void {
  const extensions = ['.tex', '.aux', '.log', '.out', '.pdf'];
  
  extensions.forEach(ext => {
    const filePath = path.join(tempDir, `${baseFilename}${ext}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}

// Clean up temporary files periodically (every hour)
setInterval(() => {
  fs.readdir(publicDir, (err, files) => {
    if (err) return;
    
    const now = Date.now();
    files.forEach(file => {
      if (file.startsWith('resume_') && file.endsWith('.pdf')) {
        const filePath = path.join(publicDir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) return;
          
          // Remove files older than 2 hours
          if (now - stats.mtime.getTime() > 2 * 60 * 60 * 1000) {
            fs.unlinkSync(filePath);
          }
        });
      }
    });
  });
}, 60 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});