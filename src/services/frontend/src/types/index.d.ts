export {};

declare global {
  interface Window {
    ["create-timetable-modal"]: HTMLDialogElement;
  }
}
