export type Coordinates = { latitude: number; longitude: number };

declare global {
  interface Window {
    NativeApp?: { getLocation?: () => Promise<Coordinates> };
  }
}

const getBrowserLocation = () => new Promise<Coordinates>((resolve, reject) => {
  if (!navigator.geolocation) {
    reject(new Error("Bu qurilmada joylashuv xizmati mavjud emas"));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
    () => reject(new Error("Joylashuv ruxsati berilmadi")),
    { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
  );
});

export const locationService = {
  getCurrentPosition: async (): Promise<Coordinates> => {
    if (window.NativeApp?.getLocation) return window.NativeApp.getLocation();
    return getBrowserLocation();
  },
};
