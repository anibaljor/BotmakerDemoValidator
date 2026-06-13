import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import app from "./api/index";

const PORT = 3000;

async function startViteIntegration() {
  if (process.env.NODE_ENV !== "production") {
    // Configure Vite in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // Mount Vite middlewares
    app.use(vite.middlewares);
    console.log("Vite dev middleware mounted successfully.");
  } else {
    // Serve production built files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    // Fallback all other routes to index.html for Single-Page Application (SPA) routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from:", distPath);
  }

  // Bind to port 3000 and interface 0.0.0.0
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server launched successfully and listening on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startViteIntegration().catch((err) => {
    console.error("Failed to start Vite integration:", err);
  });
}

export default app;
