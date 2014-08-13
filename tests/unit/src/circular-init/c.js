import B from './b';

function C() {
  B.call(this);
  console.log('C');
}

C.prototype = Object.create(B.prototype);
C.prototype.constructor = C;

export default C;
