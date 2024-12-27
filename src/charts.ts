import * as Plot from "@observablehq/plot";
import van from 'vanjs-core';
import { tripTimeTable, Trip } from 'calc';
import { makeInput } from 'input';
import 'assets/style.css';
const { div } = van.tags;

const MS2MPH = 2.2369362920544;
type Comp = { key: string, text: string, opacity: number }
type FreqTrip = Trip & {component: Comp, minutes: number}

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
  const tph = van.state(4);
  const topSpeed = van.state(15);
  const mph = van.derive(() => Math.round(topSpeed.val * MS2MPH));
  const baseline = tripTimeTable(
    { dwell: 30, topSpeed: 15, acc: 1},
    { numStops: 20, stopDist: 1000, tph: 4}
  );
  const chartEl = div({class: "chart"});
  const mphEl = div(mph, "mph");
  const colors = {
    speed: "#AB2011",
    freq: "#3EB8B9",
  };
  const components: Comp[] = [
    { key: 'wait', text: 'waiting for train', opacity: 1.0 },
    { key: 'accdec', text: 'accelerating/decelerating', opacity: 0.8 },
    { key: 'cruise', text: 'cruising at max speed', opacity: 0.6 },
    { key: 'dwell', text: 'dwell time', opacity: 0.4 },
  ];
  const dataset = (stops: number[], tt: Trip[]): FreqTrip[] => {
    const data: FreqTrip[] = [];
    stops.forEach(i => {
      const { stops, dist, time, avgSpeed, timeDetails } = tt[i];
      components.forEach(k => data.push(
        // @ts-ignore
        { stops, dist, avgSpeed, time, minutes: timeDetails[k.key] / 60, component: k }
      ));
    });
    return data;
  }
  const updateChart = () => {
    const dsSpeed = tripTimeTable(
      { dwell: 30, topSpeed: topSpeed.val, acc: 1},
      { numStops: 20, stopDist: 1000, tph: 4}
    );
    const dsFreq = tripTimeTable(
      { dwell: 30, topSpeed: 15, acc: 1},
      { numStops: 20, stopDist: 1000, tph: tph.val}
    );

    // Bar
    const stops = [3, 6, 12];
    const diffSpeed = dataset(stops, dsSpeed);
    const diffFreq = dataset(stops, dsFreq);
    const label = (shorthand: string) => {
      const datastream = shorthand[0];
      const stops = +shorthand.slice(1);
      if (datastream === 'b') {
        return `${stops} stops`;
      }
      const bl = baseline.find((b) => b && b.stops === stops);
      const src = datastream === 's' ? diffSpeed : diffFreq;
      // @ts-ignore
      const ratio = bl.avgSpeed / src.find((b) => b && b.stops === stops).avgSpeed;
      return `${Math.round(ratio * 100)}%`;
    };
    const boxOptions = (prefix: string, color: string) => ({
      x: ((p: Trip) => `${prefix}${p.stops}`),
      y: "minutes",
      // stroke: "component",
      fillOpacity: (d: FreqTrip) => d.component.opacity,
      fill: color,
      tip: { channels: {component: (d: FreqTrip) => d.component.text}, format: { x: false, fillOpacity: false } },
    });
    const barPlt = Plot.plot({
      title: 'Total travel time for select trips',
      caption: 'Move the sliders to see the effect of changing top speed or frequency',
      className: 'plot-graph',
      x: {
        type: 'band',
        domain: ['b3', 's3', 'f3', 'b6', 's6', 'f6', 'b12', 's12', 'f12'],
      },
      color: {
        domain: components.map(c => c.text),
        range: components.map(c => `rgba(181, 180, 185, ${c.opacity})`),
        legend: 'swatches',
      },
      marks: [
        Plot.axisX({
          tickFormat: label
        }),
        Plot.ruleY([0]),
        Plot.barY(
          diffSpeed, boxOptions('s', colors.speed),
        ),
        Plot.barY(
          diffFreq, boxOptions('f', colors.freq),
        ),
        Plot.barY(
          dataset(stops, baseline), boxOptions('b', "rgba(181, 180, 185, 1)"),
        ),
     ]
    });
    // line
    const addMPH = (d: Trip) => ({ ...d, 'MPH': d.avgSpeed / 60 * MS2MPH });
    const linePlt = Plot.plot({
      title: 'Average speed for all trip lengths',
      caption: 'Average speed increases for longer trips as time waiting for the train is a lower proportion of total trip time',
      marks: [
        Plot.ruleY([0]),
        Plot.lineY(baseline.map(addMPH), {x: "stops", y: 'MPH', stroke: "#212021"}),
        Plot.lineY(dsSpeed.map(addMPH), {x: "stops", y: 'MPH', stroke: colors.speed}),
        Plot.lineY(dsFreq.map(addMPH), {x: "stops", y: 'MPH', stroke: colors.freq}),
      ],
      className: 'plot-graph',
    });
    chartEl.replaceChildren(div(barPlt), div(linePlt));
  };
  const inEl = (() => {
    const ms = makeInput(
      {name: "Top Speed", units: "m/s"},
      {min: 10, max: 50, step: 2},
      topSpeed,
      updateChart,
      {"style": () => `border-left: 1em solid ${colors.speed}`}
    );
    van.add(ms, mphEl);
    return div(
      {"class": "inputs"},
      ms,
      makeInput(
        {name: "Frequency", units: "trains/hour"},
        {min: 1, max: 20, step: 1},
        tph,
        updateChart,
        {"style": () => `border-left: 1em solid ${colors.freq}`}
      ),
    );
  })();

  van.add(
    el,
    inEl,
    chartEl,
  );
  updateChart();
};

export const playground = (container: HTMLElement) => {
  const inputsEl = div({"class": "inputs"});
  const chartEl = div({"class": "chart"});
  const state = {
    acc: van.state(1),
    topSpeed: van.state(12),
    dwell: van.state(15),
    numStops: van.state(20),
    stopDist: van.state(1000),
    tph: van.state(1)
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
        {min: 10, max: 100, step: 5},
        state.topSpeed,
        () => drawGraph(graphEl)
      ),
      makeInput(
        {name: "Dwell Time", units: "seconds"},
        {min: 10, max: 100, step: 5},
        state.dwell,
        () => drawGraph(graphEl)
      ),
      makeInput(
        {name: "Number of Stops", units: ""},
        {min: 2, max: 30, step: 1},
        state.numStops,
        () => drawGraph(graphEl)
      ),
      makeInput(
        {name: "Distance Between Stops", units: "meters"},
        {min: 500, max: 5000, step: 250},
        state.stopDist,
        () => drawGraph(graphEl)
      ),
      makeInput(
        {name: "Frequency", units: "trains/hour"},
        {min: 1, max: 20, step: 1},
        state.tph,
        () => drawGraph(graphEl)
      ),
    );
  };

  const drawGraph = (() => {
    const caltrain = tripTimeTable(trainPresets.emu, linePresets.caltrainLocal);
    const bart = tripTimeTable(trainPresets.bart, linePresets.bartOrangeLine);
    const vta = tripTimeTable(trainPresets.vta, linePresets.vtaOrangeLine);
    const colors = {
      'caltrain': '#F5D9E9',
      'bart': '#EDD9F3',
      'vta light rail': '#DDE5F9',
    };

    return (el: HTMLElement) => {
      const trips = tripTimeTable(train(), line());
      const plt = Plot.plot({
        color: {
          domain: Object.keys(colors),
          range: Object.values(colors),
        },
        marks: [
          Plot.ruleY([0]),
          Plot.lineY(trips, {x: "stops", y: "avgSpeed", stroke: "#212021"}),
          Plot.dot(trips, {x: "stops", y: "avgSpeed", stroke: "#412135"}),
          Plot.lineY(caltrain, {x: "stops", y: "avgSpeed", stroke: colors.caltrain}),
          Plot.lineY(bart, {x: "stops", y: "avgSpeed", stroke: colors.bart}),
          Plot.lineY(vta, {x: "stops", y: "avgSpeed", stroke: colors['vta light rail']}),
       ]
      });
      el.replaceChildren(div(plt));
    };
  })();

  van.add(container, inputsEl, chartEl);
  makeInputs(inputsEl, chartEl);
  drawGraph(chartEl);
};
