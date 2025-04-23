# ResuRabbit

ResuRabbit is a modern LaTeX resume editor with real-time collaboration features, designed to make resume creation simple and efficient.

## Features

- **LaTeX Editing**: Full-featured LaTeX editor with syntax highlighting
- **PDF Preview**: Instant preview of your resume as a PDF
- **Section Navigation**: Easily navigate between different resume sections
- **Real-time Collaboration**: Work on resumes simultaneously with others
- **Template Library**: Choose from pre-designed templates to get started quickly
- **Client-side PDF Generation**: Generate PDFs directly in the browser when server is unavailable

## Setup & Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/resuRabbit.git
   cd resuRabbit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret_key
   
   # For authentication (if using Google)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # For database (if using Prisma)
   DATABASE_URL=your_database_connection_string
   
   # For Socket.IO server
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Setting up for Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

### Deployment Platforms

#### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set up the required environment variables in the Vercel dashboard
3. Deploy with the default settings

#### Other Platforms

When deploying to other platforms like Netlify, Railway, or a custom server:

1. Ensure you set the environment variables correctly
2. Configure Socket.IO server to run alongside the Next.js application
3. Use the `standalone` output option in `next.config.js` for optimized builds

## Architecture

- **Frontend**: Next.js, React, TailwindCSS
- **LaTeX Editing**: CodeMirror with LaTeX syntax highlighting
- **PDF Generation**: Client-side using jsPDF, server-side using LaTeX processing
- **Collaboration**: Socket.IO for real-time editing
- **Authentication**: NextAuth.js with multiple provider support

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [CodeMirror](https://codemirror.net/) for the editor implementation
- [jsPDF](https://github.com/parallax/jsPDF) for client-side PDF generation
- [Socket.IO](https://socket.io/) for real-time collaboration
- [Next.js](https://nextjs.org/) for the React framework
