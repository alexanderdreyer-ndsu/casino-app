const spinbtn = document.querySelector("#spinBtn");
const bettingBtns = document.querySelectorAll(".bettingBtns");
const balanceOutput = document.querySelector("#balance-output");
const betDisplay = document.querySelector("#betDisplay");
const prevWinDisplay = document.querySelector("#prevWinDisplay");
const doors = document.querySelectorAll(".door");

let balance;
try {
    balance = Number(balanceOutput.textContent);
} catch (err) {
    console.log(err + "\nUnknown Balance");
    balance = 0;
}
let bet = 0;

balanceOutput.textContent = balance.toFixed(2);
betDisplay.textContent = bet.toFixed(2);

function generateSpin() {
    const objects = ['🍍', '🍊', '💎', '🍓', '🔪', '🌴', '🍉', '🍌', '🏺', '🍇', '🍎', '🧊', '🥝', '🐱‍👤', '🥥'];
    let spunObjects = [];

    for (let i = 0; i < 15; i++) {
        let spin = Math.floor(Math.random() * objects.length);

        spunObjects.push(objects[spin]);
    }

    return spunObjects;
}

async function printSpin(listOfSpunObjects) {
    let i = 0;

    for (const door of doors) {
        if (door.children.length !== 0) {
            const currentBoxes = door.children[0];
            currentBoxes.style.transform = `translateY(${door.clientHeight + 100}px)`;
            currentBoxes.addEventListener("transitionend", () => {
                door.removeChild(currentBoxes);
            });
            await new Promise((resolve) => setTimeout(resolve, 380));
        }

        const boxes = document.createElement("div");
        boxes.style.transition = "0.36s ease-in-out";
        boxes.className = "boxes slideInTop";

        for (let n = 0; n < 3; n++) {
            const box = document.createElement("div");
            box.classList.add("box");
            box.textContent = listOfSpunObjects[i++];
            boxes.appendChild(box);
        }

        door.appendChild(boxes);
    }
}

function payout(spunObjects, bet) {
    let payoutAmount = 0;
    let multiplier = 0.8;
    const freqToWin = 4;
    const freqMap = new Map();

    for (let item of spunObjects) {
        freqMap.has(item) ? freqMap.set(item, freqMap.get(item) + 1) : freqMap.set(item, 1);
    }

    for (let [item, count] of freqMap.entries()) {
        if (item === '💎' && count >= freqToWin) multiplier = 1.3;
        if (count >= freqToWin) payoutAmount += bet * (count * multiplier);
    }

    const boxes = document.querySelectorAll(".box");
    for (let box of boxes) {
        if (freqMap.get(box.textContent) >= freqToWin) {
            box.classList.add("flashForWin");
        }
    }

    return payoutAmount;
}

async function spin() {
    const safeBet = bet;
    spinbtn.disabled = true;
    balance -= safeBet;
    balanceOutput.textContent = balance.toFixed(2);
    const spunObjects = generateSpin();
    printSpin(spunObjects);
    await new Promise((resolve) => setTimeout(resolve, 3300));
    spinbtn.disabled = false;
    const payoutAmount = payout(spunObjects, safeBet);
    balance += payoutAmount;
    balanceOutput.textContent = balance.toFixed(2);
    prevWinDisplay.textContent = payoutAmount.toFixed(2);
}

async function main() {
    const initRow = generateSpin();
    printSpin(initRow);
    const maxBet = 20;
    const buttonIncrement = 1;

    for (let btn of bettingBtns) {
        btn.addEventListener("click", () => {
            if (btn.id === "max-bet-btn") {
                bet = maxBet;
            } else {
                btn.id === "add" ? bet += buttonIncrement : bet -= buttonIncrement;
            }

            if (bet < 0) bet = 0;

            if (bet > maxBet) bet = maxBet;

            betDisplay.textContent = "$" + bet.toFixed(2);
        });
    }

    await new Promise ((resolve) => setTimeout(resolve, 1000));
    spinbtn.addEventListener("click", () => {
        if (bet > 0 && balance - bet >= 0) spin();
    });
}

main();

//EV calculation - currently ~ 0.77
function calculateExpectedValue(amountOfSpins) {
    let amountWagered = 0;
    let bet = 5;
    let totalPayout = 0;

    for (let i = 0; i < amountOfSpins; i++) {
        amountWagered += bet;
        totalPayout += payout(generateSpin(), bet);
    }

    console.log(`EV: ${totalPayout / amountWagered}`);
}

// calculateExpectedValue(100000);