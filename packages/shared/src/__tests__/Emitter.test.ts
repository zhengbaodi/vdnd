import { beforeEach, expect, it, vi } from 'vitest';
import Emitter from '../Emitter';

class TestEvent1 {
  static type = 'test1';
}
class TestEvent2 {
  static type = 'test2';
}
type TestEventTable = {
  test1: TestEvent1;
  test2: TestEvent2;
};

let emitter: Emitter<TestEventTable>;
beforeEach(() => {
  emitter = new Emitter();
});

it('on', () => {
  const callback = vi.fn();
  emitter.on('test1', callback);
  emitter.emit('test1', new TestEvent1());
  expect(callback).toHaveBeenCalledOnce();
});

it('once', () => {
  const callback = vi.fn();
  emitter.once('test1', callback);
  emitter.emit('test1', new TestEvent1());
  emitter.emit('test1', new TestEvent1());
  expect(callback).toHaveBeenCalledOnce();
});

it('off', () => {
  const callback = vi.fn();
  emitter.on('test1', callback);
  emitter.off('test1', callback);
  emitter.emit('test1', new TestEvent1());
  expect(callback).not.toHaveBeenCalled();
});

it('emits callbacks on event with test event', () => {
  let dummy = 0;
  const testEvent = new TestEvent1();
  const callbacks = [
    vi.fn(() => (dummy = 1)),
    vi.fn(() => (dummy = dummy === 0 ? 3 : dummy)),
  ];

  emitter.on('test1', callbacks[0]);
  emitter.on('test1', callbacks[1]);
  emitter.emit('test1', testEvent);

  expect(callbacks[0]).toHaveBeenCalledOnce();
  expect(callbacks[1]).toHaveBeenCalledOnce();
  expect(callbacks[0]).toHaveBeenCalledWith(testEvent);
  expect(callbacks[1]).toHaveBeenCalledWith(testEvent);
  expect(dummy).toBe(1);
});

it('destroy', () => {
  const callback1 = vi.fn();
  const callback2 = vi.fn();
  emitter.on('test1', callback1);
  emitter.on('test2', callback2);
  emitter.emit('test1', new TestEvent1());
  emitter.emit('test2', new TestEvent2());
  expect(callback1).toHaveBeenCalledOnce();
  expect(callback2).toHaveBeenCalledOnce();
  emitter.destroy();
  emitter.emit('test1', new TestEvent1());
  emitter.emit('test2', new TestEvent2());
  expect(callback1).toHaveBeenCalledOnce();
  expect(callback2).toHaveBeenCalledOnce();
});

it('catches errors from listeners and re-throws at the end of the emit phase', () => {
  const consoleErrorSpy = vi.fn();
  const emitter = new Emitter();
  const testEvent = new TestEvent1();
  const error = new Error('Error');
  const callbacks = [
    vi.fn(),
    () => {
      throw error;
    },
    vi.fn(),
  ];
  console.error = consoleErrorSpy;
  emitter.on('test1', callbacks[0]);
  emitter.on('test1', callbacks[1]);
  emitter.on('test1', callbacks[2]);

  emitter.emit('test1', testEvent);

  expect(consoleErrorSpy).toHaveBeenCalled();

  expect(callbacks[0]).toHaveBeenCalledOnce();
  expect(callbacks[2]).toHaveBeenCalledOnce();
});
