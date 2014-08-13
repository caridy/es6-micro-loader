import C from './c';

function B() {
    console.log('B');
}

B.prototype.createC = function() {
    return new C();
};

export default B;
