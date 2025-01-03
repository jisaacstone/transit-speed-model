import { State } from 'vanjs-core';
import van from 'vanjs-core';
const { div, input } = van.tags;

export const makeInput = (
  display: {name: string, units: string},
  range: {min: number, max: number, step: number},
  stateVar: State<number>,
  callback: () => any,
  classArgs: object = {}
) => {
  return div(
    {class: "slider", ...classArgs},
    div({class: "label"}, display.name),
    input({
      type: "range",
      min: range.min,
      max: range.max,
      step: range.step,
      value: stateVar.val,
      oninput: e => {
        stateVar.val = e.target.value;
        callback();
      },
    }),
    div(
      {class: "unitDisplay"},
      div(stateVar),
      div(display.units),
    )
  );
};
