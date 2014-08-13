/* global describe, it, beforeEach */
'use strict';

var System = require('../../'),
  expect = require('chai').expect;

describe('System', function() {

  it('.import() should be a function', function() {
    expect(System.import).to.be.a('function');
  });

  describe('import("tests/unit/build/live/a")', function() {

    it('should support a live counter', function(next) {
      var p = System.import("tests/unit/build/live/a");
      p.then(function (a) {
        expect(a.up).to.be.a('function');
        expect(a.down).to.be.a('function');
        expect(a.current).to.be.a('function');
        expect(a.current()).to.be.a('number').equal(0);
        // testing live bindings
        a.up();
        a.up();
        expect(a.current()).to.be.a('number').equal(2);
        a.down();
        expect(a.current()).to.be.a('number').equal(1);
        next();
      }).catch(next);
    });

    it('should maintain the state after second import() call', function(next) {
      var p = System.import("tests/unit/build/live/a");
      p.then(function (a) {
        expect(a.up).to.be.a('function');
        expect(a.down).to.be.a('function');
        expect(a.current).to.be.a('function');
        expect(a.current()).to.be.a('number').equal(1);
        next();
      }).catch(next);
    });

  });

});
