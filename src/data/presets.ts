import { PresetScenario } from "../types";

// Helper to convert SVG strings into base64 JPEGs via browser Canvas element
export function svgToDataUrl(svgString: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 350;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw white background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
        URL.revokeObjectURL(url);
      } else {
        reject(new Error('No se pudo obtener el contexto 2D de canvas'));
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = (err) => {
      reject(err);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

// 4 distinct test scenarios
export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'case_success',
    name: 'Caso 1: Onboarding Perfecto 🟢',
    description: 'Selfie con DNI del lado derecho y foto de DNI legible de Juan Pérez. Debería aprobar todo.',
    tag: 'Aprobado',
    selfieTitle: 'Selfie Correcta - Juan Pérez',
    selfieSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350" width="100%" height="100%">
      <!-- Clear neutral background -->
      <rect width="100%" height="100%" fill="#E2E8F0" />
      <text x="20" y="30" font-family="'Inter', sans-serif" font-size="12" fill="#64748B" font-weight="600">CASO 1: SELFIE DE PRUEBA (OK)</text>
      
      <!-- Room elements / background clear -->
      <line x1="0" y1="280" x2="500" y2="280" stroke="#CBD5E1" stroke-width="4" />
      
      <!-- Subject (Person) Centered slightly left -->
      <!-- Body -->
      <path d="M120,350 C120,220 280,220 280,350 Z" fill="#475569" />
      <!-- Neck -->
      <rect x="185" y="180" width="30" height="50" fill="#F8A586" />
      <!-- Face -->
      <circle cx="200" cy="140" r="50" fill="#F8A586" />
      <!-- Eyes -->
      <circle cx="185" cy="130" r="5" fill="#1E293B" />
      <circle cx="215" cy="130" r="5" fill="#1E293B" />
      <!-- Smile -->
      <path d="M 185 155 Q 200 170 215 155" stroke="#1E293B" stroke-width="3" fill="none" />
      <!-- Hair -->
      <path d="M150,130 C150,80 250,80 250,130 C250,100 150,100 150,130 Z" fill="#1E293B" />

      <!-- Supporting Hand on Right Side (Viewer perspective: Right side of the photo) -->
      <rect x="290" y="210" width="35" height="40" rx="10" fill="#F8A586" />
      <!-- Arm -->
      <path d="M280,350 C290,290 300,230 300,210" stroke="#F8A586" stroke-width="15" fill="none" />

      <!-- DNI Card on Right side of the photo -->
      <g transform="translate(300, 120)">
        <rect width="130" height="85" rx="8" fill="#0EA5E9" stroke="#0284C7" stroke-width="3" />
        <!-- Header -->
        <rect width="130" height="20" rx="4" fill="#0284C7" />
        <text x="8" y="14" font-family="'Inter', sans-serif" font-size="8" fill="#FFFFFF" font-weight="bold">ARGENTINA - DNI</text>
        
        <!-- Photo placeholder inside DNI -->
        <rect x="10" y="28" width="30" height="40" rx="3" fill="#E2E8F0" />
        <circle cx="25" cy="42" r="10" fill="#94A3B8" />
        <path d="M15,55 C15,48 35,48 35,55 Z" fill="#475569" />
        
        <!-- Text fields -->
        <text x="48" y="36" font-family="'Inter', sans-serif" font-size="7" fill="#FFFFFF" font-weight="bold">PEREZ</text>
        <text x="48" y="44" font-family="'Inter', sans-serif" font-size="6" fill="#1E293B">JUAN</text>
        <text x="48" y="52" font-family="'Inter', sans-serif" font-size="7" fill="#0F172A" font-weight="bold">ND: 39.123.456</text>
        
        <!-- Security Emblem -->
        <circle cx="110" cy="65" r="10" fill="#FCD34D" opacity="0.6" />
        <text x="108" y="68" font-family="'Inter', sans-serif" font-size="8" fill="#78350F" font-weight="bold">A</text>
      </g>
      
      <!-- Label "Derecha del observador" -->
      <text x="365" y="110" font-family="'Inter', sans-serif" font-size="10" fill="#0284C7" font-weight="bold" text-anchor="middle">LADO DERECHO</text>
    </svg>`,
    dniTitle: 'Frente de DNI - Juan Pérez',
    dniSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#F1F5F9" />
      <text x="25" y="32" font-family="'Inter', sans-serif" font-size="13" fill="#64748B" font-weight="bold">DOCUMENTO NACIONAL DE IDENTIDAD (REPÚBLICA ARGENTINA)</text>
      
      <!-- DNI Graphic Card Base -->
      <g transform="translate(40, 50)">
        <rect width="420" height="260" rx="16" fill="#EDF8FF" stroke="#0EA5E9" stroke-width="6" />
        
        <!-- Security Patterns background shadow -->
        <path d="M 0 100 Q 210 160 420 100" stroke="#E0F2FE" stroke-width="12" fill="none" />
        <path d="M 0 140 Q 210 200 420 140" stroke="#E0F2FE" stroke-width="8" fill="none" />
        
        <!-- Header Ribbon -->
        <rect x="0" y="0" width="420" height="50" rx="12" fill="#0EA5E9" />
        <text x="20" y="32" font-family="'Inter', sans-serif" font-size="18" fill="#FFFFFF" font-weight="bold" letter-spacing="1">REPÚBLICA ARGENTINA</text>
        <text x="310" y="31" font-family="'Inter', sans-serif" font-size="12" fill="#FEF08A" font-weight="bold">DNI MERCOSUR</text>
        
        <!-- Portrait Photo -->
        <rect x="25" y="70" width="120" height="150" rx="10" fill="#FFFFFF" stroke="#64748B" stroke-width="3" />
        <!-- Simplified portrait resembling selfie -->
        <circle cx="85" cy="130" r="35" fill="#F8A586" />
        <circle cx="75" cy="122" r="4" fill="#1E293B" />
        <circle cx="95" cy="122" r="4" fill="#1E293B" />
        <path d="M 75 142 Q 85 152 95 142" stroke="#1E293B" stroke-width="2" fill="none" />
        <path d="M50,185 C50,150 120,150 120,185 Z" fill="#475569" />
        <path d="M55,120 C55,85 115,85 115,120 C115,95 55,95 55,120 Z" fill="#1E293B" />
        
        <!-- Extracted Text Info -->
        <g transform="translate(165, 75)">
          <!-- Apellido -->
          <text x="0" y="15" font-family="'Courier New', monospace" font-size="10" fill="#64748B">Ape. / Surname</text>
          <text x="0" y="32" font-family="'Inter', sans-serif" font-size="16" fill="#0F172A" font-weight="bold">PÉREZ</text>
          
          <!-- Nombre -->
          <text x="0" y="50" font-family="'Courier New', monospace" font-size="10" fill="#64748B">Nom. / Given names</text>
          <text x="0" y="67" font-family="'Inter', sans-serif" font-size="15" fill="#0F172A" font-weight="bold">JUAN RAMÓN</text>
          
          <!-- DNI -->
          <text x="0" y="85" font-family="'Courier New', monospace" font-size="10" fill="#64748B">N° Documento / Card Number</text>
          <text x="0" y="104" font-family="'Inter', sans-serif" font-size="18" fill="#1E3A8A" font-weight="bold">39.123.456</text>
          
          <!-- Sexo / Fecha Nacimiento -->
          <text x="0" y="122" font-family="'Courier New', monospace" font-size="9" fill="#64748B">Sexo/Sex   Fec. Nacimiento/Date of Birth</text>
          <text x="0" y="137" font-family="'Inter', sans-serif" font-size="12" fill="#0F172A" font-weight="bold">M          1995-04-12</text>
          
          <!-- Ejemplar / Trámite -->
          <text x="0" y="154" font-family="'Courier New', monospace" font-size="9" fill="#64748B">Fec. Emisión/Issue      Fec. Vencimiento/Expiry</text>
          <text x="0" y="169" font-family="'Inter', sans-serif" font-size="12" fill="#0F172A" font-weight="bold">2018-06-20              2033-06-20</text>
        </g>
        
        <!-- Argentine Flag & Shield symbol -->
        <path d="M 370 210 L 400 210 L 400 240 L 370 240 Z" fill="#38BDF8" opacity="0.3" />
        <circle cx="385" cy="225" r="8" fill="#F59E0B" />
      </g>
    </svg>`,
    expectedBehavior: 'El backend validará perfectamente la selfie identificando que el DNI está de su lado derecho. Luego, extraerá todos los datos de Juan Ramón Pérez (DNI 39.123.456) y dará resultado biométrico positivo.'
  },
  {
    id: 'case_wrong_side',
    name: 'Caso 2: DNI del Lado Incorrecto (Izquierdo) 🔴',
    description: 'Selfie de María Gómez sosteniendo el DNI del lado izquierdo del rostro visualmente. El sistema debe rechazarlo.',
    tag: 'Rechazado (Lado)',
    selfieTitle: 'Selfie Lado Izquierdo - María Gómez',
    selfieSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350" width="100%" height="100%">
      <!-- Clear neutral background -->
      <rect width="100%" height="100%" fill="#E2E8F0" />
      <text x="20" y="30" font-family="'Inter', sans-serif" font-size="12" fill="#EF4444" font-weight="600">CASO 2: DOCUMENTO DEL LADO IZQUIERDO</text>
      
      <!-- Room elements -->
      <line x1="0" y1="280" x2="500" y2="280" stroke="#CBD5E1" stroke-width="4" />
      
      <!-- Subject (Person) Centered slightly right -->
      <!-- Body -->
      <path d="M220,350 C220,220 380,220 380,350 Z" fill="#DB2777" />
      <!-- Neck -->
      <rect x="285" y="180" width="30" height="50" fill="#FDBA74" />
      <!-- Face -->
      <circle cx="300" cy="140" r="50" fill="#FDBA74" />
      <!-- Eyes -->
      <circle cx="285" cy="130" r="5" fill="#1E293B" />
      <circle cx="315" cy="130" r="5" fill="#1E293B" />
      <!-- Smile -->
      <path d="M 285 155 Q 300 170 315 155" stroke="#1E293B" stroke-width="3" fill="none" />
      <!-- Hair (with ponytail or long) -->
      <path d="M250,140 C240,60 360,60 350,140 Z" fill="#451A03" />

      <!-- Supporting Hand on Left Side (Viewer perspective: Left side of the photo) -->
      <rect x="175" y="210" width="34" height="40" rx="10" fill="#FDBA74" />
      <!-- Arm -->
      <path d="M220,350 C210,290 190,230 180,210" stroke="#FDBA74" stroke-width="15" fill="none" />

      <!-- DNI Card on Left side (from viewer perspective) -->
      <g transform="translate(60, 120)">
        <rect width="130" height="85" rx="8" fill="#0EA5E9" stroke="#0284C7" stroke-width="3" />
        <rect width="130" height="20" rx="4" fill="#0284C7" />
        <text x="8" y="14" font-family="'Inter', sans-serif" font-size="8" fill="#FFFFFF" font-weight="bold">ARGENTINA - DNI</text>
        
        <rect x="10" y="28" width="30" height="40" rx="3" fill="#E2E8F0" />
        <circle cx="25" cy="42" r="10" fill="#F472B6" />
        <path d="M15,55 C15,48 35,48 35,55 Z" fill="#DB2777" />
        
        <text x="48" y="36" font-family="'Inter', sans-serif" font-size="7" fill="#FFFFFF" font-weight="bold">GÓMEZ</text>
        <text x="48" y="44" font-family="'Inter', sans-serif" font-size="6" fill="#1E293B">MARÍA SOL</text>
        <text x="48" y="52" font-family="'Inter', sans-serif" font-size="7" fill="#0F172A" font-weight="bold">ND: 41.987.654</text>
        
        <circle cx="110" cy="65" r="10" fill="#FCD34D" opacity="0.6" />
      </g>
      
      <text x="125" y="110" font-family="'Inter', sans-serif" font-size="10" fill="#EF4444" font-weight="bold" text-anchor="middle">LADO IZQUIERDO ❌</text>
    </svg>`,
    dniTitle: 'Frente de DNI - María Gómez',
    dniSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#F1F5F9" />
      <text x="25" y="32" font-family="'Inter', sans-serif" font-size="13" fill="#64748B" font-weight="bold">DOCUMENTO NACIONAL DE IDENTIDAD (REPÚBLICA ARGENTINA)</text>
      
      <g transform="translate(40, 50)">
        <rect width="420" height="260" rx="16" fill="#EDF8FF" stroke="#0EA5E9" stroke-width="6" />
        <rect width="420" height="50" rx="12" fill="#0EA5E9" />
        <text x="20" y="32" font-family="'Inter', sans-serif" font-size="18" fill="#FFFFFF" font-weight="bold">REPÚBLICA ARGENTINA</text>
        
        <rect x="25" y="70" width="120" height="150" rx="10" fill="#FFFFFF" stroke="#64748B" stroke-width="3" />
        <circle cx="85" cy="130" r="35" fill="#FDBA74" />
        <circle cx="75" cy="122" r="4" fill="#1E293B" />
        <circle cx="95" cy="122" r="4" fill="#1E293B" />
        <path d="M 75 142 Q 85 152 95 142" stroke="#1E293B" stroke-width="2" fill="none" />
        <path d="M250,140 C240,60 360,60 350,140 Z" fill="#451A03" opacity="0.3" />

        <g transform="translate(165, 75)">
          <text x="0" y="15" font-family="'Courier New', monospace" font-size="10" fill="#64748B">Ape. / Surname</text>
          <text x="0" y="32" font-family="'Inter', sans-serif" font-size="16" fill="#0F172A" font-weight="bold">GÓMEZ</text>
          
          <text x="0" y="50" font-family="'Courier New', monospace" font-size="10" fill="#64748B">Nom. / Given names</text>
          <text x="0" y="67" font-family="'Inter', sans-serif" font-size="15" fill="#0F172A" font-weight="bold">MARÍA SOL</text>
          
          <text x="0" y="85" font-family="'Courier New', monospace" font-size="10" fill="#64748B">N° Documento / Card Number</text>
          <text x="0" y="104" font-family="'Inter', sans-serif" font-size="18" fill="#1E3A8A" font-weight="bold">41.987.654</text>
          
          <text x="0" y="122" font-family="'Courier New', monospace" font-size="9" fill="#64748B">Sexo/Sex   Fec. Nacimiento/Date of Birth</text>
          <text x="0" y="137" font-family="'Inter', sans-serif" font-size="12" fill="#0F172A" font-weight="bold">F          1998-11-25</text>
          
          <text x="0" y="154" font-family="'Courier New', monospace" font-size="9" fill="#64748B">Fec. Emisión/Issue      Fec. Vencimiento/Expiry</text>
          <text x="0" y="169" font-family="'Inter', sans-serif" font-size="12" fill="#0F172A" font-weight="bold">2019-02-14              2034-02-14</text>
        </g>
      </g>
    </svg>`,
    expectedBehavior: 'El bot detectará que el DNI está sostenido de su lado izquierdo en lugar de la derecha (según los requisitos solicitados en el chat) y enviará un mensaje indicando el rechazo educativo de Botmaker.'
  },
  {
    id: 'case_blurry',
    name: 'Caso 3: Imagen Borrosa / Fuera de Foco ⚠️',
    description: 'La foto cargada es extremadamente borrosa. El bot debe rechazarla avisando que no es legible.',
    tag: 'Rechazado (Borroso)',
    selfieTitle: 'Selfie Desenfocada - Carlos Ruiz',
    selfieSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#94A3B8" opacity="0.6" stroke="#EF4444" stroke-width="4" />
      <text x="20" y="30" font-family="'Inter', sans-serif" font-size="12" fill="#7F1D1D" font-weight="600">CASO 3: IMAGEN BORROSA Y DESENFOCADA</text>
      
      <!-- Ghost elements and blurs -->
      <circle cx="200" cy="140" r="53" fill="#DDB1A0" opacity="0.4" />
      <circle cx="202" cy="138" r="48" fill="#FCA5A5" opacity="0.3" />
      <circle cx="200" cy="140" r="40" fill="#F8A586" opacity="0.5" />
      
      <!-- Horizontal blur trails -->
      <line x1="160" y1="130" x2="240" y2="130" stroke="#475569" stroke-width="8" opacity="0.3" />
      <line x1="180" y1="150" x2="220" y2="150" stroke="#7F1D1D" stroke-width="5" opacity="0.3" />
      
      <g transform="translate(280, 110)" opacity="0.4">
        <rect width="130" height="85" rx="8" fill="#38BDF8" stroke="#0284C7" stroke-width="5" />
        <rect width="130" height="20" rx="4" fill="#0284C7" />
        <text x="8" y="14" font-family="'Inter', sans-serif" font-size="12" fill="#FFFFFF" font-weight="bold">DNI???</text>
      </g>
      
      <text x="250" y="240" font-family="'Inter', sans-serif" font-size="20" fill="#7F1D1D" font-weight="bold" text-anchor="middle">IMAGEN MUY BORROSA</text>
      <text x="250" y="260" font-family="'Inter', sans-serif" font-size="11" fill="#7F1D1D" text-anchor="middle">Movimientos de cámara rápidos detectados</text>
    </svg>`,
    dniTitle: 'Frente de DNI - Borroso Carlos Ruiz',
    dniSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#E2E8F0" />
      <g transform="translate(40, 50)" opacity="0.5">
        <rect width="420" height="260" rx="16" fill="#CCFBF1" stroke="#EF4444" stroke-width="12" />
        <text x="40" y="120" font-family="'Inter', sans-serif" font-size="28" fill="#7F1D1D" font-weight="bold">COPIA BORROSA</text>
        <!-- Horizontal ghosting lines representing camera shake -->
        <line x1="20" y1="140" x2="400" y2="140" stroke="#EF4444" stroke-width="6" opacity="0.5" />
        <line x1="40" y1="160" x2="380" y2="160" stroke="#EF4444" stroke-width="12" opacity="0.2" />
      </g>
    </svg>`,
    expectedBehavior: 'El bot detectará e interpretará que la selfie u DNI está totalmente borrosa y fuera de foco, y pedirá amablemente al usuario reenviar el archivo para avanzar.'
  },
  {
    id: 'case_wrong_doc',
    name: 'Caso 4: Documento Inválido (Licencia Conducir) 🛡️',
    description: 'Sube la selfie bien, pero provee un documento equivocado (Licencia de conducir). Debe fallar.',
    tag: 'Rechazado (Tipo Doc)',
    selfieTitle: 'Selfie Con Licencia de Conducir',
    selfieSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#E2E8F0" />
      <text x="20" y="30" font-family="'Inter', sans-serif" font-size="12" fill="#64748B" font-weight="600">CASO 4: SELFIE CON LICENCIA DE CONDUCIR</text>
      
      <path d="M120,350 C120,220 280,220 280,350 Z" fill="#1E3A8A" />
      <rect x="185" y="180" width="30" height="50" fill="#F8A586" />
      <circle cx="200" cy="140" r="50" fill="#F8A586" />
      <circle cx="185" cy="130" r="5" fill="#1E293B" />
      <circle cx="215" cy="130" r="5" fill="#1E293B" />
      <path d="M 185 155 Q 200 170 215 155" stroke="#1E293B" stroke-width="3" fill="none" />
      
      <rect x="290" y="210" width="35" height="40" rx="10" fill="#F8A586" />
      <path d="M280,350 C290,290 300,230 300,210" stroke="#F8A586" stroke-width="15" fill="none" />

      <!-- Licence Card on Right -->
      <g transform="translate(300, 120)">
        <rect width="130" height="85" rx="8" fill="#F59E0B" stroke="#D97706" stroke-width="3" />
        <rect width="130" height="20" rx="4" fill="#D97706" />
        <text x="8" y="14" font-family="'Inter', sans-serif" font-size="7" fill="#FFFFFF" font-weight="bold">LICENCIA DE CONDUCIR</text>
        
        <circle cx="110" cy="65" r="10" fill="#FCD34D" opacity="0.6" />
        <text x="50" y="50" font-family="'Inter', sans-serif" font-size="12" fill="#78350F" font-weight="bold">DRIVING</text>
      </g>
    </svg>`,
    dniTitle: 'Frente de Licencia de Conducir',
    dniSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#FEF3C7" />
      <text x="25" y="32" font-family="'Inter', sans-serif" font-size="13" fill="#B45309" font-weight="bold">LICENCIA NACIONAL DE CONDUCIR (MOCK)</text>
      
      <g transform="translate(40, 50)">
        <rect width="420" height="260" rx="16" fill="#FFFBEB" stroke="#D97706" stroke-width="6" />
        <rect width="420" height="50" rx="12" fill="#D97706" />
        <text x="20" y="32" font-family="'Inter', sans-serif" font-size="18" fill="#FFFFFF" font-weight="bold">LICENCIA DE CONDUCIR (ARGENTINA)</text>
        
        <rect x="25" y="70" width="120" height="150" rx="10" fill="#FFFFFF" stroke="#D97706" stroke-width="3" />
        <circle cx="85" cy="130" r="35" fill="#F8A586" />
        
        <g transform="translate(165, 75)">
          <text x="0" y="15" font-family="'Courier New', monospace" font-size="10" fill="#64748B">CLASE / CLASS</text>
          <text x="0" y="32" font-family="'Inter', sans-serif" font-size="16" fill="#B45309" font-weight="bold">B1 - MOTORES/AUTOS</text>
          
          <text x="0" y="55" font-family="'Courier New', monospace" font-size="10" fill="#64748B">SURNAMES / APELLIDOS</text>
          <text x="0" y="72" font-family="'Inter', sans-serif" font-size="15" fill="#1E293B" font-weight="bold">RUÍZ DIAZ</text>
          
          <text x="0" y="95" font-family="'Courier New', monospace" font-size="10" fill="#64748B">GIVEN NAMES / NOMBRES</text>
          <text x="0" y="112" font-family="'Inter', sans-serif" font-size="15" fill="#1E293B" font-weight="bold">ALBERTO CARLOS</text>
          
          <text x="0" y="135" font-family="'Courier New', monospace" font-size="10" fill="#64748B">LICENCIA N° / DRIVERS LICENSE</text>
          <text x="0" y="152" font-family="'Inter', sans-serif" font-size="18" fill="#1E3A8A" font-weight="bold">27-39123456-4</text>
        </g>
      </g>
    </svg>`,
    expectedBehavior: 'El bot detectará que el documento presentado es una Licencia de Conducir en vez de un DNI argentino Frente, por lo que el proceso se detendrá solicitando un documento válido.'
  }
];
