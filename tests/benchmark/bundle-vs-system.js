var Benchmark = require("benchmark");
var System = require("../../");  // es6-micro-loader
var cjsMod = require("./bundle/");

System.import("tests/benchmark/system/main").then(function (systemMod) {

    var suite = new Benchmark.Suite(),
        a = 0, aFn = global.checkForOdd,
        b = 0, bFn = systemMod.checkForOdd;

    // add tests
    suite.add("bundle", function() {
        aFn(a++);
    })
    .add("system", function() {
        bFn(b++);
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

}).catch(function (err) {
    console.log(err.stack || err);
});
