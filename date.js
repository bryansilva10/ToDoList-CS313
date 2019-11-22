module.exports = getDate;

function getDate() {
  const date = new Date();

  const options = {
    //options for localedatestring parameter
    weekday: "long",
    day: "numeric",
    month: "long"
  };

  const day = date.toLocaleDateString("en-US", options); //gets nice format

  return day;
}
