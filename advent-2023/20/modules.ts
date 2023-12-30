type TPulse = 0 | 1; // low / high
type TSignal = {
  pulse: TPulse;
  target: string;
};

export abstract class MachineModule {
  nextPulses: { pulse: TPulse; target: string; sender: string }[] = [];
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
  acceptPulse = (pulse: TPulse, sender: string) => {
    for (const output of this.outputs) {
      this.nextPulses.push({ pulse, target: output, sender });
    }
  };

  public send() {
    for (const nextPulse of this.nextPulses) {
      this.moduleMap[nextPulse.target].acceptPulse(
        nextPulse.pulse,
        nextPulse.sender
      );
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

    this.nextState = this.state;
  }

  acceptPulse = (pulse: TPulse) => {
    if (pulse === 0) {
      this.nextState = this.state === 0 ? 1 : 0;
      const pulseToSend = this.state === 0 ? 1 : 0;
      for (const output of this.outputs) {
        this.nextPulses.push({
          pulse: pulseToSend,
          target: output,
          sender: this.name,
        });
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

    this.nextState = this.state;
  }

  acceptPulse = (pulse: TPulse, sender: string) => {
    this.state[sender] = pulse;
    this.nextState = this.state;

    const allHigh = Object.values(this.state as any).every(
      (pulse) => pulse === 1
    );

    this.nextPulses = [];

    for (const output of this.outputs) {
      this.nextPulses.push({
        pulse: allHigh ? 0 : 1,
        target: output,
        sender: this.name,
      });
    }
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
    return `high: ${this.highCount}, low: ${this.lowCount}, mult: ${
      this.highCount * this.lowCount
    }`;
  }
}
