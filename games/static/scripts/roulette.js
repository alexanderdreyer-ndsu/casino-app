const cells = document.querySelectorAll("td");
const chips = document.querySelectorAll(".chips");
const spinButton = document.querySelector("#spin");
const balanceDisplay = document.querySelector("#balance-output");
const spinOutput = document.querySelector("#spinOutput");
const spinOutputDiv = document.querySelector("#spinOutputDiv");
const validStrings = ["1/12", "2/12", "3/12", "Evens", "Odds", "Red", "Black", "High", "Low", "two-to-one-cell top", "two-to-one-cell middle", "two-to-one-cell bottom"];
const previousNumbersDisplay = document.querySelector("#previous-numbers");
const timer = document.querySelector("#timer");

let chipSize = 0;
let thisBet = 0;
let timeUntilSpin = 30;
let betsClosed;
let userBets = new Map();

function generateSpin() {
    const spin = Math.floor(Math.random() * 37);
    let color;

    if (spin === 0) color = "limegreen";
    else if (spin % 2 === 0) color = (spin >= 1 && spin <= 10) || (spin >= 19 && spin <= 28) ? "Black" : "Red";
    else if (spin % 2 === 1) color = (spin >= 11 && spin <= 18) || (spin >= 29 && spin <= 36) ? "Black" : "Red";

    const newNumber = document.createElement("div");
    const newNumberText = document.createElement("h1");

    if (previousNumbersDisplay.children.length === 10) previousNumbersDisplay.removeChild(previousNumbersDisplay.lastChild);

    newNumber.classList.add("spin-output");
    newNumber.appendChild(newNumberText);
    newNumberText.textContent = spin;
    newNumber.style.backgroundColor = color.toLowerCase().toString();
    previousNumbersDisplay.insertBefore(newNumber, previousNumbersDisplay.firstChild);

    return [spin, color];
}

function payout(inputMap, spin, color) {
    let payout = 0;
    const firstRow = ["3"];
    const secondRow = ["2"];
    const thirdRow = ["1"];

    for (let i = 4; i < 37; i++) {
        const imodthree = i % 3;

        if (imodthree === 0) firstRow.push(i.toString());
        else if (imodthree === 2) secondRow.push(i.toString());
        else if (imodthree === 1) thirdRow.push(i.toString());
    }

    for (let item of inputMap.keys()) {
        if (parseInt(item) === spin) payout += inputMap.get(item) * 36;
        else if (item === "1/12" && spin >= 1 && spin <= 12) payout += inputMap.get(item) * 3;
        else if (item === "2/12" && spin >= 13 && spin <= 24) payout += inputMap.get(item) * 3;
        else if (item === "3/12" && spin >= 25 && spin <= 36) payout += inputMap.get(item) * 3;
        else if (item === "Evens" && spin % 2 === 0) payout += inputMap.get(item) * 2;
        else if (item === "Odds" && spin % 2 !== 0) payout += inputMap.get(item) * 2;
        else if (item === "Low" && spin <= 18) payout += inputMap.get(item) * 2;
        else if (item === "High" && spin > 18) payout += inputMap.get(item) * 2;
        else if (item === "two-to-one-bottom" && thirdRow.includes(spin.toString())) payout += inputMap.get(item) * 3;
        else if (item === "two-to-one-middle" && secondRow.includes(spin.toString())) payout += inputMap.get(item) * 3;
        else if (item === "two-to-one-top" && firstRow.includes(spin.toString())) payout += inputMap.get(item) * 3;
        else if (item === color) payout += inputMap.get(item) * 2;
    }

    return payout;
}

function spin() {
    const spinNumberAndColor = generateSpin();
    const gameCells = document.querySelectorAll(".game-cell")

    for (const cell of gameCells) {
        if (parseInt(cell.id) === spinNumberAndColor[0]) {
            cell.style.animation = "none";
            void cell.offsetWidth;
            cell.style.animation = "flash 2s ease-out";
        }
    }

    localBalance += payout(userBets, spinNumberAndColor[0], spinNumberAndColor[1]);
    userBets.clear();
    balanceDisplay.textContent = localBalance.toFixed(2);
    updateBalanceField(localBalance);
    thisBet = 0;
    clearBet();
}

function updateTimer() {
    if (timeUntilSpin === 0) {
        spin();
        timeUntilSpin = 29;
    } else {
        timeUntilSpin--;
    }

    betsClosed = timeUntilSpin <= 10;
    document.querySelector("#bets-available-label").textContent = betsClosed ? "Bets Closed" : "Bets Open";
    timer.textContent = timeUntilSpin;
}

function clearBet() {
    userBets.clear();
    localBalance += thisBet;
    balanceDisplay.textContent = localBalance.toFixed(2);
    updateBalanceField(localBalance);
    thisBet = 0;

    for (let cell of cells) {
        while (cell.hasChildNodes()) cell.removeChild(cell.firstChild);

        cell.textContent = cell.id;
    }
}

function addBet(cell) {
    if (localBalance < chipSize) return window.alert("Insufficient funds");

    if (userBets.has(cell.dataset.value)) {
        console.log(cell.dataset.value)
        const currentBetOnThisCell = userBets.get(cell.dataset.value);

        const updatedChip = document.createElement("button");
        updatedChip.className = "chips-on-board";
        updatedChip.textContent = currentBetOnThisCell + chipSize;

        userBets.set(cell.dataset.value, currentBetOnThisCell + chipSize);

        localBalance -= chipSize;
        thisBet += chipSize;

        cell.textContent = "";
        cell.appendChild(updatedChip);
    } else {
        const chipToBeDisplayed = document.createElement("button");
        chipToBeDisplayed.className = "chips-on-board";

        userBets.set(cell.dataset.value, chipSize);

        localBalance -= chipSize;
        thisBet += chipSize;

        cell.textContent = "";
        chipToBeDisplayed.textContent = chipSize;
        cell.appendChild(chipToBeDisplayed);
    }

    balanceDisplay.textContent = localBalance.toFixed(2);
}

for (let i = 0; i < 37; i++) {
    validStrings.push(i.toString());

    if (i < 10) generateSpin();
}

for (let cell of cells) {
    cell.addEventListener("click", () => {
        if (!betsClosed && chipSize > 0) addBet(cell);
    });
}

for (let chip of chips) {
    chip.addEventListener("click", () => {
        for (let chipResetColor of chips) chipResetColor.style.border = "none";

        chipSize = parseInt(chip.id);
        chip.style.border = "3px solid";
    });
}

document.querySelector("#clear-bet").addEventListener("click", clearBet);
setInterval(updateTimer, 1000);