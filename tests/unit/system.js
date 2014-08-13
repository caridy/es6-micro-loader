/* global describe, it, beforeEach */
'use strict';

var System = require('../../'),
  expect = require('chai').expect;

describe('System', function() {

  it('.import() should be a function', function() {
    expect(System.import).to.be.a('function');
  });

  it('.has() should be a function', function() {
    expect(System.has).to.be.a('function');
  });

  it('.get() should be a function', function() {
    expect(System.get).to.be.a('function');
  });

  it('.register() should be a function', function() {
    expect(System.register).to.be.a('function');
  });

});
