export const trackTikTokEvent = (event: string, data?: any) => {
  if (typeof window !== "undefined" && (window as any).ttq) {
    (window as any).ttq.track(event, data);
  }
};
