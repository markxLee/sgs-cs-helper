import { useEffect, useRef, useState } from 'react';

interface BarcodeScannerResult {
  barcode: string;
  error?: string;
}

interface UseBarcodeScannerOptions {
  onScan?: (barcode: string) => void;
  active?: boolean;
}

// Speed threshold for barcode scanner detection (ms between keystrokes)
const SCANNER_SPEED_THRESHOLD_MS = 50;

export function useBarcodeScanner(options?: UseBarcodeScannerOptions) {
  const [result, setResult] = useState<BarcodeScannerResult | null>(null);
  const buffer = useRef('');
  const lastTime = useRef<number>(0);
  const active = options?.active ?? true;
  // Extract onScan to avoid stale closure (MAJ-003)
  const onScan = options?.onScan;

  useEffect(() => {
    if (!active) return;
    
    const handleKeydown = (e: KeyboardEvent) => {
      // MAJ-004: Skip if input element is focused
      const activeTag = document.activeElement?.tagName || '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) {
        return;
      }
      
      const now = Date.now();
      // MIN-001: Use 50ms threshold (not 500ms)
      if (lastTime.current && now - lastTime.current > SCANNER_SPEED_THRESHOLD_MS) {
        buffer.current = '';
      }
      lastTime.current = now;
      
      // Only printable characters
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        buffer.current += e.key;
      }
      
      // Barcode scanners usually end with Enter
      if (e.key === 'Enter' && buffer.current.length > 0) {
        e.preventDefault(); // Prevent form submission
        setResult({ barcode: buffer.current });
        onScan?.(buffer.current);
        buffer.current = '';
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [active, onScan]); // MAJ-003: Use onScan instead of options

  return result;
}
