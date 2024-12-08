
import van from 'vanjs-core';
const { div } = van.tags;

const main = () => {
  const appEl = div({id: "app"}, "HELLLO");
  van.add(document.body, appEl);
};

// see if DOM is already available
if (document.readyState === "complete" || document.readyState === "interactive") {
  // call on next available tick
  setTimeout(main, 1);
} else {
  document.addEventListener("DOMContentLoaded", main);
}
