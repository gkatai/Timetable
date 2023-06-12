export {};

declare global {
  interface Window {
    ["form-modal"]: HTMLDialogElement;
  }
}
