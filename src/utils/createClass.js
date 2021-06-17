export default function createClass(ctor, superClass) {
  if (superClass) {
    ctor.prototype = Object.create(superClass.prototype);
  }
  ctor.prototype.constructor = ctor;
}
