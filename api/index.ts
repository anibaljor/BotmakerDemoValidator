import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Set up JSON body parser with comfortable limit for base64 images
app.use(express.json({ limit: "15mb" }));

// Lazy initializer for Gemini client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables. Please check Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Utility to clean and parse data URL base64 images
function parseBase64Image(dataUrl: string) {
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    // Return assume raw base64 jpeg if it's not a data URL
    return {
      mimeType: "image/jpeg",
      data: dataUrl
    };
  }
  return {
    mimeType: matches[1],
    data: matches[2]
  };
}

// 1. Endpoint: Health check
app.get("/api/health", (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY || "";
  const hasKey = apiKey.trim().length > 0;
  let maskedKey = "No configurada";
  
  if (hasKey) {
    if (apiKey.length > 8) {
      maskedKey = `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`;
    } else {
      maskedKey = "Configurada";
    }
  }

  res.json({ 
    status: "healthy", 
    time: new Date().toISOString(),
    hasApiKey: hasKey,
    maskedKey: maskedKey
  });
});

// 2. Endpoint: Validate Selfie with DNI on Right Side
app.post("/api/validate-selfie", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image content provided." });
    }

    const { mimeType, data } = parseBase64Image(image);
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: data
          }
        },
        {
          text: `
          Analiza detallamente esta selfie de onboarding para validación de identidad KYC de Botmaker.
          Debe cumplir con:
          1. Se observa una persona real (no una foto de otra pantalla o papel).
          2. El rostro de la persona es claramente visible y no está tapado de forma que dificulte la biometría.
          3. Sostiene un documento de identidad físico (DNI o identificación nacional similar).
          4. Regla de posición (Tolerancia de Cámara/Efecto Espejo): El documento DNI debe estar ubicado a un costado del rostro de la persona (junto a una de sus mejillas, sin cubrir la cara). Debido a que las webcams y cámaras frontales pueden aplicar efecto espejo de manera diferente según el navegador o dispositivo, se considera totalmente VÁLIDO esté tanto al lado derecho como al lado izquierdo de la imagen, siempre que esté visible al costado de su rostro y no tape sus facciones. No debe estar cubriendo su rostro ni al centro tapando la nariz/boca.
          5. Calidad de imagen: La foto es nítida, no está excesivamente borrosa o pixelada.
          6. Fondo claro/neutro: El fondo detrás de la persona es claro o neutro.

          Asigna las propiedades del JSON basándote en este análisis comprensivo de lateralidad:
          - 'valid' debe ser true si se cumplen las condiciones anteriores (el DNI al costado de la cara es válido tanto en el lado izquierdo de la imagen como en el derecho debido a inversiones de cámara).
          - 'reasons' debe ser un array de strings en Español explicando con precisión qué condiciones fallaron si valid es false (si es válida, debe ser un array vacío).
          - 'dni_on_right_side' debe ser true si el DNI está a cualquier costado del rostro de manera visible y sin tapar la cara.
          `
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            valid: { 
              type: Type.BOOLEAN, 
              description: "True si la foto cumple con rostro despejado, DNI visible y ubicado al costado de la cara (izquierdo o derecho por efecto espejo), no borrosa y fondo neutro." 
            },
            person_visible: { type: Type.BOOLEAN, description: "Hay una persona visible in la imagen." },
            face_visible: { type: Type.BOOLEAN, description: "El rostro está despejado y visible para reconocimiento facial." },
            dni_visible: { type: Type.BOOLEAN, description: "El DNI u otro documento físico es visible en la foto." },
            dni_on_right_side: { type: Type.BOOLEAN, description: "El documento está a la derecha del rostro desde la perspectiva del espectador que mira la foto." },
            image_blurry: { type: Type.BOOLEAN, description: "La foto o el documento están borrosos, desenfocados o movidos." },
            background_clear: { type: Type.BOOLEAN, description: "El fondo es liso, claro o neutro." },
            confidence: { type: Type.NUMBER, description: "Grado de certeza (0.0 a 1.0) sobre esta evaluación de onboarding." },
            reasons: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de motivos detallados en español por los cuales la imagen fue rechazada. Vacío si es aprobada."
            }
          },
          required: [
            "valid",
            "person_visible",
            "face_visible",
            "dni_visible",
            "dni_on_right_side",
            "image_blurry",
            "background_clear",
            "confidence",
            "reasons"
          ]
        }
      }
    });

    const resultText = response.text ? response.text.trim() : "{}";
    const evaluation = JSON.parse(resultText);
    res.json(evaluation);

  } catch (error: any) {
    console.error("Error en validate-selfie:", error);
    res.status(500).json({ 
      error: "Error interno procesando la selfie con Gemini.",
      details: error.message || error 
    });
  }
});

// 3. Endpoint: Extract DNI Front Data
app.post("/api/extract-dni", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image content provided." });
    }

    const { mimeType, data } = parseBase64Image(image);
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: data
          }
        },
        {
          text: `
          Analiza esta imagen para OCR y extracción de datos del frente de un DNI argentino (Documento Nacional de Identidad).
          Determina primero si corresponde efectivamente al frente de un DNI de la República Argentina.
          De ser así, realiza la extracción de los datos visibles con máxima precisión y fidelidad:
          - Apellidos (Surname / Apellido)
          - Nombres (Given Names / Nombres)
          - Número de Documento (DNI: extrae la cadena numérica limpia o con puntos; por ejemplo 35.123.456 o 35123456)
          - Sexo (M, F o X)
          - Fecha de Nacimiento (conviértelo a formato ISO YYYY-MM-DD, p.ej. 1990-05-18)
          - Fecha de Emisión (conviértelo a formato ISO YYYY-MM-DD, p.ej. 2020-10-12)
          - Fecha de Vencimiento (conviértelo a formato ISO YYYY-MM-DD, p.ej. 2035-10-12)

          Reglas críticas de OCR:
          1. Nunca inventes datos. Si un campo no es visible o está cubierto de brillo, devuélvelo como string vacío ("") y agrégalo a 'missing_fields'.
          2. Normaliza el nombre y apellido en mayúsculas o su capitalización original del DNI.
          `
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_argentinian_dni_front: { 
              type: Type.BOOLEAN, 
              description: "True si se reconoce con certeza que es el frente de un documento nacional de identidad argentino." 
            },
            apellido: { type: Type.STRING, description: "Apellido(s) impreso en el documento. Vacío si ilegible." },
            nombres: { type: Type.STRING, description: "Nombre(s) impreso en el documento. Vacío si ilegible." },
            dni: { type: Type.STRING, description: "Número de DNI (habitualmente de 7 u 8 dígitos). Vacío si ilegible." },
            sexo: { type: Type.STRING, description: "Sexo registrado en el DNI: M, F o X." },
            fecha_nacimiento: { type: Type.STRING, description: "Fecha de nacimiento en formato YYYY-MM-DD." },
            fecha_emision: { type: Type.STRING, description: "Fecha de emisión en formato YYYY-MM-DD." },
            fecha_vencimiento: { type: Type.STRING, description: "Fecha de vencimiento en formato YYYY-MM-DD." },
            confidence: { type: Type.NUMBER, description: "Índice de confianza de extracción (0.0 a 1.0) calificado por el modelo." },
            missing_fields: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Nombres de los campos del DNI que no pudieron extraerse o que resultaron ilegibles debido a brillo o rotura."
            }
          },
          required: [
            "is_argentinian_dni_front",
            "apellido",
            "nombres",
            "dni",
            "sexo",
            "fecha_nacimiento",
            "fecha_emision",
            "fecha_vencimiento",
            "confidence",
            "missing_fields"
          ]
        }
      }
    });

    const resultText = response.text ? response.text.trim() : "{}";
    const dataExtracted = JSON.parse(resultText);
    res.json(dataExtracted);

  } catch (error: any) {
    console.error("Error en extract-dni:", error);
    res.status(500).json({ 
      error: "Error interno extrayendo datos del DNI con Gemini.", 
      details: error.message || error 
    });
  }
});

// 4. Endpoint: Compare Selfie face vs DNI Front face
app.post("/api/compare-faces", async (req, res) => {
  try {
    const { selfie, dniFront } = req.body;
    if (!selfie || !dniFront) {
      return res.status(400).json({ error: "Se requieren ambas imágenes (selfie y frente de DNI) para realizar la comparación biométrica simulada." });
    }

    const parsedSelfie = parseBase64Image(selfie);
    const parsedDni = parseBase64Image(dniFront);
    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: parsedSelfie.mimeType,
            data: parsedSelfie.data
          }
        },
        {
          inlineData: {
            mimeType: parsedDni.mimeType,
            data: parsedDni.data
          }
        },
        {
          text: `
          Actúa como un validador visual de soporte. Analiza y compara el rostro de la persona en la primera foto (Selfie de onboarding) con la foto carnet impresa en el documento de la segunda foto (Frente del DNI).
          Determina si pertenecen a la misma persona realizando un cotejo de rasgos faciales:
          - Estructura ósea facial, cejas, ojos, nariz, labios y mentón.
          - Ten en cuenta factores como el envejecimiento, diferencia de peinado, barba, anteojos y la calidad de la foto impresa.
          
          Devuelve un análisis de comparación facial estructurado en JSON.
          - 'match' debe ser true si los rostros son consistentes con alta veracidad de ser la misma persona.
          - 'similarity_score' es un número de 0 a 100 de similitud visual.
          - 'details' debe ser una explicación detallada en español que el usuario final o un agente revisor humano pueda leer.
          - 'reasons' lista advertencias u observaciones críticas (p. ej., diferencias notables en vello facial, peinado, o asimetrías).
          `
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            match: { type: Type.BOOLEAN, description: "True si existe coincidencia de rasgos que apunte razonablemente a que es la misma persona." },
            similarity_score: { type: Type.NUMBER, description: "Puntuación de similitud visual aproximada del 0 al 100." },
            details: { type: Type.STRING, description: "Explicación detallada en español de la comparación biométrica realizada." },
            reasons: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Observaciones de advertencia o diferencias físicas detectadas en el análisis comparativo."
            }
          },
          required: [
            "match",
            "similarity_score",
            "details",
            "reasons"
          ]
        }
      }
    });

    const resultText = response.text ? response.text.trim() : "{}";
    const comparisonResult = JSON.parse(resultText);
    res.json(comparisonResult);

  } catch (error: any) {
    console.error("Error en compare-faces:", error);
    res.status(500).json({ 
      error: "Error interno comparando los rostros con Gemini.", 
      details: error.message || error 
    });
  }
});

export default app;
