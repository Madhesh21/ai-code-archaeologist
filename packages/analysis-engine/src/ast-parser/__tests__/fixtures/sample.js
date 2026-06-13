function greet(name) {
  return `Hello, ${name}!`;
}

const double = (x) => x * 2;

class Counter {
  constructor(initial) {
    this.count = initial;
  }

  increment() {
    this.count++;
  }
}

export { greet, double, Counter };
