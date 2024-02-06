// CONFIG

const names = [
  "Eric",
  "Oumaima",
  "Clement",
  "Naores",
  "Virginie",
  "Jeremy",
  "Guillaume",
  "Yassine",
  "Marie",
  "Matthieu",
];
const colors = [
  "hsl(359 94% 62%)",
  "hsl(21 89% 56%)",
  "hsl(33 94% 55%)",
  "hsl(20 94% 63%)",
  "hsl(42 93% 64%)",
  "hsl(94 38% 59%)",
  "hsl(162 43% 46%)",
  "hsl(178 30% 43%)",
  "hsl(208 25% 45%)",
  "hsl(198 61% 39%)",
];

const defaultEndTimeHour = 10;
const defaultEndTimeMinute = 10;

// VARIABLE DEFINITION

let data = [];

const conf = document.getElementById("dialog-content");
const winner = document.querySelector(".name");
const timer = document.querySelector(".timer");
const mpp = document.getElementById("min-per-pers");
const mtt = document.getElementById("minutes-total");
const dialog = document.getElementById("dialog");
const openButton = document.getElementById("open-dialog-button");
const closeButton = document.getElementById("close-dialog-button");
const resetTimerButton = document.getElementById("reset-time-button");
const wheel = document.querySelector(".deal-wheel");
const spinner = wheel.querySelector(".spinner");
const trigger = wheel.querySelector(".btn-spin");
const ticker = wheel.querySelector(".ticker");
const spinClass = "is-spinning";
const selectedClass = "selected";
const spinnerStyles = window.getComputedStyle(spinner);
let wheelAlradySpinned = false;
let tickerAnim;
let rotation = 0;
let currentSlice = 0;
let prizeNodes;
let timerId = null;
let maxTimePerPersonString = "2:00";

// FUNCTIONS

const getCurrentTimerMax = () => {
  var now = new Date();

  var targetTime = new Date();
  targetTime.setHours(10);
  targetTime.setMinutes(10);
  targetTime.setSeconds(0);

  var timeDiff = targetTime.getTime() - now.getTime();

  var dividedTimeDiff = timeDiff / 7;

  return dividedTimeDiff;
};

const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

const createData = () => {
  let shuffleNames = shuffle(names);
  let shuffleColors = shuffle(colors);
  shuffleNames.forEach((curName, i) => {
    data.push({
      name: curName,
      color: shuffleColors[i],
    });
  });
};

const createConfig = () => {
  data.sort((a, b) => a.name.localeCompare(b.name));
  data.forEach(({ name, color }) => {
    conf.insertAdjacentHTML(
      "beforeend",
      `
            <label>
            <input type="checkbox" style="accent-color: ${color};" class="checkbox" id="${name}" checked />
            ${name}
            </label>
            <br/>`
    );
  });
  shuffle(data);
};

const createPrizeNodes = () => {
  data.forEach(({ name, color }, i) => {
    const prizeOffset = Math.floor(180 / data.length);
    const rotation = (360 / data.length) * i * -1 - prizeOffset;

    spinner.insertAdjacentHTML(
      "beforeend",
      `<li class="prize" style="--rotate: ${rotation}deg">
          <span class="text">${name}</span>
        </li>`
    );
  });
};

const createConicGradient = () => {
  spinner.setAttribute(
    "style",
    `background: conic-gradient(
        from -90deg,
        ${data
          .map(
            ({ color }, i) =>
              `${color} 0 ${(100 / data.length) * (data.length - i)}%`
          )
          .reverse()}
      );`
  );
};

const setupWheel = () => {
  createConicGradient();
  createPrizeNodes();
  prizeNodes = wheel.querySelectorAll(".prize");
};

const spinertia = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const runTickerAnimation = () => {
  // https://css-tricks.com/get-value-of-css-rotation-through-javascript/
  const values = spinnerStyles.transform.split("(")[1].split(")")[0].split(",");
  const a = values[0];
  const b = values[1];
  let rad = Math.atan2(b, a);

  if (rad < 0) rad += 2 * Math.PI;

  const angle = Math.round(rad * (180 / Math.PI));
  const slice = Math.floor(angle / (360 / data.length));

  if (currentSlice !== slice) {
    ticker.style.animation = "none";
    setTimeout(() => (ticker.style.animation = null), 10);
    currentSlice = slice;
  }

  tickerAnim = requestAnimationFrame(runTickerAnimation);
};

const selectPrize = () => {
  const selected = Math.floor(rotation / (360 / data.length));
  prizeNodes[selected].classList.add(selectedClass);
  winner.textContent = data[selected].name;
  winner.style.color = data[selected].color;
};

const launchTimer = (time) => {
  timer.textContent = time;
  timer.style.color = "#000";
  clearInterval(timerId);
  timerId = setInterval(() => {
    const time = timer.textContent.split(":");
    let minutes = parseInt(time[0]);
    let seconds = parseInt(time[1]);

    if (minutes === 0 && seconds <= 6) {
      timer.classList.remove("blinking-text-1");
      timer.classList.add("blinking-text-05");
    } else if (minutes === 0 && seconds <= 11) {
      timer.classList.add("blinking-text-1");
    } else if (minutes === 0 && seconds <= 16) {
      timer.style.color = "#f00";
    }

    if (seconds === 0) {
      if (minutes === 0) {
        timer.classList.remove("blinking-text-1");
        timer.classList.remove("blinking-text-05");
        clearInterval(timerId);
        timerId = undefined;
      } else {
        minutes--;
        seconds = 59;
      }
    } else {
      seconds--;
    }
    timer.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, 1000);
};

const saveNamesConfiguration = () => {
  const length = data.length;
  names.forEach((name) => {
    const nameChecked = document.getElementById(name).checked;
    let idx = data.findIndex((dat) => dat.name === name);
    if (idx !== -1 && !nameChecked) {
      console.log(`removing ${name} at position ${idx}`);
      data.splice(idx, 1);
    }
  });

  if (data.length !== length) {
    spinner.innerHTML = "";
    spinner.style = "";
    setupWheel();
  }
};

const saveTimeConfiguration = () => {
  const mpp = document.getElementById("min-per-pers");
  const radioPP = document.getElementById("time-per-pers");
  const mtt = document.getElementById("minutes-total");
  const radioTT = document.getElementById("end-time");

  if (radioPP.checked) {
    maxTimePerPersonString = convertMinutesToMinutesAndSeconds(mpp.value);
  } else if (radioTT.checked) {
    maxTimePerPersonString = convertMinutesToMinutesAndSeconds(
      mtt.value / data.length
    );
  }
  if(!timerId){
    timer.textContent = maxTimePerPersonString;
  }
};

function convertMinutesToMinutesAndSeconds(minutes) {
  minutes = parseFloat(minutes);
  if (typeof minutes !== "number" || minutes < 0) {
    return "Invalid input. Please provide a non-negative number for minutes.";
  }

  const totalSeconds = Math.floor(minutes * 60);
  const convertedMinutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  minutes = convertedMinutes > 0 ? convertedMinutes : 0;
  const seconds = remainingSeconds > 0 ? remainingSeconds : 0;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// SCRIPT

trigger.addEventListener("click", () => {
  if(!wheelAlradySpinned){
    wheelAlradySpinned = true;
  } else if (data.length > 1){
    const selected = Math.floor(rotation / (360 / data.length));
    console.log(`removing ${data[selected].name} at position ${selected}`);
    data.splice(selected, 1);
    spinner.innerHTML = "";
    spinner.style = "";
    setupWheel();
  } else if (data.length === 1){
    data = [];
    createData();
    saveNamesConfiguration();
    trigger.textContent = "Spin the wheel";
  }

  trigger.disabled = true;
  rotation = Math.floor(Math.random() * 360 + spinertia(1000, 2000));
  prizeNodes.forEach((prize) => prize.classList.remove(selectedClass));
  wheel.classList.add(spinClass);
  spinner.style.setProperty("--rotate", rotation);
  ticker.style.animation = "none";
  runTickerAnimation();
});

spinner.addEventListener("transitionend", () => {
  launchTimer(maxTimePerPersonString);
  cancelAnimationFrame(tickerAnim);
  trigger.disabled = false;
  trigger.focus();
  rotation %= 360;
  selectPrize();
  wheel.classList.remove(spinClass);
  spinner.style.setProperty("--rotate", rotation);
  if (data.length === 1){
    trigger.textContent = "Restart from config";
  }
});

createData();
createConfig();
setupWheel();

openButton.addEventListener("click", function () {
  dialog.showModal();
  if (!mpp.value) {
    mpp.value = 2;
  }
  if (!mtt.value) {
    mtt.value = 20;
  }
});

closeButton.addEventListener("click", function () {
  saveNamesConfiguration();
  saveTimeConfiguration();
  dialog.close();
});

resetTimerButton.addEventListener("click", function () {
  timer.textContent = maxTimePerPersonString;
  dialog.close();
});

mpp.addEventListener("input", (event) => {
  let inputValue = event.target.value;
  inputValue = inputValue.replace(/[^0-9]/g, "");
  mpp.value = inputValue;
});
mtt.addEventListener("input", (event) => {
  let inputValue = event.target.value;
  inputValue = inputValue.replace(/[^0-9]/g, "");
  mtt.value = inputValue;
});
