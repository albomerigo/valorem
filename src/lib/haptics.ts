function hapticsEnabled(): boolean {
  if (typeof localStorage === "undefined") return true;
  return localStorage.getItem("valorem_haptics_enabled") !== "false";
}

export function hapticLight() {
  if (!hapticsEnabled()) return;
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(10);
  }
}

export function hapticMedium() {
  if (!hapticsEnabled()) return;
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(25);
  }
}

export function hapticSuccess() {
  if (!hapticsEnabled()) return;
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([10, 50, 20]);
  }
}
