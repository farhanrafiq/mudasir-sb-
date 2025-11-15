// Global type declarations for Node.js APIs
// This file provides type definitions until dependencies are installed

declare const console: {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
};

declare const process: {
  exit(code?: number): never;
  on(event: string, listener: (...args: any[]) => void): void;
  env: { [key: string]: string | undefined };
};

declare function setTimeout(callback: (...args: any[]) => void, ms: number): any;
declare function clearTimeout(timeoutId: any): void;
declare function setInterval(callback: (...args: any[]) => void, ms: number): any;
declare function clearInterval(intervalId: any): void;

// Export empty to make this a module
export {};
