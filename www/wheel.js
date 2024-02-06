// CONFIG

const names = [
  {name: "Eric",checked: true},
  {name: "Oumaima",checked: true},
  {name: "Clement",checked: true},
  {name: "Naores",checked: true},
  {name: "Virginie",checked: true},
  {name: "Jeremy",checked: true},
  {name: "Guillaume",checked: true},
  {name: "Yassine",checked: true},
  {name: "Marie",checked: true},
  {name: "Matthieu",checked: true},
  {name: "Cathy",checked: false},
];
const colors = [
  "hsl(359 94% 62%)",
  "hsl(21 89% 56%)",
  "hsl(33 94% 55%)",
  "hsl(20 94% 63%)",
  "hsl(31 94% 64%)",
  "hsl(42 93% 64%)",
  "hsl(94 38% 59%)",
  "hsl(162 43% 46%)",
  "hsl(178 30% 43%)",
  "hsl(208 25% 45%)",
  "hsl(198 61% 39%)"
];
const endAudiosAndGif = [
  {name: "Eric", audio: new Audio("sounds/end/alarm.mp3"),image: "images/eric.png"},
  {name: "Guillaume", audio: new Audio("sounds/end/alarm.mp3"),image: "images/guillaume.png"},
  {name: "Jeremy", audio: new Audio("sounds/end/alarm.mp3"),image: "images/jeremy.png"},
  {name: "Marie", audio: new Audio("sounds/end/alarm.mp3"),image: "images/marie.png"},
  {name: "Matthieu", audio: new Audio("sounds/end/alarm.mp3"),image: "images/matthieu.png"},
  {name: "Naores", audio: new Audio("sounds/end/alarm.mp3"),image: "images/naores.png"},
  {name: "Virginie", audio: new Audio("sounds/end/josh.mp3"),image: "images/virginie.gif"},
  {name: "Yassine", audio: new Audio("sounds/end/alarm.mp3"),image: "images/yassine.png"}
];

// VARIABLE DEFINITION

let data = [];
let defaultData = [];

const conf = document.getElementById("dialog-content");
const winner = document.querySelector(".name");
const timer = document.querySelector(".timer");
const dialog = document.getElementById("dialog");
const imageDialog = document.getElementById("image-dialog");
const image = document.getElementById("image");
const openButton = document.getElementById("open-dialog-button");
const closeButton = document.getElementById("close-dialog-button");
const resetConfButton = document.getElementById("reset-conf-button");
const resetTimerButton = document.getElementById("reset-time-button");
const wheel = document.querySelector(".deal-wheel");
const spinner = wheel.querySelector(".spinner");
const trigger = wheel.querySelector(".btn-spin");
const ticker = wheel.querySelector(".ticker");
const mpp = document.getElementById("min-per-pers");
const radioPP = document.getElementById("time-per-pers");
const mtt = document.getElementById("minutes-total");
const radioTT = document.getElementById("end-time");
const spinClass = "is-spinning";
const selectedClass = "selected";
const spinnerStyles = window.getComputedStyle(spinner);
let wheelAlradySpinned = false;
let tickerAnim;
let rotation = 0;
let currentSlice = 0;
let prizeNodes;
let selectedData;
let configSelectedNames = [];
let configTimeType;
let configTime;
let timerId = null;
let maxTimePerPersonString = "2:00";
let countdown = new Audio("sounds/timer/countdown.mp3");
let endSound;


// FUNCTIONS

const shuffle = (array) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
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
  let shuffleAudio = shuffle(endAudiosAndGif);
  shuffleNames.forEach((curName, i) => {
    defaultData.push({
      name: curName.name,
      checked:curName.checked,
      color: shuffleColors[i],
      audio: shuffleAudio[i%shuffleAudio.length].audio,
      image: shuffleAudio[i%shuffleAudio.length].image
    });
  });
  saveNamesConfiguration();
};

const createConfig = () => {
  defaultData.sort((a, b) => a.name.localeCompare(b.name));
  defaultData.forEach(({ name, checked, color }) => {
    let checkedString = "";
    if(checked){
      checkedString = "checked";
    }
    conf.insertAdjacentHTML(
      "beforeend",
      `
            <label>
            <input type="checkbox" style="accent-color: ${color};" class="checkbox" id="${name}" ${checkedString}/>
            ${name}
            </label>
            <br/>`
    );
  });
};

const createPrizeNodes = () => {
  data.forEach(({ name }, i) => {
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
  selectedData = data[selected];
  endSound = selectedData.audio;
};

const launchTimer = (time) => {
  timer.textContent = time;
  timer.style.color = "#000";
  clearInterval(timerId);
  timerId = setInterval(() => {
    const time = timer.textContent.split(":");
    let minutes = parseInt(time[0]);
    let seconds = parseInt(time[1]);

    if (minutes === 0 && seconds === 1) {
        endSound.play();
        image.src = selectedData.image;
        imageDialog.showModal();
    }else if (minutes === 0 && seconds <= 6) {
      timer.classList.remove("blinking-text-1");
      timer.classList.add("blinking-text-05");
    } else if (minutes === 0 && seconds <= 12) {
      countdown.play();
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

const resetConfig = () => {
  configSelectedNames.forEach(({name, checked}) => {
    let nameElement = document.getElementById(name);
    nameElement.checked = checked;
  });
  if (configTimeType === "radioPP") {
    radioPP.checked = true;
    mpp.value = configTime;
  } else if (configTimeType === "radioTT") {
    radioTT.checked = true;
    mtt.value = configTime;
  }
}

const savePreviousConfig = () => {
  names.forEach(({name, checked}) => {
    let nameChecked = checked;
    if(document.getElementById(name)){
      nameChecked = document.getElementById(name).checked;
    }
    configSelectedNames.push({name: name, checked: nameChecked});
  });
  if (radioPP.checked) {
    configTimeType = "radioPP";
    configTime = mpp.value;
  } else if (radioTT.checked) {
    configTimeType = "radioTT";
    configTime = mtt.value;
  }
}

const saveNamesConfiguration = () => {
  data = [];
  names.forEach(({name,checked}) => {
    let nameChecked = checked;
    if(document.getElementById(name)){
      nameChecked = document.getElementById(name).checked;
    }
    if(nameChecked){
      data.push(defaultData.find((el) => el.name === name));
    }
  });

  spinner.innerHTML = "";
  spinner.style = "";
  setupWheel();
  
};

const saveTimeConfiguration = () => {if (radioPP.checked) {
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
    console.log(`removing ${data[selected].name}`);
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

resetConfButton.addEventListener("click", function () {
  resetConfig();
  dialog.close();
});

 imageDialog.addEventListener("click", function () {
   imageDialog.close();
});

openButton.addEventListener("click", function () {
  dialog.showModal();
  if (!mpp.value) {
    mpp.value = 2;
  }
  if (!mtt.value) {
    mtt.value = 20;
  }
  savePreviousConfig();
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
