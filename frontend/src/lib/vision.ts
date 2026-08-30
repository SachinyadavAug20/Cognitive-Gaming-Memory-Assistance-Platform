/**
 * Lightweight Client-Side Computer Vision & Optical Motion Flow Tracker
 * Processes video frames locally in-browser for gentle hand motion tracking.
 */

export interface MotionEvent {
  x: number; // 0..1 (horizontal normalized)
  y: number; // 0..1 (vertical normalized)
  energy: number; // magnitude of movement
  hasMotion: boolean;
}

export class OpticalMotionTracker {
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private prevFrameData: Uint8ClampedArray | null = null;
  private animId: number | null = null;
  private isRunning = false;
  private stream: MediaStream | null = null;
  private onMotionCallback: ((evt: MotionEvent) => void) | null = null;

  constructor(onMotion?: (evt: MotionEvent) => void) {
    if (onMotion) this.onMotionCallback = onMotion;
  }

  public async start(): Promise<boolean> {
    if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
      return false;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: "user" },
        audio: false,
      });

      this.video = document.createElement("video");
      this.video.autoplay = true;
      this.video.playsInline = true;
      this.video.muted = true;
      this.video.srcObject = this.stream;
      await this.video.play();

      this.canvas = document.createElement("canvas");
      this.canvas.width = 64; // Low-res downsampling for ultra-fast 60 FPS processing
      this.canvas.height = 48;
      this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });

      this.isRunning = true;
      this.loop();
      return true;
    } catch {
      this.stop();
      return false;
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
      this.video = null;
    }
    this.prevFrameData = null;
    this.canvas = null;
    this.ctx = null;
  }

  private loop = () => {
    if (!this.isRunning || !this.video || !this.ctx || !this.canvas) return;

    if (this.video.readyState >= 2) {
      const w = this.canvas.width;
      const h = this.canvas.height;

      // Draw current video frame scaled down
      this.ctx.drawImage(this.video, 0, 0, w, h);
      const curImgData = this.ctx.getImageData(0, 0, w, h);
      const curData = curImgData.data;

      if (this.prevFrameData) {
        let totalDiff = 0;
        let weightedX = 0;
        let weightedY = 0;
        const threshold = 28; // Ignore minor camera sensor noise

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            // Grayscale difference
            const grayCur = (curData[idx] + curData[idx + 1] + curData[idx + 2]) / 3;
            const grayPrev =
              (this.prevFrameData[idx] +
                this.prevFrameData[idx + 1] +
                this.prevFrameData[idx + 2]) /
              3;
            const diff = Math.abs(grayCur - grayPrev);

            if (diff > threshold) {
              totalDiff += diff;
              // Mirror X so movement aligns with user's mirror perspective
              weightedX += (w - 1 - x) * diff;
              weightedY += y * diff;
            }
          }
        }

        const maxPossibleDiff = w * h * 255;
        const normalizedEnergy = Math.min(1, totalDiff / (maxPossibleDiff * 0.08));

        if (totalDiff > 1200 && this.onMotionCallback) {
          const normX = weightedX / (totalDiff * w);
          const normY = weightedY / (totalDiff * h);
          this.onMotionCallback({
            x: Math.max(0, Math.min(1, normX)),
            y: Math.max(0, Math.min(1, normY)),
            energy: normalizedEnergy,
            hasMotion: true,
          });
        }
      }

      this.prevFrameData = new Uint8ClampedArray(curData);
    }

    this.animId = requestAnimationFrame(this.loop);
  };
}
