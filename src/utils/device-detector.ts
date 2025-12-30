/**
 * Device Detector - Captura informações detalhadas do dispositivo do usuário
 */

export interface DeviceInfo {
  // IP e Localização
  ip: string | null;
  
  // User Agent
  userAgent: string;
  
  // Browser
  browserName: string;
  browserVersion: string;
  
  // Sistema Operacional
  osName: string;
  osVersion: string;
  
  // Dispositivo
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  deviceModel: string;
  isMobile: boolean;
  isTablet: boolean;
  
  // Hardware
  screenWidth: number;
  screenHeight: number;
  screenColorDepth: number;
  screenPixelDepth: number;
  devicePixelRatio: number;
  
  // Conexão e Performance
  connectionType: string;
  effectiveConnectionType: string;
  maxTouchPoints: number;
  
  // Idioma e Localização
  language: string;
  languages: string;
  timezone: string;
  timezoneOffset: number;
  
  // Hardware Capabilities
  cores: number;
  ram: number;
  gpu: string;
  
  // Sessão
  timestamp: string;
  timezone_name: string;
}

/**
 * Detecta o navegador baseado no User Agent
 */
function detectBrowser(userAgent: string): { name: string; version: string } {
  // Chrome
  if (/Chrome\/(\d+)/.test(userAgent) && !/Edge|Edg|OPR/.test(userAgent)) {
    return { 
      name: 'Chrome', 
      version: userAgent.match(/Chrome\/(\d+)/)?.[1] || 'unknown' 
    };
  }
  
  // Firefox
  if (/Firefox\/(\d+)/.test(userAgent)) {
    return { 
      name: 'Firefox', 
      version: userAgent.match(/Firefox\/(\d+)/)?.[1] || 'unknown' 
    };
  }
  
  // Safari
  if (/Safari\//.test(userAgent) && !/Chrome|Chromium|CriOS/.test(userAgent)) {
    const match = userAgent.match(/Version\/(\d+)/);
    return { 
      name: 'Safari', 
      version: match?.[1] || 'unknown' 
    };
  }
  
  // Edge (Chromium)
  if (/Edg[ea]\/(\d+)/.test(userAgent)) {
    return { 
      name: 'Edge', 
      version: userAgent.match(/Edg[ea]\/(\d+)/)?.[1] || 'unknown' 
    };
  }
  
  // Opera
  if (/OPR\/(\d+)/.test(userAgent)) {
    return { 
      name: 'Opera', 
      version: userAgent.match(/OPR\/(\d+)/)?.[1] || 'unknown' 
    };
  }
  
  // Samsung Internet
  if (/SamsungBrowser\/(\d+)/.test(userAgent)) {
    return { 
      name: 'Samsung Internet', 
      version: userAgent.match(/SamsungBrowser\/(\d+)/)?.[1] || 'unknown' 
    };
  }
  
  // UC Browser
  if (/UCBrowser\/(\d+)/.test(userAgent)) {
    return { 
      name: 'UC Browser', 
      version: userAgent.match(/UCBrowser\/(\d+)/)?.[1] || 'unknown' 
    };
  }
  
  return { name: 'Unknown', version: 'unknown' };
}

/**
 * Detecta o Sistema Operacional
 */
function detectOS(userAgent: string): { name: string; version: string } {
  // Windows
  if (/Windows NT/.test(userAgent)) {
    let version = 'Unknown';
    if (/Windows NT 10.0/.test(userAgent)) {
      version = 'Windows 10/11';
    } else if (/Windows NT 6.3/.test(userAgent)) {
      version = 'Windows 8.1';
    } else if (/Windows NT 6.2/.test(userAgent)) {
      version = 'Windows 8';
    } else if (/Windows NT 6.1/.test(userAgent)) {
      version = 'Windows 7';
    }
    return { name: 'Windows', version };
  }
  
  // macOS
  if (/Macintosh/.test(userAgent)) {
    const match = userAgent.match(/Mac OS X ([\d_.]+)/);
    const version = match?.[1]?.replace(/_/g, '.') || 'Unknown';
    return { name: 'macOS', version };
  }
  
  // iOS
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    const match = userAgent.match(/OS ([\d_]+)/);
    const version = match?.[1]?.replace(/_/g, '.') || 'Unknown';
    const device = /iPhone/.test(userAgent) ? 'iOS' : 'iPadOS';
    return { name: device, version };
  }
  
  // Android
  if (/Android/.test(userAgent)) {
    const match = userAgent.match(/Android ([\d.]+)/);
    const version = match?.[1] || 'Unknown';
    return { name: 'Android', version };
  }
  
  // Linux
  if (/Linux/.test(userAgent)) {
    return { name: 'Linux', version: 'Unknown' };
  }
  
  // Chrome OS
  if (/CrOS/.test(userAgent)) {
    return { name: 'Chrome OS', version: 'Unknown' };
  }
  
  return { name: 'Unknown', version: 'Unknown' };
}

/**
 * Detecta o tipo de dispositivo
 */
function detectDeviceType(userAgent: string): { type: 'desktop' | 'mobile' | 'tablet' | 'unknown'; model: string } {
  // iPad
  if (/iPad/.test(userAgent)) {
    return { type: 'tablet', model: 'iPad' };
  }
  
  // Samsung Tablet
  if (/SM-T/.test(userAgent)) {
    return { type: 'tablet', model: 'Samsung Tablet' };
  }
  
  // iPad Pro
  if (/iPad Pro/.test(userAgent)) {
    return { type: 'tablet', model: 'iPad Pro' };
  }
  
  // iPhone
  if (/iPhone/.test(userAgent)) {
    const match = userAgent.match(/iPhone(?:[\s_]OS)?[\s_]([\d_]+)/);
    return { type: 'mobile', model: 'iPhone' };
  }
  
  // Android Mobile
  if (/Mobile/.test(userAgent) && /Android/.test(userAgent)) {
    // Tenta detectar modelo
    let model = 'Android Mobile';
    if (/Samsung/.test(userAgent)) model = 'Samsung Mobile';
    else if (/Pixel/.test(userAgent)) model = 'Google Pixel';
    else if (/OnePlus/.test(userAgent)) model = 'OnePlus';
    else if (/Xiaomi/.test(userAgent)) model = 'Xiaomi';
    else if (/Huawei/.test(userAgent)) model = 'Huawei';
    
    return { type: 'mobile', model };
  }
  
  // Android Tablet
  if (/Android/.test(userAgent) && !/Mobile/.test(userAgent)) {
    return { type: 'tablet', model: 'Android Tablet' };
  }
  
  // Desktop/Laptop
  if (/Windows|Macintosh|Linux/.test(userAgent) && !/Mobile/.test(userAgent)) {
    return { type: 'desktop', model: 'Desktop/Laptop' };
  }
  
  return { type: 'unknown', model: 'Unknown' };
}

/**
 * Detecta tipo de conexão
 */
function detectConnectionType(): string {
  const navigator_: any = navigator;
  
  if (navigator_.connection) {
    return navigator_.connection.effectiveType || 'unknown';
  }
  
  if (navigator_.mozConnection) {
    return navigator_.mozConnection.effectiveType || 'unknown';
  }
  
  if (navigator_.webkitConnection) {
    return navigator_.webkitConnection.effectiveType || 'unknown';
  }
  
  return 'unknown';
}

/**
 * Detecta numero de cores da CPU
 */
function detectCores(): number {
  return navigator.hardwareConcurrency || 0;
}

/**
 * Detecta memória RAM (estimado)
 */
function detectRAM(): number {
  const navigator_: any = navigator;
  return navigator_.deviceMemory || 0;
}

/**
 * Detecta GPU (estimado via WebGL)
 */
function detectGPU(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return 'Unknown';
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return gpu || 'Unknown';
    }
    
    return 'Unknown';
  } catch (e) {
    return 'Unknown';
  }
}

/**
 * Obtém o IP do usuário via API pública
 */
async function fetchIP(): Promise<string | null> {
  try {
    // Tenta usar a API ipify
    const response = await fetch('https://api.ipify.org?format=json', {
      signal: AbortSignal.timeout(5000),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.ip || null;
    }
  } catch (error) {
    console.error('Erro ao buscar IP:', error);
  }
  
  // Fallback para alternativa
  try {
    const response = await fetch('https://api.db-ip.com/v2/free/self', {
      signal: AbortSignal.timeout(5000),
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.ipAddress || null;
    }
  } catch (error) {
    console.error('Erro ao buscar IP (fallback):', error);
  }
  
  return null;
}

/**
 * Obtém o nome do fuso horário
 */
function getTimezoneInfo(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

/**
 * Coleta todas as informações do dispositivo
 */
export async function detectDeviceInfo(): Promise<DeviceInfo> {
  const userAgent = navigator.userAgent;
  const browser = detectBrowser(userAgent);
  const os = detectOS(userAgent);
  const device = detectDeviceType(userAgent);
  
  // Detecta se é mobile ou tablet
  const isMobile = device.type === 'mobile';
  const isTablet = device.type === 'tablet';
  
  // Obtém informações de conexão
  const navigator_: any = navigator;
  const effectiveConnectionType = navigator_.connection?.effectiveType || 'unknown';
  const connectionType = navigator_.connection?.type || 'unknown';
  
  // IP
  const ip = await fetchIP();
  
  // Timezone
  const timezone = getTimezoneInfo();
  const offset = new Date().getTimezoneOffset();
  
  return {
    ip,
    userAgent,
    browserName: browser.name,
    browserVersion: browser.version,
    osName: os.name,
    osVersion: os.version,
    deviceType: device.type,
    deviceModel: device.model,
    isMobile,
    isTablet,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    screenColorDepth: window.screen.colorDepth,
    screenPixelDepth: window.screen.pixelDepth,
    devicePixelRatio: window.devicePixelRatio,
    connectionType,
    effectiveConnectionType,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    language: navigator.language,
    languages: navigator.languages?.join(',') || navigator.language,
    timezone,
    timezoneOffset: offset,
    cores: detectCores(),
    ram: detectRAM(),
    gpu: detectGPU(),
    timestamp: new Date().toISOString(),
    timezone_name: timezone,
  };
}

/**
 * Hook para obter informações do dispositivo
 */
import React from 'react';

export function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadDeviceInfo = async () => {
      try {
        const info = await detectDeviceInfo();
        setDeviceInfo(info);
      } catch (error) {
        console.error('Erro ao detectar informações do dispositivo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDeviceInfo();
  }, []);

  return { deviceInfo, isLoading };
}
