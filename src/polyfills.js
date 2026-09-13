import { Buffer } from 'buffer';
import process from 'process/browser';

/** Webpack 5 Node polyfills for wagmi / Web3Modal */
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer;
  window.global = window.global || window;
  window.process = window.process || process;
}

export {};
