var minruntime = 100;     // in ms
var maxruntime = 2000;    // in ms

var plotdata = [];

var engine;
var engmap = {};
var testlist = [];

var plotdata = [];
var timings = {};

var i = 0;
for (engine of engines) {
  plotdata.push({
    histfunc: "sum",
    type: "histogram",
    x: testlist,
    y: timings[engine.name] = [],
    name: engine.name
  });
  engmap[engine.name] = i++;
}

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
  } while (performance.now() - startrun < maxruntime);
  return mintime;
}

async function mainfun() {
  var testname;
  for (testname in testsuite) {
    var thistest = testsuite[testname];
    var engine;
    testlist.push(testname);
    for (engine of engines) {
      var templ = thistest[engine.ext];
      var timeresult = 0;
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
        timeresult = await runtest(async function () {
	  var fn = await macro2fn();
	  var txt = await run2txt(fn);
        });
	timeresult = 1000/timeresult;
	console.log(timeresult);
      }
      timings[engine.name].push(timeresult); 
    }
    document.getElementById("graph1").textcontent = "";
    Plotly.newPlot('graph1', plotdata);
  }
}

mainfun();

