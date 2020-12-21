var minruntime = 100;     // in ms
var maxruntime = 2000;    // in ms

async function runtest(testfun) {
  var curiters = 1;
  var mintime = Infinity;
  var startrun = performance.now();
  do {
    let t1 = performance.now();
    let iters = curiters;
    let result;
    do result = await testfun();
    while (--iters);
    let t2 = performance.now();
    let dt = t2 - t1;
    if (dt < minruntime)
      iters *= 2;
    dt = dt / curiters;
    if (mintime > dt)
      mintime = dt;
  } while (performance.now() - startrun > maxruntime);
  return mintime;
}

async function mainfun() {
  var testname;
  for (testname in testsuite) {
    var thistest = testsuite[testname];
    var engine;
    for (engine of engines) {
      var templ = thistest[engine.name];
      if (templ) {
        console.log("DOING " + testname + " " + engine.name);
        async function macro2fn() {
  	  return new Promise((success) => {
            engine.load(templ, "", "", function(x, fn) {
              success(fn);
   	    });
	  });
        }
        async function run2txt(fn) {
  	  return new Promise((success) => {
            engine.render(fn, thistest.data, function(x, txt) {
              success(txt);
  	    });
  	  });
        }
        var timeresult = await runtest(async function () {
	  var fn = await macro2fn();
	  var txt = await run2txt(fn);
        });
	console.log(timeresult);
      }
    }
  }
}

mainfun();
