import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser limit expanded for rich base64 components
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API route to send high-fidelity confirmation email code
  app.post("/api/send-otp", async (req, res) => {
    const { email, name, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required." });
    }

    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASS;

    if (!smtpUser || !smtpPass) {
      console.warn("⚠️ SMTP credentials not configured. Please define SMTP_USER and SMTP_PASS in secrets.");
      return res.json({
        success: false,
        notConfigured: true,
        message: "Les identifiants SMTP_USER et SMTP_PASS ne sont pas encore configurés dans les Secrets de l'AI Studio."
      });
    }

    try {
      const host = process.env.SMTP_HOST || "smtp.gmail.com";
      const port = parseInt(process.env.SMTP_PORT || "465", 10);
      const secure = process.env.SMTP_SECURE !== "false";

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0d1117; color: #ffffff; padding: 40px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 2px solid #E8762C; box-shadow: 0 0 25px rgba(232, 118, 44, 0.25);">
          <!-- Header with neon futuristic branding -->
          <div style="text-align: center; border-bottom: 2px solid #E8762C; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #E8762C; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase; text-shadow: 0 0 8px rgba(232, 118, 44, 0.5);">⚡ SYSTEM ACCESS CONTROL MDB ⚡</h1>
            <p style="color: #a5b4fc; margin: 6px 0 0 0; font-size: 11px; font-family: monospace; letter-spacing: 1px;">FUTURE SECURITY LAYER // CAMEROON HIGH-TECH PORTAL</p>
          </div>
          
          <div style="background: rgba(22, 27, 34, 0.9); border-radius: 12px; padding: 30px; border: 1px solid #30363d; margin-bottom: 25px;">
            <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Mbolo <strong style="color: #E8762C;">${name || 'Utilisateur'}</strong>,</p>
            <p style="font-size: 14.5px; line-height: 1.6; color: #c9d1d9;">
              Vous avez initié la création d'un compte sur le service technologique de livraison de maquis <strong>Maquis de Bord (MDB) Cameroun v2026</strong>.
            </p>
            
            <p style="font-size: 14px; line-height: 1.6; color: #8b949e; text-align: center; margin: 25px 0 15px 0;">
              Saisissez le code d'authentification cryptologique ci-dessous pour valider votre CNI et activer votre terminal d'accès :
            </p>
            
            <!-- Code Display -->
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 950; background: #000000; color: #39ff14; padding: 18px 40px; border-radius: 12px; border: 2px solid #39ff14; letter-spacing: 8px; box-shadow: 0 0 20px rgba(57, 255, 20, 0.4); display: inline-block;">
                ${code}
              </span>
            </div>
            
            <p style="font-size: 11px; color: #f85149; font-family: monospace; text-align: center; margin-top: 25px;">
              ⚠️ ALERTE DE SÉCURITÉ : Ne partagez jamais ce code. Notre équipe ne vous contactera jamais pour vous le réclamer.
            </p>
          </div>
          
          <div style="font-size: 11px; color: #8b949e; line-height: 1.6; text-align: center; border-top: 1px solid #30363d; padding-top: 20px;">
            <p style="margin: 0; font-weight: bold;">MDB Delivery Control Center • Yaoundé & Douala, Cameroun</p>
            <p style="margin: 4px 0 0 0; font-family: monospace; color: #484f58;">SECURE AUTH TRANSMITTER v2026.06 // STATUS: ONLINE</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'MDB Cameroun'}" <${smtpUser}>`,
        to: email,
        subject: `🔑 Code de confirmation : ${code} — Sécurité MDB`,
        html: htmlContent,
        text: `Mbolo ${name || 'Utilisateur'},\n\nVotre code de confirmation MDB est : ${code}\n\nNe partagez jamais ce code.\n\nL'équipe MDB.`,
      });

      console.log(`✉️ Email OTP sent successfully to ${email}`);
      return res.json({ success: true });
    } catch (error: any) {
      console.error("❌ Failed to send SMTP email:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
