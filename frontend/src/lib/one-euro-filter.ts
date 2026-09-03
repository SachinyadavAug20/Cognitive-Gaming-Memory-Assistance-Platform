/**
 * 1€ Filter (One Euro Filter)
 * Reference: Casiez, G., Roussel, N. and Vogel, D. (2012)
 * "1 € filter: a simple speed-based low-pass filter for noisy input in interactive systems"
 * ACM Conference on Human Factors in Computing Systems (CHI '12)
 *
 * Solves the jitter vs. lag trade-off in interactive webcam and gesture tracking:
 * - Low speed (steady aim / resting on buttons): low cutoff frequency -> ZERO jitter & tremor.
 * - High speed (flicking across screen): cutoff frequency scales dynamically with velocity -> ZERO latency.
 */

class LowPassFilter {
  private y: number | null = null;
  private s: number | null = null;

  public filter(value: number, alpha: number): number {
    if (this.y === null) {
      this.s = value;
      this.y = value;
    } else {
      this.y = value;
      this.s = alpha * value + (1.0 - alpha) * this.s!;
    }
    return this.s!;
  }

  public lastValue(): number {
    return this.s ?? 0;
  }

  public reset() {
    this.y = null;
    this.s = null;
  }
}

export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xFilter = new LowPassFilter();
  private dxFilter = new LowPassFilter();
  private lastTime: number | null = null;

  /**
   * @param minCutoff Minimum cutoff frequency in Hz (lower = more anti-jitter at rest)
   * @param beta Speed coefficient (higher = less lag during fast movement)
   * @param dCutoff Cutoff frequency for derivative in Hz
   */
  constructor(minCutoff = 1.2, beta = 0.02, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
  }

  private alpha(cutoff: number, dt: number): number {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / dt);
  }

  public filter(x: number, timestamp: number = performance.now()): number {
    if (this.lastTime === null) {
      this.lastTime = timestamp;
      return this.xFilter.filter(x, 1.0);
    }

    const dt = Math.max(0.001, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    // 1. Filter the speed derivative dx
    const dx = (x - this.xFilter.lastValue()) / dt;
    const edx = this.dxFilter.filter(dx, this.alpha(this.dCutoff, dt));

    // 2. Dynamic cutoff: minCutoff + beta * |speed|
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);

    // 3. Filter position with dynamic alpha
    return this.xFilter.filter(x, this.alpha(cutoff, dt));
  }

  public setParams(minCutoff: number, beta: number) {
    this.minCutoff = minCutoff;
    this.beta = beta;
  }

  public reset() {
    this.lastTime = null;
    this.xFilter.reset();
    this.dxFilter.reset();
  }
}

/**
 * 2D One Euro Filter for Screen Coordinates (X, Y)
 */
export class OneEuroFilter2D {
  private filterX: OneEuroFilter;
  private filterY: OneEuroFilter;

  constructor(minCutoff = 1.0, beta = 0.03, dCutoff = 1.0) {
    this.filterX = new OneEuroFilter(minCutoff, beta, dCutoff);
    this.filterY = new OneEuroFilter(minCutoff, beta, dCutoff);
  }

  public filter(x: number, y: number, timestamp: number = performance.now()): { x: number; y: number } {
    return {
      x: this.filterX.filter(x, timestamp),
      y: this.filterY.filter(y, timestamp),
    };
  }

  public setParams(minCutoff: number, beta: number) {
    this.filterX.setParams(minCutoff, beta);
    this.filterY.setParams(minCutoff, beta);
  }

  public reset() {
    this.filterX.reset();
    this.filterY.reset();
  }
}
