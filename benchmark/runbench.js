var minruntime = 1000;     // in ms
var maxruntime = 5000;    // in ms

var plotdata = [];

var engine;
var engmap = {};
var i = 0;
for (engine of engines) {
  plotdata.push([engine.name]);
  engmap[engine.name] = i++;
}

var chart = c3.generate({
    bindto: "#graph1",
    data: {
        columns: [
            //['data1', 30, 200, 100, 400, 150, 250],
        ],
        type: 'bar'
    },
    bar: {
        width: {
            ratio: 0.5 // this makes bar width 50% of length between ticks
        }
        // or
        //width: 100 // this makes bar width 100px
    }
});

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
	console.log(timeresult);
      }
      plotdata[engmap[engine.name]].push(timeresult); 
    }
    /*
    chart.unload({
      ids: Object.keys(engmap)
    });
    chart.load({
       columns: plotdata
    });
    */
  }
}

mainfun();

setTimeout(function() {
    chart.load({
       columns: plotdata
    });
}, 5000);
