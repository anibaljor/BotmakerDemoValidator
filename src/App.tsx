import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  MoreVertical, 
  Search, 
  Camera, 
  Upload, 
  CheckCheck, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  UserCheck, 
  Bot, 
  User, 
  Phone, 
  Video as VideoIcon,
  ChevronRight,
  Info,
  Key,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { PRESET_SCENARIOS, svgToDataUrl } from './data/presets';
import { 
  Message, 
  BotmakerState, 
  SelfieValidation, 
  DniFrontExtraction, 
  FaceComparison,
  PresetScenario
} from './types';
import CameraCapture from './components/CameraCapture';
import BotmakerConsole from './components/BotmakerConsole';

// Map of independent chat histories per Scenario ID to allow perfect sandboxed demos
interface ScenarioHistory {
  [key: string]: {
    messages: Message[];
    state: BotmakerState;
    lastSelfieResult: SelfieValidation | null;
    lastDniResult: DniFrontExtraction | null;
    lastComparisonResult: FaceComparison | null;
  }
}

const WHATSAPP_DOODLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <g fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="0.8">
    <!-- Bubble -->
    <path d="M 8,10 H 20 A 2,2 0 0 1 22,12 V 18 A 2,2 0 0 1 20,20 H 13 L 10,23 V 20 A 2,2 0 0 1 8,18 V 12 A 2,2 0 0 1 8,10 Z" />
    <!-- Telephone -->
    <rect x="58" y="10" width="8" height="15" rx="1.5" />
    <circle cx="62" cy="22" r="0.8" />
    <line x1="60" y1="12" x2="64" y2="12" />
    <!-- Star -->
    <path d="M 38,12 L 40,16 L 44,16 L 41,19 L 42,23 L 38,21 L 34,23 L 35,19 L 32,16 L 36,16 Z" />
    <!-- Heart -->
    <path d="M 15,75 C 13,73 10,73 10,75.5 C 10,78 13.5,81 15,82 C 16.5,81 20,78 20,75.5 C 20,73 17,73 15,75 Z" />
    <!-- Camera -->
    <rect x="35" y="48" width="10" height="7" rx="1" />
    <circle cx="40" cy="51.5" r="2" />
    <path d="M 38,48 L 39,46 H 41 L 42,48 Z" />
    <!-- ID Card / DNI badge -->
    <rect x="55" y="48" width="14" height="10" rx="1.5" />
    <line x1="58" y1="51" x2="62" y2="51" />
    <line x1="58" y1="54" x2="66" y2="54" />
    <circle cx="65" cy="51" r="1" />
    <!-- Smiley Smile -->
    <path d="M 12,32 A 4,4 0 0,0 20,32" stroke-linecap="round" />
    <circle cx="14" cy="28" r="0.8" fill="rgba(255, 255, 255, 0.04)" />
    <circle cx="18" cy="28" r="0.8" fill="rgba(255, 255, 255, 0.04)" />
    <!-- Music notes -->
    <path d="M 68,36 V 28 L 74,26 V 30 M 68,31 L 74,29" />
    <circle cx="66" cy="36" r="2" />
    <circle cx="72" cy="34" r="2" />
    <!-- Coffee Mug -->
    <path d="M 10,50 H 18 V 55 A 3,3 0 0 1 15,58 H 13 A 3,3 0 0 1 10,55 Z" />
    <path d="M 18,51 C 20,51 20,54 18,54" />
    <!-- Checkmark -->
    <path d="M 80,75 L 83,78 L 88,72" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>`;

const WHATSAPP_LIGHT_DOODLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
  <g fill="none" stroke="rgba(0, 0, 0, 0.042)" stroke-width="0.8">
    <!-- Bubble -->
    <path d="M 8,10 H 20 A 2,2 0 0 1 22,12 V 18 A 2,2 0 0 1 20,20 H 13 L 10,23 V 20 A 2,2 0 0 1 8,18 V 12 A 2,2 0 0 1 8,10 Z" />
    <!-- Telephone -->
    <rect x="58" y="10" width="8" height="15" rx="1.5" />
    <circle cx="62" cy="22" r="0.8" />
    <line x1="60" y1="12" x2="64" y2="12" />
    <!-- Star -->
    <path d="M 38,12 L 40,16 L 44,16 L 41,19 L 42,23 L 38,21 L 34,23 L 35,19 L 32,16 L 36,16 Z" />
    <!-- Heart -->
    <path d="M 15,75 C 13,73 10,73 10,75.5 C 10,78 13.5,81 15,82 C 16.5,81 20,78 20,75.5 C 20,73 17,73 15,75 Z" />
    <!-- Camera -->
    <rect x="35" y="48" width="10" height="7" rx="1" />
    <circle cx="40" cy="51.5" r="2" />
    <path d="M 38,48 L 39,46 H 41 L 42,48 Z" />
    <!-- ID Card / DNI badge -->
    <rect x="55" y="48" width="14" height="10" rx="1.5" />
    <line x1="58" y1="51" x2="62" y2="51" />
    <line x1="58" y1="54" x2="66" y2="54" />
    <circle cx="65" cy="51" r="1" />
    <!-- Smiley Smile -->
    <path d="M 12,32 A 4,4 0 0,0 20,32" stroke-linecap="round" />
    <circle cx="14" cy="28" r="0.8" fill="rgba(0, 0, 0, 0.04)" />
    <circle cx="18" cy="28" r="0.8" fill="rgba(0, 0, 0, 0.04)" />
    <!-- Music notes -->
    <path d="M 68,36 V 28 L 74,26 V 30 M 68,31 L 74,29" />
    <circle cx="66" cy="36" r="2" />
    <circle cx="72" cy="34" r="2" />
    <!-- Coffee Mug -->
    <path d="M 10,50 H 18 V 55 A 3,3 0 0 1 15,58 H 13 A 3,3 0 0 1 10,55 Z" />
    <path d="M 18,51 C 20,51 20,54 18,54" />
    <!-- Checkmark -->
    <path d="M 80,75 L 83,78 L 88,72" stroke-linecap="round" stroke-linejoin="round" />
  </g>
</svg>`;

const compressImage = (base64Str: string, maxDim: number = 1200): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str || typeof base64Str !== 'string') {
      resolve(base64Str);
      return;
    }
    if (base64Str.startsWith('data:image/svg+xml')) {
      resolve(base64Str);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
    img.src = base64Str;
  });
};

const handleApiResponseError = async (res: Response, defaultMessage: string): Promise<never> => {
  let errMsg = defaultMessage;
  try {
    const errPayload = await res.json().catch(() => ({}));
    const detailsText = String(errPayload.details || errPayload.error || "");
    if (
      detailsText.toLowerCase().includes('api_key') || 
      detailsText.toLowerCase().includes('apikey') || 
      detailsText.toLowerCase().includes('key not') || 
      detailsText.toLowerCase().includes('invalid key') ||
      detailsText.toLowerCase().includes('api key') ||
      detailsText.toLowerCase().includes('authorized')
    ) {
      errMsg = `Error de API Key de Gemini: La clave de API de Gemini provista es inválida o no cuenta con permisos de ejecución. Verificá que la variable de entorno GEMINI_API_KEY esté correctamente configurada en tus variables de Vercel (o en Settings de AI Studio) sin espacios ni caracteres extraños.`;
    } else if (
      detailsText.toLowerCase().includes('quota') || 
      detailsText.toLowerCase().includes('rate limit') || 
      detailsText.toLowerCase().includes('limit exceeded') || 
      detailsText.toLowerCase().includes('429')
    ) {
      errMsg = `Límite de Cuotas / Rate Limit Excedido: Has superado la cuota de pedidos correspondiente a tu API Key de Gemini free-tier. Por favor, aguarda un minuto (60 segundos) para que se reestablezca la tasa y vuelve a intentar.`;
    } else if (detailsText) {
      errMsg = `Error del servicio de IA: ${detailsText}`;
    }
  } catch (parseErr) {
    // Ignore and proceed with default message
  }
  throw new Error(errMsg);
};

export default function App() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('case_success');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'logs' | 'code' | 'variables'>('logs');
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<'selfie_with_dni' | 'dni_front'>('selfie_with_dni');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  
  // Real-time API Key Connection state
  const [apiHealth, setApiHealth] = useState<{
    status: 'checking' | 'ok' | 'error';
    hasApiKey: boolean;
    maskedKey: string;
    checked: boolean;
  }>({
    status: 'checking',
    hasApiKey: false,
    maskedKey: 'Verificando...',
    checked: false
  });

  // Query server api health on mount
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => {
        setApiHealth({
          status: data.hasApiKey ? 'ok' : 'error',
          hasApiKey: !!data.hasApiKey,
          maskedKey: data.maskedKey || 'No configurada',
          checked: true
        });
      })
      .catch(err => {
        console.error("Error verifying Gemini API health:", err);
        setApiHealth({
          status: 'error',
          hasApiKey: false,
          maskedKey: 'Error de conexión',
          checked: true
        });
      });
  }, []);
  
  // Local states that synchronize when changing scenario contacts
  const [activeHistory, setActiveHistory] = useState<ScenarioHistory>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize sandboxed histories for each preset scenario on mount
  useEffect(() => {
    const initialHistory: ScenarioHistory = {};
    PRESET_SCENARIOS.forEach(scenario => {
      initialHistory[scenario.id] = {
        messages: [
          {
            id: 'init_msg_1',
            sender: 'bot',
            timestamp: getFormattedTime(),
            text: `¡Hola! Te damos la bienvenida al servicio de validación de identidad automática. 💳\n\nPara iniciar tu proceso de onboarding, por favor envíanos una **foto selfie tuya sosteniendo tu DNI pegado al lado DERECHO del rostro** (en el lado derecho según se visualiza la foto). Asegúrate de que el fondo sea claro, de tener buena iluminación y que los datos del documento no salgan borrosos.`,
            status: 'processed'
          }
        ],
        state: {
          currentStep: 'waiting_selfie',
          dni_selfie_status: 'pending',
          dni_selfie_reasons: '',
          dni_front_status: 'pending',
          dni_data: null,
          biometric_status: 'pending',
          biometric_score: 0,
          biometric_details: '',
          selfie_image: null,
          dni_image: null
        },
        lastSelfieResult: null,
        lastDniResult: null,
        lastComparisonResult: null
      };
    });
    setActiveHistory(initialHistory);
  }, []);

  // Set selected scenario's states
  const currentScenario = PRESET_SCENARIOS.find(s => s.id === activeScenarioId) || PRESET_SCENARIOS[0];
  const currentChat = activeHistory[activeScenarioId] || {
    messages: [],
    state: {
      currentStep: 'waiting_selfie',
      dni_selfie_status: 'pending',
      dni_selfie_reasons: '',
      dni_front_status: 'pending',
      dni_data: null,
      biometric_status: 'pending',
      biometric_score: 0,
      biometric_details: '',
      selfie_image: null,
      dni_image: null
    },
    lastSelfieResult: null,
    lastDniResult: null,
    lastComparisonResult: null
  };

  const currentMessages = currentChat.messages;
  const botmakerState = currentChat.state;

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isTyping]);

  function getFormattedTime() {
    const date = new Date();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Update sandbox history for the current active scenario
  const updateCurrentHistory = (update: Partial<typeof currentChat>) => {
    setActiveHistory(prev => ({
      ...prev,
      [activeScenarioId]: {
        ...prev[activeScenarioId],
        ...update
      }
    }));
  };

  const updateCurrentState = (stateChange: Partial<BotmakerState>) => {
    updateCurrentHistory({
      state: {
        ...currentChat.state,
        ...stateChange
      }
    });
  };

  // Helper trigger to simulate Bot answering loader and delay
  const appendBotMessage = (text: string, image?: string) => {
    const newMsg: Message = {
      id: Math.random().toString(),
      sender: 'bot',
      timestamp: getFormattedTime(),
      text,
      image,
      status: 'processed'
    };
    updateCurrentHistory({
      messages: [...currentChat.messages, newMsg]
    });
  };

  // MAIN PIPELINE PROCESSORS: Sends base64 image data to Real Gemini backend endpoints
  
  // Stage 1: Validate selfie image
  const processSelfieImage = async (rawBase64Image: string) => {
    setIsTyping(true);
    let base64Image = rawBase64Image;
    try {
      base64Image = await compressImage(rawBase64Image);
    } catch (compressErr) {
      console.warn("Error compressing selfie, using original", compressErr);
    }

    updateCurrentState({ 
      selfie_image: base64Image,
      currentStep: 'greeting' // state tracking loader
    });

    // Add user's message showing image
    const userMsgId = 'selfie_' + Math.random().toString();
    const newMessages: Message[] = [
      ...currentMessages,
      {
        id: userMsgId,
        sender: 'user',
        timestamp: getFormattedTime(),
        text: '🤳 He enviado mi selfie con el DNI.',
        image: base64Image,
        imageType: 'selfie_with_dni',
        status: 'sending'
      }
    ];
    updateCurrentHistory({ messages: newMessages });

    try {
      // Call server end point
      const res = await fetch('/api/validate-selfie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });

      if (!res.ok) {
        await handleApiResponseError(res, 'Fallo en el servicio de validación de selfie.');
      }

      const evaluation: SelfieValidation = await res.json();

      // Format updated user message status
      const updatedMessages = newMessages.map(m => m.id === userMsgId ? { ...m, status: 'processed' as const } : m);

      if (evaluation.valid) {
        // Approval branch
        const botText = `✅ **¡Selfie Validada Correctamente!**\n\nHemos verificado la concordancia y visibilidad de tu rostro y el DNI en la posición correcta.\n\nAhora para rellenar tus datos personales, por favor envíanos una **foto clara únicamente del FRENTE de tu DNI Argentino**.`;
        const updatedMsgs = [...updatedMessages, {
          id: Math.random().toString(),
          sender: 'bot' as const,
          timestamp: getFormattedTime(),
          text: botText,
          status: 'processed' as const
        }];

        updateCurrentHistory({
          messages: updatedMsgs,
          lastSelfieResult: evaluation,
          state: {
            ...botmakerState,
            currentStep: 'waiting_dni_front',
            dni_selfie_status: 'approved',
            dni_selfie_reasons: '',
            selfie_image: base64Image
          }
        });
      } else {
        // Rejection branch
        const reasonsStr = evaluation.reasons.join(', ');
        const botText = `❌ **Validación de Identidad Rechazada**\n\nNo logramos validar la selfie por los siguientes motivos:\n• ${evaluation.reasons.join('\n• ')}\n\nPor favor, vuelve a tomarte la foto sosteniendo el documento a tu **DERECHA** visual, con fondo claro y nítido para continuar.`;
        
        const updatedMsgs = [...updatedMessages, {
          id: Math.random().toString(),
          sender: 'bot' as const,
          timestamp: getFormattedTime(),
          text: botText,
          status: 'processed' as const
        }];

        updateCurrentHistory({
          messages: updatedMsgs,
          lastSelfieResult: evaluation,
          state: {
            ...botmakerState,
            currentStep: 'waiting_selfie',
            dni_selfie_status: 'rejected',
            dni_selfie_reasons: reasonsStr,
            selfie_image: null
          }
        });
      }
    } catch (err: any) {
      console.error(err);
      appendBotMessage(`⚠️ Disculpa, ocurrió un error procesando tu selfie: *${err.message || err}*. Por favor, reintenta.`);
    } finally {
      setIsTyping(false);
    }
  };

  // Stage 2: OCR front extraction and Biometric Face Comparison matching
  const processDniFrontImage = async (rawBase64Image: string) => {
    setIsTyping(true);
    let base64Image = rawBase64Image;
    try {
      base64Image = await compressImage(rawBase64Image);
    } catch (compressErr) {
      console.warn("Error compressing DNI, using original", compressErr);
    }

    updateCurrentState({ 
      dni_image: base64Image,
      currentStep: 'comparing' // tracking loader
    });

    // Add user's message showing image
    const userMsgId = 'dni_' + Math.random().toString();
    const newMessages: Message[] = [
      ...currentMessages,
      {
        id: userMsgId,
        sender: 'user',
        timestamp: getFormattedTime(),
        text: '💳 He enviado la foto del frente de mi DNI.',
        image: base64Image,
        imageType: 'dni_front',
        status: 'sending'
      }
    ];
    updateCurrentHistory({ messages: newMessages });

    try {
      // 1. Call DNI front extraction OCR
      const ocrRes = await fetch('/api/extract-dni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });

      if (!ocrRes.ok) {
        await handleApiResponseError(ocrRes, 'Fallo en el servicio OCR de extracción del documento.');
      }

      const ocrData: DniFrontExtraction = await ocrRes.json();
      
      // Update message status to processed
      let updatedMessages = newMessages.map(m => m.id === userMsgId ? { ...m, status: 'processed' as const } : m);

      if (!ocrData.is_argentinian_dni_front) {
        // Document invalid type
        const botText = `❌ **Documento Incorrecto o No Reconocido**\n\nEl documento cargado no parece ser el frente de un **DNI Nacional de Identidad de Argentina**.\n\nPor favor, asegúrate de subir la foto solicitada (el frente de la tarjeta celeste/física de DNI nacional) para continuar con el trámite.`;
        
        updateCurrentHistory({
          messages: [...updatedMessages, {
            id: Math.random().toString(),
            sender: 'bot' as const,
            timestamp: getFormattedTime(),
            text: botText,
            status: 'processed' as const
          }],
          lastDniResult: ocrData,
          state: {
            ...botmakerState,
            currentStep: 'waiting_dni_front',
            dni_front_status: 'rejected',
            dni_image: null
          }
        });
        setIsTyping(false);
        return;
      }

      // If document is valid, display extracted details table to user
      const infoTableText = `📝 **Datos del DNI Extraídos Exitosamente:**\n\n` +
        `• **Apellidos:** \`${ocrData.apellido || 'Ilegible'}\`\n` +
        `• **Nombres:** \`${ocrData.nombres || 'Ilegible'}\`\n` +
        `• **Número DNI:** \`${ocrData.dni || 'Ilegible'}\`\n` +
        `• **Sexo:** \`${ocrData.sexo || 'Ilegible'}\`\n` +
        `• **Fecha Nacim.:** \`${ocrData.fecha_nacimiento || 'Ilegible'}\`\n` +
        `• **Fecha Emisión:** \`${ocrData.fecha_emision || 'Ilegible'}\`\n` +
        `• **Vencimiento:** \`${ocrData.fecha_vencimiento || 'Ilegible'}\`\n` +
        `\n\n⚡ *Iniciando cotejo biométrico automático entre el rostro de tu Selfie y tu fotografía del DNI...*`;

      updatedMessages = [...updatedMessages, {
        id: 'ocr_report_' + Math.random().toString(),
        sender: 'bot' as const,
        timestamp: getFormattedTime(),
        text: infoTableText,
        status: 'processed' as const
      }];

      updateCurrentHistory({
        messages: updatedMessages,
        lastDniResult: ocrData,
        state: {
          ...botmakerState,
          dni_front_status: 'approved',
          dni_data: ocrData,
          dni_image: base64Image
        }
      });

      // 2. Immediate continuous flow step: Face Comparison
      if (botmakerState.selfie_image) {
        setIsTyping(true); // reset writing loader

        const compRes = await fetch('/api/compare-faces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            selfie: botmakerState.selfie_image, 
            dniFront: base64Image 
          })
        });

        if (!compRes.ok) {
          await handleApiResponseError(compRes, 'No se pudo completar la comparación de reconocimiento facial.');
        }

        const comparison: FaceComparison = await compRes.json();

        let finalBotMessage = "";
        let finalStep: BotmakerState['currentStep'] = 'completed';
        let bioStatus: BotmakerState['biometric_status'] = 'pending';

        if (comparison.match) {
          bioStatus = 'match';
          finalBotMessage = `👤 **Cotejo Biométrico Exitoso (Similitud: ${comparison.similarity_score}%)**\n\nEl sistema confirmó con alto índice de confianza de que eres la misma persona.\n\n${comparison.details}\n\n🎉 **¡Identidad validada con éxito en Botmaker!** Hemos finalizado el onboarding exitosamente y tus datos están resguardados para dar de alta tu cuenta.`;
        } else {
          bioStatus = 'no_match';
          finalStep = 'failed';
          finalBotMessage = `⚠️ **Advertencia de Biometría (Similitud: ${comparison.similarity_score}%)**\n\nLas facciones entre tu selfie y la foto del DNI muestran discrepancias:\n• ${comparison.reasons.join('\n• ')}\n\nNuestros analistas revisarán el trámite de forma manual en la cónsola de Botmaker para aprobar tu alta.`;
        }

        updateCurrentHistory({
          messages: [...updatedMessages, {
            id: 'compare_report_' + Math.random().toString(),
            sender: 'bot' as const,
            timestamp: getFormattedTime(),
            text: finalBotMessage,
            status: 'processed' as const
          }],
          lastComparisonResult: comparison,
          state: {
            ...botmakerState,
            currentStep: finalStep,
            dni_front_status: 'approved',
            dni_data: ocrData,
            biometric_status: bioStatus,
            biometric_score: comparison.similarity_score,
            biometric_details: comparison.details,
            dni_image: base64Image
          }
        });
      }

    } catch (err: any) {
      console.error(err);
      appendBotMessage(`⚠️ Disculpa, ocurrió un error procesando el DNI: *${err.message || err}*. Intenta de nuevo.`);
    } finally {
      setIsTyping(false);
    }
  };

  // Triggered when clicking a preset case from the left list. Auto-runs the conversation
  const handleSelectScenario = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    setActiveConsoleTab('logs');
  };

  // Reset current scenario conversation and variables
  const handleResetScenario = () => {
    const freshHistory = {
      messages: [
        {
          id: 'init_msg_1',
          sender: 'bot' as const,
          timestamp: getFormattedTime(),
          text: `¡Hola! Te damos la bienvenida al servicio de validación de identidad automática. 💳\n\nPara iniciar tu proceso de onboarding, por favor envíanos una **foto selfie tuya sosteniendo tu DNI pegado al lado DERECHO del rostro** (en el lado derecho según se visualiza la foto). Asegúrate de que el fondo sea claro, de tener buena iluminación y que los datos del documento no salgan borrosos.`,
          status: 'processed' as const
        }
      ],
      state: {
        currentStep: 'waiting_selfie' as const,
        dni_selfie_status: 'pending' as const,
        dni_selfie_reasons: '',
        dni_front_status: 'pending' as const,
        dni_data: null,
        biometric_status: 'pending' as const,
        biometric_score: 0,
        biometric_details: '',
        selfie_image: null,
        dni_image: null
      },
      lastSelfieResult: null,
      lastDniResult: null,
      lastComparisonResult: null
    };

    setActiveHistory(prev => ({
      ...prev,
      [activeScenarioId]: freshHistory
    }));
  };

  // Fast Auto-Complete Step buttons using preset files
  const triggerPresetSelfie = async () => {
    try {
      setIsTyping(true);
      const dataUrl = await svgToDataUrl(currentScenario.selfieSvg);
      await processSelfieImage(dataUrl);
    } catch (err) {
      console.error(err);
      setIsTyping(false);
    }
  };

  const triggerPresetDni = async () => {
    try {
      setIsTyping(true);
      const dataUrl = await svgToDataUrl(currentScenario.dniSvg);
      await processDniFrontImage(dataUrl);
    } catch (err) {
      console.error(err);
      setIsTyping(false);
    }
  };

  // Native input file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (botmakerState.currentStep === 'waiting_selfie') {
        processSelfieImage(base64);
      } else if (botmakerState.currentStep === 'waiting_dni_front') {
        processDniFrontImage(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* 3 COLUMN GRID WRAPPER */}
      <div className="grid grid-cols-1 md:grid-cols-12 w-full h-full">
        
        {/* COLUMN 1: LEFT PANEL - Presets & Scenario Picker (WhatsApp Chat Contacts simulation) */}
        <div className="md:col-span-3 border-r border-slate-850 bg-[#111b21] flex flex-col h-full overflow-hidden">
          {/* Logo Brand Header */}
          <div className="px-4 py-4.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-bold text-sm sm:text-base leading-none">Validator Pro</h1>
                <span className="text-[10px] text-emerald-400 font-medium">WhatsApp Simulator</span>
              </div>
            </div>
            
            <button
              onClick={handleResetScenario}
              title="Resetear canal actual"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Search bar mock */}
          <div className="px-3.5 py-2.5 bg-[#111b21] border-b border-slate-850">
            <div className="relative flex items-center bg-slate-950 rounded-xl px-3 py-1.5 border border-slate-800">
              <Search className="h-3.5 w-3.5 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Buscar caso de prueba..." 
                className="w-full bg-transparent text-xs text-slate-300 placeholder-slate-500 outline-none"
                disabled 
              />
            </div>
          </div>

          {/* Contacts List header */}
          <div className="px-4 py-2 bg-slate-950/20 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Casos Demo (WhatsApp Contacts)
          </div>

          {/* Scenario Picker items mapped */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-850/50 bg-[#111b21]">
            {PRESET_SCENARIOS.map((scenario) => {
              const isActive = scenario.id === activeScenarioId;
              const hasRunSelfie = activeHistory[scenario.id]?.state?.dni_selfie_status !== 'pending';
              const hasRunDni = activeHistory[scenario.id]?.state?.dni_front_status !== 'pending';
              
              return (
                <button
                  key={scenario.id}
                  onClick={() => handleSelectScenario(scenario.id)}
                  className={`w-full text-left px-3.5 py-3.5 flex items-start gap-3 transition-all relative ${
                    isActive 
                      ? 'bg-slate-800 border-l-4 border-emerald-500' 
                      : 'hover:bg-slate-800/40 border-l-4 border-transparent'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`h-11 w-11 rounded-full flex items-center justify-center ${
                      scenario.id === 'case_success' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : scenario.id === 'case_wrong_side' 
                        ? 'bg-purple-500/10 text-purple-400' 
                        : scenario.id === 'case_blurry' 
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      <User className="h-5 w-5" />
                    </div>
                    {/* Status Badge marker */}
                    <div className="absolute -bottom-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-950 border border-slate-900 text-[8px]">
                      {hasRunDni ? '🟢' : hasRunSelfie ? '🟡' : '⚪'}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-xs truncate text-slate-200">
                        {scenario.name.split(':')[1]?.trim() || scenario.name}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                        scenario.id === 'case_success' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {scenario.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 leading-normal">
                      {scenario.description}
                    </p>
                    <span className="text-[9px] text-indigo-400 font-medium block mt-1">
                      {scenario.id === 'case_success' ? '✔ Espera Éxito' : '✖ Espera Rechazo'}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 flex-shrink-0 self-center" />
                </button>
              );
            })}
          </div>

          {/* Platform banner footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-400 flex flex-col gap-1 font-sans">
            <span className="font-semibold text-slate-200 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-yellow-400" />
              Demo de Onboarding KYC
            </span>
            <p className="leading-normal text-slate-400">
              Cada contacto simula una persona que ingresa al canal de WhatsApp. El bot responde con el LLM en tiempo real.
            </p>
          </div>
        </div>

        {/* COLUMN 2: CENTER PANEL - WhatsApp UI Web Client */}
        <div className="md:col-span-5 flex flex-col h-full bg-[#efeae2] relative border-r border-[#e9edef]">
          
          {/* Header Info */}
          <div className="px-4 py-3 bg-[#f0f2f5] border-b border-[#e9edef] flex items-center justify-between shadow-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#008069] to-[#00a884] flex items-center justify-center text-white text-xs font-bold shadow-md">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-[#00e676] border-2 border-[#f0f2f5]"></div>
              </div>
              
              <div className="text-left">
                <h3 className="font-extrabold text-xs sm:text-sm text-[#111b21] flex items-center gap-1.5 leading-none">
                  Identidad - Botmaker Onboarding
                  <UserCheck className="h-3.5 w-3.5 text-[#008069]" />
                </h3>
                <span className="text-[10px] text-[#008069] font-bold">Empresa Onboarding Activa • En Línea</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-500">
              <VideoIcon className="h-4.5 w-4.5 hover:text-slate-800 cursor-not-allowed hidden sm:block" />
              <Phone className="h-4 w-4 hover:text-slate-800 cursor-not-allowed hidden sm:block" />
              <MoreVertical className="h-4.5 w-4.5 cursor-pointer hover:text-slate-800" />
            </div>
          </div>

          {/* WhatsApp Chat Wall Wallpaper */}
          <div 
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-h-[calc(100vh-130px)] scrollbar-thin flex flex-col relative"
            style={{ 
              backgroundImage: `url("data:image/svg+xml;base64,${btoa(WHATSAPP_LIGHT_DOODLE_SVG)}")`,
              backgroundColor: '#efeae2',
              backgroundSize: '120px 120px',
              backgroundRepeat: 'repeat'
            }}
          >
            {/* Disclaimer banner */}
            <div className="mx-auto text-center max-w-sm">
              <span className="inline-block text-[10px] bg-[#ffe596]/45 text-[#654e0c] border border-[#f5cc5c]/35 font-semibold px-3 py-1.5 rounded-lg leading-relaxed shadow-sm">
                🔒 Las conversaciones están cifradas simulando el Webhook seguro de Botmaker ARG.
              </span>
            </div>

            {/* Render conversation messages */}
            {currentMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`relative max-w-[85%] rounded-xl px-3.5 py-2.5 shadow-sm border ${
                    isUser 
                      ? 'bg-[#d9fdd3] text-[#111b21] border-[#c7f4bf]/30 rounded-tr-none' 
                      : 'bg-[#ffffff] text-[#111b21] border-[#e9edef] rounded-tl-none'
                  }`}>
                    {/* Render Image attached */}
                    {msg.image && (
                      <div className="rounded-lg overflow-hidden border border-slate-200 mb-2 max-w-xs aspect-video bg-neutral-100 flex items-center justify-center">
                        <img 
                          src={msg.image} 
                          alt="adjunto whatsapp" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}

                    {/* Rendering textual bubble contents */}
                    <div className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans text-left">
                      {msg.text?.startsWith('✅') || msg.text?.startsWith('❌') || msg.text?.startsWith('📝') || msg.text?.startsWith('👤') ? (
                        <div className="space-y-1">
                          {/* Parse simple markdown replacements for pretty labels */}
                          {msg.text.split('\n').map((line, i) => {
                            if (line.startsWith('•')) {
                              return <p key={i} className={`pl-3 relative before:content-['•'] before:absolute before:left-0 ${isUser ? 'before:text-emerald-700' : 'before:text-[#008069]'}`}>{line.replace('•', '').trim()}</p>;
                            }
                            // check for strong headers
                            if (line.includes('**')) {
                              const parts = line.split('**');
                              return (
                                <p key={i}>
                                  {parts[0]}
                                  <strong className={`font-extrabold ${isUser ? 'text-emerald-800' : 'text-[#008069]'}`}>{parts[1]}</strong>
                                  {parts[2]}
                                </p>
                              );
                            }
                            return <p key={i}>{line}</p>;
                          })}
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>

                    {/* Timestamp & checks */}
                    <div className="flex items-center justify-end gap-1 mt-1 font-mono text-[9px] text-[#667781]">
                      <span>{msg.timestamp}</span>
                      {isUser && (
                        <span>
                          {msg.status === 'sending' ? (
                            <span className="text-slate-400">🕒</span>
                          ) : msg.status === 'processed' ? (
                            <CheckCheck className="h-3 w-3 text-[#53bdeb] inline font-bold" />
                          ) : (
                            <CheckCheck className="h-3 w-3 text-slate-400 inline" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Typing Loader / Processing */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#ffffff] border border-[#e9edef] rounded-xl px-4 py-3 text-[#111b21] shadow-sm rounded-tl-none text-xs flex items-center gap-2.5">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-[#00a884] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="italic font-sans text-slate-500 font-medium">
                    {botmakerState.currentStep === 'waiting_selfie' 
                      ? 'Botmaker validando selfie con IA...' 
                      : botmakerState.currentStep === 'waiting_dni_front'
                      ? 'Botmaker extrayendo DNI y cotejando rostro...'
                      : 'Botmaker procesando...'}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-[#f0f2f5]/90 rounded-xl p-4 border border-slate-200/80 text-left space-y-2.5 mt-4 font-sans shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <h4 className="text-[11px] font-extrabold text-[#008069] flex items-center gap-1.5 uppercase tracking-wide">
                  <Info className="h-4 w-4" />
                  Guía de Copiloto para Demo de Equipo:
                </h4>
                
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                  apiHealth.status === 'checking' 
                    ? 'bg-amber-50 text-amber-700 border-amber-200' 
                    : apiHealth.status === 'ok' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  <Key className="h-3 w-3" />
                  <span className="font-mono">
                    AI Key: {apiHealth.status === 'checking' ? 'Espere...' : apiHealth.status === 'ok' ? `${apiHealth.maskedKey} ✓` : 'Sin configurar ✗'}
                  </span>
                </div>
              </div>

              {/* Aviso de Procesamiento Efímero / Privacidad */}
              <div className="flex items-start gap-2 bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-lg text-[10.5px] leading-relaxed text-amber-800/90">
                <span className="text-base leading-none select-none mt-0.5">🔒</span>
                <div>
                  <strong className="font-semibold text-amber-900 block mb-0.5">Privacidad Garantizada:</strong>
                  Esta demostración procesa todas las imágenes y datos recopilados de manera <strong>100% efímera en memoria</strong>. Ninguna foto de webcam, archivo de imagen, dato personal extraído o resultado de coincidencia biométrica se almacena, guarda ni persiste en base de datos o almacenamiento físico. Al actualizar el navegador o vaciar la conversación, toda la información se elimina definitivamente.
                </div>
              </div>
              
              {botmakerState.currentStep === 'waiting_selfie' && (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-600 leading-snug">
                    El Bot está esperando que el usuario mande su **Selfie sosteniendo el DNI**. Tenés tres formas de testear:
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <button
                      onClick={triggerPresetSelfie}
                      className="flex items-center gap-1 bg-[#008069] text-white font-bold text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg hover:bg-[#005c4b] transition-all shadow-sm"
                    >
                      💡 Enviar Selfie de Caso
                    </button>
                    <button
                      onClick={() => { setCameraMode('selfie_with_dni'); setShowCamera(true); }}
                      className="flex items-center gap-1.5 bg-white text-slate-700 border border-slate-300 text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition"
                    >
                      <Camera className="h-3.5 w-3.5" /> Usar Webcam
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 bg-white text-slate-700 border border-slate-300 text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition"
                    >
                      <Upload className="h-3.5 w-3.5" /> Subir Imagen
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-800 font-medium italic">
                    {currentScenario.expectedBehavior}
                  </p>
                </div>
              )}

              {botmakerState.currentStep === 'waiting_dni_front' && (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-600 leading-snug">
                    ¡La selfie fue aprobada! Ahora la IA requiere del **Frente del DNI** para extraer los datos mediante su de visión OCR. Elegí:
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <button
                      onClick={triggerPresetDni}
                      className="flex items-center gap-1 bg-[#008069] text-white font-bold text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg hover:bg-[#005c4b] transition-all shadow-sm"
                    >
                      💡 Enviar Frente de Caso
                    </button>
                    <button
                      onClick={() => { setCameraMode('dni_front'); setShowCamera(true); }}
                      className="flex items-center gap-1.5 bg-white text-slate-700 border border-slate-300 text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition"
                    >
                      <Camera className="h-3.5 w-3.5" /> Usar Webcam
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 bg-white text-slate-700 border border-slate-300 text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition"
                    >
                      <Upload className="h-3.5 w-3.5" /> Subir Imagen
                    </button>
                  </div>
                </div>
              )}

              {botmakerState.currentStep === 'completed' && (
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <p className="text-[#008069] font-extrabold uppercase flex items-center gap-1 text-xs">
                    <span className="h-2 w-2 rounded-full bg-[#00e676] animate-ping"></span>
                    PROCESO COMPLETADO Y APROBADO
                  </p>
                  <p>Todos los pasos de KYC se cumplieron satisfactoriamente. Para probar otro flujo, cambiá de contacto en la barra izquierda o presioná el botón de reinicio.</p>
                  <button 
                    onClick={handleResetScenario}
                    className="mt-1.5 text-[10px] px-3 py-1.5 bg-[#008069] text-white rounded hover:bg-[#005c4b] font-bold transition shadow-sm"
                  >
                    Probar el mismo caso de nuevo
                  </button>
                </div>
              )}

              {botmakerState.currentStep === 'failed' && (
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  <p className="text-[#d32f2f] font-extrabold uppercase text-xs">
                    🔴 PROCESO DETENIDO CON RECHAZOS
                  </p>
                  <p>La IA identificó anomalías que impidieron el onboarding automatizado. Por reglamentaciones de compliance se reenvía a resolución de agente manual.</p>
                  <button 
                    onClick={handleResetScenario}
                    className="mt-1.5 text-[10px] px-3 py-1.5 bg-[#008069] text-white rounded hover:bg-[#005c4b] font-bold transition shadow-sm"
                  >
                    Reiniciar conversación
                  </button>
                </div>
              )}

            </div>

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT MESSAGE CONTAINER */}
          <div className="p-3 bg-[#f0f2f5] border-t border-slate-200/80 flex items-center gap-3.5 flex-shrink-0">
            {/* hidden upload input */}
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden" 
            />

            <button 
              onClick={() => fileInputRef.current?.click()}
              title="Adjuntar Foto DNI/Selfie"
              className="p-1.5 text-slate-500 hover:text-[#008069] transition hover:scale-105"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            <button
              onClick={() => {
                const currentMode = botmakerState.currentStep === 'waiting_dni_front' ? 'dni_front' : 'selfie_with_dni';
                setCameraMode(currentMode);
                setShowCamera(true);
              }}
              title="Abrir Cámara"
              className="p-1.5 text-slate-500 hover:text-[#008069] transition hover:scale-105"
            >
              <Camera className="h-5.5 w-5.5" />
            </button>

            <div className="flex-1 bg-white rounded-xl px-4 py-2 border border-slate-200">
              <input 
                type="text" 
                placeholder={
                  botmakerState.currentStep === 'waiting_selfie' 
                    ? 'Subí tu Selfie o haz clic en "Enviar Selfie de Caso"...' 
                    : botmakerState.currentStep === 'waiting_dni_front'
                    ? 'Subí tu DNI o haz clic en "Enviar Frente de Caso"...'
                    : 'Onboarding completado/detenido'
                }
                className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder-slate-400 text-slate-800"
                disabled
              />
            </div>

            <button 
              className="h-9 w-9 rounded-full bg-[#008069] text-white flex items-center justify-center font-bold hover:scale-105 hover:bg-[#005c4b] cursor-not-allowed"
              disabled
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>

        </div>

        {/* COLUMN 3: RIGHT PANEL - Logging and Node.js Code panel */}
        <div className="md:col-span-4 h-full overflow-hidden">
          <BotmakerConsole 
            botmakerState={botmakerState}
            activeTab={activeConsoleTab}
            setActiveTab={setActiveConsoleTab}
            lastSelfieResult={currentChat.lastSelfieResult}
            lastDniResult={currentChat.lastDniResult}
            lastComparisonResult={currentChat.lastComparisonResult}
            loadingSelfie={isTyping && botmakerState.currentStep === 'greeting'}
            loadingDni={isTyping && botmakerState.currentStep === 'comparing' && !botmakerState.dni_data}
            loadingCompare={isTyping && botmakerState.currentStep === 'comparing' && !!botmakerState.dni_data}
          />
        </div>

      </div>

      {/* CAMERA WIDGET OVERLAY */}
      {showCamera && (
        <CameraCapture 
          mode={cameraMode}
          onCapture={(capturedBase64) => {
            setShowCamera(false);
            if (cameraMode === 'selfie_with_dni') {
              processSelfieImage(capturedBase64);
            } else {
              processDniFrontImage(capturedBase64);
            }
          }}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
