const spinBtn = document.querySelector("#spin-btn");
const bettingBtns = document.querySelectorAll(".bettingBtns");
const balanceOutput = document.querySelector("#balance-output");
const betDisplay = document.querySelector("#betDisplay");
const prevWinDisplay = document.querySelector("#prevWinDisplay");
let bet = 0;
betDisplay.textContent = bet.toFixed(2);

function generateSpin() {
    const objects = ['🍒', '🍋', '💎', '7️⃣', '🍇'];
    let spunRow = [];

    for (let i = 0; i < 3; i++) {
        let spin = Math.floor(Math.random() * objects.length);
        spunRow.push(objects[spin]);
    }

    return spunRow;
}

async function printSpin(spunRow) {
    let i = 0;
    let j = 1

    const doors = document.querySelectorAll(".door");

    for (const door of doors) {
        if (door.children.length !== 0) {
            const currentItem = door.children[0];
            currentItem.style.transform = `translateY(${door.clientHeight}px)`;
            currentItem.addEventListener("transitionend", () => {
                door.removeChild(currentItem);
            });
            await new Promise((resolve) => setTimeout(resolve, j++ + 400));
        }

        const box = document.createElement("div");
        box.textContent = spunRow[i++];
        box.style.transition = "0.4s ease-in";
        box.className = "box slideInTop";
        door.appendChild(box);
    }
}

function compareArrays(winningRows, spunRow) {
    const sortFirst = winningRows.sort();
    const sortSecond = spunRow.sort();

    return sortFirst.every((value, index) => value === sortSecond[index]);
}

function payout(spunRow, bet) {
    const winningRows = new Map();
    winningRows.set(['💎', '💎', '💎'], 30);
    winningRows.set(['7️⃣', '7️⃣', '7️⃣'], 7);
    winningRows.set(['🍒', '🍒', '🍒'], 5);
    winningRows.set(['🍋', '🍋', '🍋'], 3);
    winningRows.set(['🍇', '🍇', '🍇'], 3);
    winningRows.set(['7️⃣', '💎', '7️⃣'], 5);
    winningRows.set(['🍒', '🍋', '🍇'], 5);
    winningRows.set(['💎', '7️⃣', '💎'], 7);
    let payoutAmount = 0;

    for (let row of winningRows.keys()) {
        if (compareArrays(row, spunRow)) {
            payoutAmount += bet * winningRows.get(row);
        }
    }

    return payoutAmount;
}

function spin() {
    spinBtn.disabled = true;
    localBalance -= bet;
    balanceOutput.textContent = localBalance.toFixed(2);
    const spunRow = generateSpin();

    setTimeout(() => {
        spinBtn.disabled = false;
    }, 2200);

    printSpin(spunRow);

    setTimeout(() => {
        const payoutAmount = payout(spunRow, bet);
        localBalance += payoutAmount;

        balanceOutput.textContent = localBalance.toFixed(2);
        prevWinDisplay.textContent = payoutAmount.toFixed(2);
        updateBalanceField(localBalance);
    }, 2200);
}

function main() {
    const initRow = generateSpin();
    printSpin(initRow);
    const maxBet = 25;
    const buttonIncrement = 1;

    for (const btn of bettingBtns) {
        btn.addEventListener("click", function() {
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

    spinBtn.addEventListener("click", () => {
        if (bet > 0 && localBalance - bet >= 0) spin();
    });
}

main();

//EV calculation - currently ~ 0.90
function calculateExpectedValue(amountOfSpins) {
    let amountWagered = 0;
    const bet = 1;
    let totalPayout = 0;

    for (let i = 0; i < amountOfSpins; i++) {
        amountWagered += bet;
        totalPayout += payout(generateSpin(), bet);
    }

    console.log(`EV: ${totalPayout / amountWagered}`);
}

// calculateExpectedValue(100000);