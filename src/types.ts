export interface Message {
  id: string;
  sender: 'user' | 'bot';
  timestamp: string;
  text?: string;
  image?: string; // Base64 or URL
  imageType?: 'selfie_with_dni' | 'dni_front' | 'unknown';
  status?: 'sending' | 'delivered' | 'processed' | 'failed';
  feedback?: string;
}

export interface SelfieValidation {
  valid: boolean;
  person_visible: boolean;
  face_visible: boolean;
  dni_visible: boolean;
  dni_on_right_side: boolean;
  image_blurry: boolean;
  background_clear: boolean;
  confidence: number;
  reasons: string[];
}

export interface DniFrontExtraction {
  is_argentinian_dni_front: boolean;
  apellido: string;
  nombres: string;
  dni: string;
  sexo: string;
  fecha_nacimiento: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  confidence: number;
  missing_fields: string[];
}

export interface FaceComparison {
  match: boolean;
  similarity_score: number;
  details: string;
  reasons: string[];
}

export interface BotmakerState {
  currentStep: 'greeting' | 'waiting_selfie' | 'waiting_dni_front' | 'comparing' | 'completed' | 'failed';
  dni_selfie_status: 'pending' | 'approved' | 'rejected';
  dni_selfie_reasons: string;
  dni_front_status: 'pending' | 'approved' | 'rejected';
  dni_data: DniFrontExtraction | null;
  biometric_status: 'pending' | 'match' | 'no_match';
  biometric_score: number;
  biometric_details: string;
  selfie_image: string | null;
  dni_image: string | null;
}

export interface PresetScenario {
  id: string;
  name: string;
  description: string;
  tag: string;
  selfieSvg: string; // SVG string for selfie
  selfieTitle: string;
  dniSvg: string;    // SVG string for DNI front
  dniTitle: string;
  expectedBehavior: string;
}
