import * as Plot from "@observablehq/plot";
import van from 'vanjs-core';
import { State } from 'vanjs-core';
import { tripTimeTable } from 'calc';
const { div, input } = van.tags;

const trainPresets = {
  emu: { acc: 1, topSpeed: 53, dwell: 48 },
  // BART's default is PL2 which 3mph per second acceleration and a top speed of 70mph
  bart: { dwell: 20, topSpeed: 31, acc: 1.3 },
  // Most of the orange line is in the median of an arterial road (35mph max)
  // Seperated segmants have 55mph max (24m/s)
  vta: { dwell: 20, topSpeed: 15, acc: 1 }
}

const linePresets = {
  // 47.5 miles 76.4 km
  caltrainLocal: { numStops: 22, stopDist: 3447, freq: 15 * 60},
  // 25.4km
  vtaOrangeLine: { numStops: 26, stopDist: 978, freq: 15 * 60 },
  // 82 km (most trips have multiple 2 possible trains at 20 min freq)
  bartOrangeLine: { numStops: 21, stopDist: 3904, freq: 10 * 60},
}

const state = {
  acc: van.state(trainPresets.vta.acc),
  topSpeed: van.state(trainPresets.vta.topSpeed),
  dwell: van.state(trainPresets.vta.dwell),
  numStops: van.state(linePresets.vtaOrangeLine.numStops),
  stopDist: van.state(linePresets.vtaOrangeLine.stopDist),
  freq: van.state(linePresets.vtaOrangeLine.freq)
};
const train = () => ({ acc: state.acc.val, topSpeed: state.topSpeed.val, dwell: state.dwell.val });
const line = () => ({ numStops: state.numStops.val, stopDist: state.stopDist.val, freq: state.freq.val });

const makeInput = (name: string, range: {min: number, max: number, step: number}, stateVar: State<number>, graphEl: HTMLElement) => {
  return div(
    div(name),
    input({
      type: "range",
      min: range.min,
      max: range.max,
      step: range.step,
      value: stateVar.val,
      oninput: e => {
        console.log({ name, e });
        stateVar.val = e.target.value;
        drawGraph(graphEl);
      },
    })
  );
};

const makeInputs = (el: HTMLElement, graphEl: HTMLElement) => {
  van.add(
    el,
    makeInput("Acceleration", {min: 0.1, max: 2.0, step: 0.1}, state.acc, graphEl),
    makeInput("Top Speed", {min: 10, max: 200, step: 10}, state.topSpeed, graphEl),
    makeInput("Dwell Time", {min: 15, max: 300, step: 15}, state.dwell, graphEl),
    makeInput("Number of Stops", {min: 1, max: 30, step: 1}, state.numStops, graphEl),
    makeInput("Distance Between Stops", {min: 500, max: 5000, step: 250}, state.stopDist, graphEl),
    makeInput("Frequency", {min: 2.5, max: 60, step: 2.5}, state.freq, graphEl),
  );
};

const drawGraph = (() => {
  const caltrain = tripTimeTable(trainPresets.emu, linePresets.caltrainLocal);
  const bart = tripTimeTable(trainPresets.bart, linePresets.bartOrangeLine);

  return (el: HTMLElement) => {
    const trips = tripTimeTable(train(), line());
    console.log(trips);
    const plt = Plot.plot({
      marks: [
        Plot.ruleY([0]),
        Plot.lineY(trips, {x: "stops", y: "avgSpeed", stroke: "#212021"}),
        Plot.lineY(caltrain, {x: "stops", y: "avgSpeed", stroke: "#F5D9E9"}),
        Plot.lineY(bart, {x: "stops", y: "avgSpeed", stroke: "#EDD9F5"}),
     ]
    });
    el.replaceChildren(div(plt));
  };
})();

const main = () => {
  const appEl = div({id: "app"}, "HELLLO");
  const inEl = div({id: "in"}, "HELLLO");
  van.add(document.body, appEl, inEl);
  drawGraph(appEl);
  makeInputs(inEl, appEl);
};

// see if DOM is already available
if (document.readyState === "complete" || document.readyState === "interactive") {
  // call on next available tick
  setTimeout(main, 1);
} else {
  document.addEventListener("DOMContentLoaded", main);
}
