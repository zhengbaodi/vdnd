import type SimulatedDnd from '../SimulatedDnd';

export default abstract class Plugin {
  constructor(protected dnd: SimulatedDnd) {}
  abstract attach(): void;
  abstract detach(): void;
}
