import * as Plot from "@observablehq/plot";
import van from 'vanjs-core';
import { tripTimeTable, Trip } from 'calc';
import { makeInput } from 'input';
import 'assets/style.css';
const { div } = van.tags;

const MS2MPH = 2.2369362920544;

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
  caltrainLocal: { numStops: 22, stopDist: 3447, tph: 4 },
  // 25.4km
  vtaOrangeLine: { numStops: 26, stopDist: 978, tph: 4 },
  // 82 km (most trips have multiple 2 possible trains at 20 min freq)
  bartOrangeLine: { numStops: 21, stopDist: 3904, tph: 6 },
}

export const frequencyChart = (el: HTMLElement) => {
  const tph = van.state(2);
  const topSpeed = van.state(15);
  const mph = van.derive(() => Math.round(topSpeed.val * MS2MPH));
  const baseline = tripTimeTable(
    { dwell: 30, topSpeed: 15, acc: 1.2},
    { numStops: 20, stopDist: 1000, tph: 2}
  );
  const chartEl = div({class: "chart"});
  const mphEl = div(mph, "mph");
  const colors = {
    speed: "#AB2011",
    freq: "#3EB8B9",
  };
  const datapoint = (tt: Trip[], index: number, title: string) => ({ title, ...tt[index]});
  const updateChart = () => {
    const stops = [3, 6, 12];
    const _diffSpeed = tripTimeTable(
      { dwell: 30, topSpeed: topSpeed.val, acc: 1.2},
      { numStops: 20, stopDist: 1000, tph: 2}
    );
    const diffSpeed = stops.map(i => datapoint(_diffSpeed, i, "speed"));
    const _diffFreq = tripTimeTable(
      { dwell: 30, topSpeed: 15, acc: 1.2},
      { numStops: 20, stopDist: 1000, tph: tph.val}
    );
    const diffFreq = stops.map(i => datapoint(_diffFreq, i, "frequency"));
    const plt = Plot.plot({
      x: {
        type: 'band',
        domain: ['3b', '3s', '3f', '6b', '6s', '6f', '12b', '12s', '12f'],
      },
      marks: [
        Plot.ruleY([0]),
        Plot.barY(
          diffSpeed,
          {x: (p) => `${p.stops}${p.title[0]}`, y: "time", fill: colors.speed}),
        Plot.barY(
          diffFreq,
          {x: (p) => `${p.stops}${p.title[0]}`, y: "time", fill: colors.freq}),
        Plot.barY(
          [3, 6, 12].map(i => datapoint(baseline, i, "baseline")),
          {x: (p) => `${p.stops}${p.title[0]}`, y: "time", stroke: "#C1C0C1"}),
     ]
    });
    chartEl.replaceChildren(div(plt));
  };
  const ms = makeInput(
    {name: "Top Speed", units: "m/s"},
    {min: 10, max: 50, step: 2.5},
    topSpeed,
    updateChart,
    {"style": () => `border-left: 1em solid ${colors.speed}`}
  );
  van.add(ms, mphEl);

  van.add(
    el,
    chartEl,
    div(
      {"class": "inputs"},
      ms,
      makeInput(
        {name: "Frequency", units: "trains/hour"},
        {min: 1, max: 20, step: 1},
        tph,
        updateChart,
        {"style": () => `border-left: 1em solid ${colors.freq}`}
      ),
    )
  );
  updateChart();
};

export const playground = (container: HTMLElement) => {
  const inputsEl = div({"class": "inputs"});
  const chartEl = div({"class": "chart"});
  const state = {
    acc: van.state(trainPresets.vta.acc),
    topSpeed: van.state(trainPresets.vta.topSpeed),
    dwell: van.state(trainPresets.vta.dwell),
    numStops: van.state(linePresets.vtaOrangeLine.numStops),
    stopDist: van.state(linePresets.vtaOrangeLine.stopDist),
    tph: van.state(linePresets.vtaOrangeLine.tph)
  };
  const train = () => ({ acc: state.acc.val, topSpeed: state.topSpeed.val, dwell: state.dwell.val });
  const line = () => ({ numStops: state.numStops.val, stopDist: state.stopDist.val, tph: state.tph.val });

  const makeInputs = (el: HTMLElement, graphEl: HTMLElement) => {
    van.add(
      el,
      makeInput(
        {name: "Acceleration", units: "m/s²"},
        {min: 0.1, max: 2.0, step: 0.1},
        state.acc,
        () => drawGraph(graphEl)
      ),
      makeInput(
        {name: "Top Speed", units: "m/s"},
        {min: 10, max: 200, step: 10},
        state.topSpeed,
        () => drawGraph(graphEl)
      ),
      makeInput(
        {name: "Dwell Time", units: "s"},
        {min: 15, max: 100, step: 5},
        state.dwell,
        () => drawGraph(graphEl)
      ),
      makeInput(
        {name: "Number of Stops", units: ""},
        {min: 1, max: 30, step: 1},
        state.numStops,
        () => drawGraph(graphEl)
      ),
      makeInput(
        {name: "Distance Between Stops", units: "m"},
        {min: 500, max: 5000, step: 250},
        state.stopDist,
        () => drawGraph(graphEl)
      ),
      makeInput(
        {name: "Frequency", units: "min"},
        {min: 1, max: 20, step: 1},
        state.tph,
        () => drawGraph(graphEl)
      ),
    );
  };

  const drawGraph = (() => {
    const caltrain = tripTimeTable(trainPresets.emu, linePresets.caltrainLocal);
    const bart = tripTimeTable(trainPresets.bart, linePresets.bartOrangeLine);

    return (el: HTMLElement) => {
      const trips = tripTimeTable(train(), line());
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

  van.add(container, chartEl, inputsEl);
  makeInputs(inputsEl, chartEl);
  drawGraph(chartEl);
};
