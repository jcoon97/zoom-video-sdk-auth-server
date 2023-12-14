declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT?: string;
      ZOOM_VIDEO_SDK_KEY?: string;
      ZOOM_VIDEO_SDK_SECRET?: string;
    }
  }
}

export {};
