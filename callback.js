
const interverId = setInterval(function () {
  console.log("hi")
}, 1000);

setTimeout(function () {
  clearInterval(interverId);
}, 5000);