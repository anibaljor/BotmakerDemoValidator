import { useState } from 'react';
import { Terminal, Copy, Check, FileText, Code2, Cpu, Sparkles, Activity } from 'lucide-react';
import { BotmakerState, SelfieValidation, DniFrontExtraction, FaceComparison } from '../types';

interface BotmakerConsoleProps {
  botmakerState: BotmakerState;
  activeTab: 'logs' | 'code' | 'variables';
  setActiveTab: (tab: 'logs' | 'code' | 'variables') => void;
  lastSelfieResult: SelfieValidation | null;
  lastDniResult: DniFrontExtraction | null;
  lastComparisonResult: FaceComparison | null;
  loadingSelfie: boolean;
  loadingDni: boolean;
  loadingCompare: boolean;
}

export default function BotmakerConsole({
  botmakerState,
  activeTab,
  setActiveTab,
  lastSelfieResult,
  lastDniResult,
  lastComparisonResult,
  loadingSelfie,
  loadingDni,
  loadingCompare
}: BotmakerConsoleProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Node.js Code snippet simulating code required dynamically in Botmaker
  const botmakerCodeSnippet = `/**
 * Código Node.js para insertar en Botmaker Action Block
 * Utiliza la API de Gemini 3.5 para validación de identidad e OCR
 */
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "${process.env.GEMINI_API_KEY ? '•'?.repeat(12) : 'GEMINI_API_KEY'}"
});

// 1. Validar Selfie + DNI al lado Derecho
async function validateSelfieWithDni(imageUrl) {
  const imageResponse = await fetch(imageUrl);
  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [
      { inlineData: { mimeType: "image/jpeg", data: buffer.toString("base64") } },
      { text: "Comprueba si es selfie con rostro despejado y sostiene DNI del lado DERECHO visual" }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          valid: { type: Type.BOOLEAN },
          person_visible: { type: Type.BOOLEAN },
          face_visible: { type: Type.BOOLEAN },
          dni_visible: { type: Type.BOOLEAN },
          dni_on_right_side: { type: Type.BOOLEAN },
          image_blurry: { type: Type.BOOLEAN },
          confidence: { type: Type.NUMBER },
          reasons: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["valid", "person_visible", "face_visible", "dni_visible", "dni_on_right_side", "image_blurry", "confidence", "reasons"]
      }
    }
  });
  
  return JSON.parse(response.text);
}

// 2. Extraer datos del Frente de DNI Argentino
async function extractDniFront(imageUrl) {
  const imageResponse = await fetch(imageUrl);
  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [
      { inlineData: { mimeType: "image/jpeg", data: buffer.toString("base64") } },
      { text: "Extrae apellidos, nombres, número de documento, sexo y fechas en formato YYYY-MM-DD" }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          is_argentinian_dni_front: { type: Type.BOOLEAN },
          apellido: { type: Type.STRING },
          nombres: { type: Type.STRING },
          dni: { type: Type.STRING },
          sexo: { type: Type.STRING },
          fecha_nacimiento: { type: Type.STRING },
          confidence: { type: Type.NUMBER },
          missing_fields: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["is_argentinian_dni_front", "apellido", "nombres", "dni", "sexo", "fecha_nacimiento", "confidence", "missing_fields"]
      }
    }
  });
  
  return JSON.parse(response.text);
}`;

  return (
    <div className="flex flex-col h-full bg-[#111b21] border-l-2 border-slate-950 text-slate-100 overflow-hidden font-sans shadow-2xl">
      {/* Title Header with MODO Sky-Blue top accent line */}
      <div className="flex items-center justify-between px-4 py-4 bg-slate-950 border-t-4 border-sky-400 border-b border-indigo-900/30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/10 text-sky-400 border border-sky-400/20">
            <Cpu className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-100">Botmaker Console</h2>
              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-sky-500/10 text-sky-400 rounded border border-sky-450/20">ARG 🇦🇷</span>
            </div>
            <span className="text-[10px] text-sky-400 font-extrabold tracking-tight uppercase flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              Cónsola MODO + Gemini Engine
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/35 font-bold">
          <Activity className="h-3 w-3 animate-pulse" />
          <span>Servicio Activo</span>
        </div>
      </div>

      {/* Console Tabs - Customized in Sky Blue / Deep Slate-950 */}
      <div className="flex border-b border-slate-950 bg-slate-950 px-2 pt-1 gap-1">
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all ${
            activeTab === 'logs'
              ? 'border-sky-400 text-sky-400 bg-[#111b21]'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          Respuestas JSON
        </button>
        <button
          onClick={() => setActiveTab('variables')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all ${
            activeTab === 'variables'
              ? 'border-sky-400 text-sky-400 bg-[#111b21]'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          Estado Botmaker
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all ${
            activeTab === 'code'
              ? 'border-sky-400 text-sky-400 bg-[#111b21]'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
          }`}
        >
          <Code2 className="h-3.5 w-3.5" />
          Código Node.js
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#111b21] text-xs font-mono leading-relaxed">
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <p className="text-[10px] text-slate-400 font-sans leading-tight font-sans text-slate-400">
              Observá el esquema JSON estructurado devuelto en tiempo real por la IA de Google Gemini para cada paso del onboarding:
            </p>

            {/* Dynamic Status indicators */}
            {(loadingSelfie || loadingDni || loadingCompare) && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-sky-500/5 border border-sky-500/25 text-sky-300 animate-pulse font-sans">
                <Sparkles className="h-4 w-4 animate-spin text-sky-450 text-sky-450" />
                <div>
                  <span className="font-extrabold block text-xs text-sky-400 uppercase tracking-wide">Gemini procesando imagen...</span>
                  <p className="text-[10px] text-slate-350">Ejecutando model/gemini-3.5-flash y respondiendo con Structured Out.</p>
                </div>
              </div>
            )}

            {/* Step 1: Selfie Results */}
            <div className="rounded-xl border border-indigo-950 bg-slate-950/60 overflow-hidden">
              <div className="flex justify-between items-center bg-slate-950 px-3 py-2 border-b border-indigo-950">
                <span className="font-bold text-[10px] text-sky-400 tracking-wider">STAGE 1: parse_selfie_with_dni()</span>
                {lastSelfieResult && (
                  <button 
                    onClick={() => handleCopy(JSON.stringify(lastSelfieResult, null, 2))}
                    className="p-1 text-slate-450 hover:text-slate-100 rounded hover:bg-slate-800 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="p-3 select-all overflow-x-auto max-h-[180px] scrollbar-thin">
                {lastSelfieResult ? (
                  <pre className="text-[11px] text-slate-300">{JSON.stringify(lastSelfieResult, null, 2)}</pre>
                ) : (
                  <span className="text-slate-500 italic block py-2 text-center text-[10px] font-sans">Esperando captura o subida de Selfie...</span>
                )}
              </div>
            </div>

            {/* Step 2: DNI Results */}
            <div className="rounded-xl border border-indigo-950 bg-slate-950/60 overflow-hidden">
              <div className="flex justify-between items-center bg-slate-950 px-3 py-2 border-b border-indigo-950">
                <span className="font-bold text-[10px] text-yellow-400 tracking-wider">STAGE 2: ocr_extract_dni_front()</span>
                {lastDniResult && (
                  <button 
                    onClick={() => handleCopy(JSON.stringify(lastDniResult, null, 2))}
                    className="p-1 text-slate-450 hover:text-slate-100 rounded hover:bg-slate-800 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="p-3 select-all overflow-x-auto max-h-[180px] scrollbar-thin">
                {lastDniResult ? (
                  <pre className="text-[11px] text-slate-300">{JSON.stringify(lastDniResult, null, 2)}</pre>
                ) : (
                  <span className="text-slate-500 italic block py-2 text-center text-[10px] font-sans">Esperando cargado de DNI Frente...</span>
                )}
              </div>
            </div>

            {/* Step 3: Face Comparison Results */}
            <div className="rounded-xl border border-indigo-950 bg-slate-950/60 overflow-hidden">
              <div className="flex justify-between items-center bg-slate-950 px-3 py-2 border-b border-indigo-950">
                <span className="font-bold text-[10px] text-sky-400 tracking-wider">STAGE 3: biometric_face_compare()</span>
                {lastComparisonResult && (
                  <button 
                    onClick={() => handleCopy(JSON.stringify(lastComparisonResult, null, 2))}
                    className="p-1 text-slate-450 hover:text-slate-100 rounded hover:bg-slate-800 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="p-3 select-all overflow-x-auto max-h-[180px] scrollbar-thin">
                {lastComparisonResult ? (
                  <pre className="text-[11px] text-slate-300">{JSON.stringify(lastComparisonResult, null, 2)}</pre>
                ) : (
                  <span className="text-slate-500 italic block py-2 text-center text-[10px] font-sans">Esperando comparación de rostros (Automático al completar paso 2)...</span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'variables' && (
          <div className="space-y-4 font-sans">
            <p className="text-[10px] text-slate-400 text-left">
              Estas son las variables de sesión y el estado dinámico del flujo cargado en la plataforma Botmaker de Node.js:
            </p>

            <div className="rounded-xl border border-indigo-950 bg-slate-950/45 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Variable de Sesión</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Valor de Estado</span>
              </div>
              <hr className="border-indigo-950" />
              
              <div className="flex justify-between items-center py-0.5">
                <span className="text-[11px] font-mono text-slate-300">user.get("dni_selfie_status")</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  botmakerState.dni_selfie_status === 'approved' 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : botmakerState.dni_selfie_status === 'rejected' 
                    ? 'bg-red-500/10 text-red-500' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  "{botmakerState.dni_selfie_status}"
                </span>
              </div>

              {botmakerState.dni_selfie_reasons && (
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-indigo-950 text-[11px] text-slate-300 font-mono mt-1">
                  <span className="text-[9px] text-slate-400 block mb-0.5">user.get("dni_selfie_reasons")</span>
                  "{botmakerState.dni_selfie_reasons}"
                </div>
              )}

              <div className="flex justify-between items-center py-0.5">
                <span className="text-[11px] font-mono text-slate-300">user.get("dni_front_status")</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  botmakerState.dni_front_status === 'approved' 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : botmakerState.dni_front_status === 'rejected' 
                    ? 'bg-red-500/10 text-red-500' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  "{botmakerState.dni_front_status}"
                </span>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-[11px] font-mono text-slate-300">user.get("biometric_status")</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  botmakerState.biometric_status === 'match' 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : botmakerState.biometric_status === 'no_match' 
                    ? 'bg-red-500/10 text-red-500' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  "{botmakerState.biometric_status}"
                </span>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-[11px] font-mono text-slate-300">user.get("biometric_score")</span>
                <span className="text-xs font-bold text-sky-400">
                  {botmakerState.biometric_score ? `${botmakerState.biometric_score}%` : 'null'}
                </span>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-[11px] font-mono text-slate-300">Onboarding State</span>
                <span className="text-xs font-bold text-sky-400 uppercase">
                  {botmakerState.currentStep}
                </span>
              </div>
            </div>

            {/* Simulated webhook payload information */}
            <div className="rounded-xl border border-indigo-905/40 border-indigo-900/40 bg-indigo-950/20 p-3.5 space-y-2">
              <h4 className="text-xs font-bold text-sky-400 flex items-center gap-1.5 leading-none">
                <Check className="h-3.5 w-3.5" />
                Cómo funciona en Botmaker
              </h4>
              <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans">
                En Botmaker podés insertar un bloque de código <strong>"Action (JavaScript/Node.js)"</strong>. 
                Allí recibís la imagen adjuntada por el usuario (vía <code className="bg-slate-800 text-slate-200 px-1 rounded text-[10px]">image_url</code>), haces el llamado HTTPS asíncrono a esta API con Gemini, y seteas las variables correspondientes utilizando <code className="bg-slate-810 bg-slate-800 text-slate-200 px-1 rounded text-[10px]">user.set()</code> para bifurcar el árbol conversacional de onboarding.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="relative h-full">
            <div className="absolute right-0 top-0 z-10 flex gap-2">
              <button
                onClick={() => handleCopy(botmakerCodeSnippet)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-sans font-extrabold border border-sky-600 transition-all shadow"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-slate-950" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? '¡Copiado!' : 'Copiar Código'}
              </button>
            </div>
            
            <pre className="text-[11px] text-slate-300 bg-slate-950 p-4 rounded-xl border border-indigo-950 overflow-x-auto max-h-[500px] scrollbar-thin mt-8 leading-snug">
              <code>{botmakerCodeSnippet}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
