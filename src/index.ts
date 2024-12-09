import * as Plot from "@observablehq/plot";
import van from 'vanjs-core';
import { State } from 'vanjs-core';
import { tripTimeTable } from 'calc';
const { div, input } = van.tags;

const state = {
  acc: van.state(1),
  topSpeed: van.state(40),
  dwell: van.state(60 * 2),
  numStops: van.state(10),
  stopDist: van.state(1500),
  freq: van.state(60 * 15)
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

const drawGraph = (el: HTMLElement) => {
  const trips = tripTimeTable(train(), line());
  console.log(trips);
  const xy = trips.map((t) => [t.stops, t.dist / t.time]);
  console.log(xy);
  const plt = Plot.line(xy).plot()
  el.replaceChildren(div(plt));
};

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
