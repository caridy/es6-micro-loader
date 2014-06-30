var Benchmark = require("benchmark");
var System = require("../../");  // es6-micro-loader

System.import("tests/benchmark/system/main").then(function (systemMod) {

  var suite = new Benchmark.Suite(),
    a = 0, aFn = require("./cjs/main").checkForOdd,
    b = 0, bFn = systemMod.checkForOdd,
    c = 0, cFn = require("./bundle/main") && global.checkForOdd;

  // add tests
  suite.add("cjs", function() {
    // commonjs modules which use require() and defineProperties() to preserve ES semantics
    aFn(a++);
  })
  .add("system", function() {
    // System.register() modules which preserve ES semantics
    bFn(b++);
  })
  .add("bundle", function() {
    // using a global variable, and a rollup without preserving bindings or any other ES Semantics
    cFn(c++);
  })
  // add listeners
  .on("cycle", function(event) {
    console.log(String(event.target));
  })
  .on("complete", function() {
    console.log("Fastest is " + this.filter("fastest").pluck("name"));
  })
  // run async
  .run({ "async": true });

});
