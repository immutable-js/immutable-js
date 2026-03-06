class A {
  toB() {
    return new B();
  }
}

class B extends A {
  toA() {
    return new A();
  }
}

const a = new A();
const b = a.toB();
const a2 = b.toA();

console.log(a2);
