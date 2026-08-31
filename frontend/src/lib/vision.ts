/**
 * Polished Client-Side Computer Vision & Optical Motion Flow Tracker
 * 100% In-Browser Local Processing (Zero Video Upload, Privacy-First, 60 FPS)
 * Includes Exponential Moving Average (EMA) smoothing and Bi-Lateral Strike Zones.
 */

export interface MotionEvent {
  x: number; // 0..1 (horizontal normalized, mirrored for user)
  y: number; // 0..1 (vertical normalized)
  rawX: number;
  rawY: number;
  energy: number; // magnitude of movement 0..1
  leftEnergy: number; // left hemisphere movement energy
  rightEnergy: number; // right hemisphere movement energy
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

  // Smoothing state (Exponential Moving Average)
  private smoothedX = 0.5;
  private smoothedY = 0.5;
  private alpha = 0.35; // Smoothing factor (0.35 = snappy yet butter smooth)

  constructor(onMotion?: (evt: MotionEvent) => void, alpha = 0.35) {
    if (onMotion) this.onMotionCallback = onMotion;
    this.alpha = alpha;
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
      this.canvas.width = 64; // Downsampled resolution for instant 60 FPS frame diff
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

  public getVideoElement(): HTMLVideoElement | null {
    return this.video;
  }

  private loop = () => {
    if (!this.isRunning || !this.video || !this.ctx || !this.canvas) return;

    if (this.video.readyState >= 2) {
      const w = this.canvas.width;
      const h = this.canvas.height;
      const halfW = w / 2;

      this.ctx.drawImage(this.video, 0, 0, w, h);
      const curImgData = this.ctx.getImageData(0, 0, w, h);
      const curData = curImgData.data;

      if (this.prevFrameData) {
        let totalDiff = 0;
        let weightedX = 0;
        let weightedY = 0;
        let leftDiff = 0;
        let rightDiff = 0;
        const threshold = 26; // Ignore minor sensor noise

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const grayCur = (curData[idx] + curData[idx + 1] + curData[idx + 2]) / 3;
            const grayPrev =
              (this.prevFrameData[idx] +
                this.prevFrameData[idx + 1] +
                this.prevFrameData[idx + 2]) /
              3;
            const diff = Math.abs(grayCur - grayPrev);

            if (diff > threshold) {
              totalDiff += diff;
              // Mirror X so user movements align with mirror perspective
              const mirroredX = w - 1 - x;
              weightedX += mirroredX * diff;
              weightedY += y * diff;

              if (mirroredX < halfW) {
                leftDiff += diff;
              } else {
                rightDiff += diff;
              }
            }
          }
        }

        const maxSideDiff = (w / 2) * h * 255 * 0.08;
        const leftEnergy = Math.min(1, leftDiff / maxSideDiff);
        const rightEnergy = Math.min(1, rightDiff / maxSideDiff);
        const totalEnergy = Math.min(1, totalDiff / (w * h * 255 * 0.08));

        if (totalDiff > 1000) {
          const rawNormX = weightedX / (totalDiff * w);
          const rawNormY = weightedY / (totalDiff * h);

          // Apply Exponential Moving Average (EMA) smoothing
          this.smoothedX = this.alpha * rawNormX + (1 - this.alpha) * this.smoothedX;
          this.smoothedY = this.alpha * rawNormY + (1 - this.alpha) * this.smoothedY;

          if (this.onMotionCallback) {
            this.onMotionCallback({
              x: Math.max(0, Math.min(1, this.smoothedX)),
              y: Math.max(0, Math.min(1, this.smoothedY)),
              rawX: Math.max(0, Math.min(1, rawNormX)),
              rawY: Math.max(0, Math.min(1, rawNormY)),
              energy: totalEnergy,
              leftEnergy,
              rightEnergy,
              hasMotion: true,
            });
          }
        }
      }

      this.prevFrameData = new Uint8ClampedArray(curData);
    }

    this.animId = requestAnimationFrame(this.loop);
  };
}
