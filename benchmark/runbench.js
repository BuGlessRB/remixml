var minruntime = 100;     // in ms
var maxruntime = 2000;    // in ms

var plotdata = [];
plotdata.columns = ["Test"];
plotdata.y = "Ops/s";

var engine;
for (engine of engines)
  plotdata.columns.push(engine.name);

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
    var plotrow = {"Test":testname};
    plotdata.push(plotrow);
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
	plotrow[engine.name] = timeresult;
	console.log(timeresult);
      }
    }
  }
}

mainfun();


var width = 500;
var height = 400;
var DOM = document.getElementById("tag1");
  const svg = d3.select(DOM.svg(width, height));

  svg.append("g")
    .selectAll("g")
    .data(plotdata)
    .join("g")
      .attr("transform", d => `translate(${x0(d[groupKey])},0)`)
    .selectAll("rect")
    .data(d => keys.map(key => ({key, value: d[key]})))
    .join("rect")
      .attr("x", d => x1(d.key))
      .attr("y", d => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", d => y(0) - y(d.value))
      .attr("fill", d => color(d.key));

/*
  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .call(yAxis);

  svg.append("g")
      .call(legend);
*/
  var t = svg.node();

