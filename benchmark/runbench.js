var minruntime = 100;     // in ms
var maxruntime = 2000;    // in ms

var plotdata = [];

var engine;
var engmap = {};
var testlist = [];

var plotdata = [];
var timings = {};

var parentnode = document.createElement("div");

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
    let dt = t2 - t1 + 1;
    if (dt < minruntime)
      curiters *= 2;
    else {
      dt = dt / curiters;
      if (mintime > dt)
        mintime = dt;
    }
  } while (mintime === Infinity || performance.now() - startrun < maxruntime);
  return mintime;
}

async function mainfun() {
  var testname;
  for (testname in testsuite) {
    var thistest = testsuite[testname];
    var engine;
    testlist.push(testname);
    var maxspeed = 0;
    for (engine of engines) {
      var templ = thistest[engine.ext];
      var timeresult = 0;
      if (templ) {
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
        async function run2dom(fn) {
  	  return new Promise((success) => {
            parentnode.textContent = "";
	    if (engine.render2dom)
              engine.render2dom(parentnode, fn, thistest.data, function(x, node) {
                success(node);
  	      });
	    else
              engine.render(fn, thistest.data, function(x, txt) {
	        parentnode.innerHTML = txt;
                success(txt);
  	      });
  	  });
        }
	var fn = await macro2fn();
        timeresult = await runtest(async function () {
	  //var txt = await run2txt(fn);
	  var dom = await run2dom(fn);
        });
	timeresult = 1000/timeresult;
        console.log("DOING " + testname + " "
	 + engine.name + " " + timeresult);
      }
      timeresult = Math.round(timeresult); 
      if (timeresult > maxspeed)
	maxspeed = timeresult;
      timings[engine.name].push(timeresult); 
    }
    for (engine of engines) {
      let row = timings[engine.name];
      row[row.length-1] = row[row.length-1] / maxspeed * 100;
    }
    Plotly.newPlot('graph1', plotdata);
  }
}

mainfun();

