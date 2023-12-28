type TPulse = 0 | 1; // low / high
type TSignal = {
  pulse: TPulse;
  target: string;
};

export abstract class MachineModule {
  nextPulses: TSignal[] = [];
  nextState: unknown;
  state: unknown;

  constructor(
    public name: string,
    public outputs: string[],
    public emit: (target: string, pulse: TPulse) => void,
    public moduleMap: Record<string, MachineModule>
  ) {}

  /**
   * accept pulse, update state and prepare nextPulses
   */
  acceptPulse = (pulse: TPulse) => {
    for (const output of this.outputs) {
      this.nextPulses.push({ pulse, target: output });
    }
    // this.state = this.nextState;
  };

  public send() {
    for (const nextPulse of this.nextPulses) {
      this.moduleMap[nextPulse.target].acceptPulse(nextPulse.pulse);
      this.emit(nextPulse.target, nextPulse.pulse);
    }
    this.nextPulses = [];

    this.state = this.nextState as any;
  }
}

export class Broadcaster extends MachineModule {}
export class Output extends MachineModule {}

/**
 * %
 */
export class FlipFlop extends MachineModule {
  state = 0; // off

  constructor(
    public name: string,
    public outputs: string[],
    public emit: (target: string, pulse: TPulse) => void,
    public moduleMap: Record<string, MachineModule>
  ) {
    super(name, outputs, emit, moduleMap);
  }

  acceptPulse = (pulse: TPulse) => {
    this.nextState = this.state === 0 ? 1 : 0;

    if (pulse === 0) {
      const pulseToSend = this.state === 0 ? 1 : 0;
      for (const output of this.outputs) {
        this.nextPulses.push({ pulse: pulseToSend, target: output });
      }
    }

    // this.state = this.nextState as any;
  };
}

/**
 * &
 */
export class Conjunction extends MachineModule {
  constructor(
    public name: string,
    public outputs: string[],
    public emit: (target: string, pulse: TPulse) => void,
    public moduleMap: Record<string, MachineModule>,
    public state: Record<string, 0 | 1>
  ) {
    super(name, outputs, emit, moduleMap);
  }

  acceptPulse = (pulse: TPulse) => {
    this.nextState = { ...this.state, [name]: pulse };
    const allHigh = Object.values(this.nextState as any).every(
      (pulse) => pulse === 1
    );

    for (const output of this.outputs) {
      this.nextPulses.push({
        pulse: allHigh ? 1 : 0,
        target: output,
      });
    }
    // this.state = this.nextState as any;
  };
}

export class Counter {
  public highCount: number;
  public lowCount: number;

  constructor() {
    this.highCount = 0;
    this.lowCount = 0;
  }

  emit = (sender: string) => (target: string, pulse: TPulse) => {
    const pulseMap = { 0: "-low", 1: "-high" };
    console.log(sender, pulseMap[pulse], "-> ", target);
    if (pulse === 1) this.highCount++;
    else this.lowCount++;
  };

  getCounts() {
    return this.highCount + this.lowCount;
  }

  getPrintableFinalCounts() {
    return `high: ${this.highCount}, low: ${this.lowCount}`;
  }
}
