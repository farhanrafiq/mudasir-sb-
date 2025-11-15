// Global type declarations for Node.js

declare global {
  var console: Console;
  var process: NodeJS.Process;
  
  function setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): NodeJS.Timeout;
  function clearTimeout(timeoutId: NodeJS.Timeout): void;
  function setInterval(callback: (...args: any[]) => void, ms: number, ...args: any[]): NodeJS.Timeout;
  function clearInterval(intervalId: NodeJS.Timeout): void;
}

export {};
