import { frequencyChart, playground } from 'charts';
import 'assets/style.css';

const main = () => {
  const fEl = document.getElementById("frequency");
  fEl && frequencyChart(fEl);
  const pEl = document.getElementById("playground");
  pEl && playground(pEl);
};

// see if DOM is already available
if (document.readyState === "complete" || document.readyState === "interactive") {
  // call on next available tick
  setTimeout(main, 1);
} else {
  document.addEventListener("DOMContentLoaded", main);
}
