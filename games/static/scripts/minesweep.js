const balanceDisplay = document.querySelector("#balance-output");
const play = document.querySelector("#play-btn");
const cashoutListeners = [];

play.addEventListener("click", () => {
    const cells = document.querySelectorAll(".cell");
    const cashoutBtn = document.querySelector("#cashout");
    const bet = document.querySelector("#input").value;
    const bombs = document.querySelector("#bomb-count").value;
    const multiplierHeader = document.querySelector("#multiplier-header");
    if ((bet > localBalance || bet <= 0) || (bombs < 1 || bombs > 24)) return;
    play.disabled = true;
    cashoutBtn.disabled = true;
    localBalance -= bet;
    balanceDisplay.textContent = localBalance.toFixed(2);
    updateBalanceField(localBalance);
    multiplierHeader.textContent = "Multiplier 0x";
    let payoutMultiplier = 0;

    cells.forEach(cell => {
        cell.dataset.containsBomb = "0";
        cell.textContent = "";
        cell.className = "cell";
    });

    const openBoxes = [];
    for (let i = 0; i < 25; i++) openBoxes.push(i);

    for (let i = 0; i < bombs; i++) {
        const index = Math.floor(Math.random() * openBoxes.length);
        cells[openBoxes[index]].dataset.containsBomb = "1";
        openBoxes.splice(index, 1);
    }

    cells.forEach(cell => {
        cell.addEventListener("click", () => {
            if (cell.dataset.containsBomb === "1") {
                multiplierHeader.textContent = "Bust";
                return gameOver();
            }

            cashoutBtn.disabled = false;
            cell.classList.add("flipped-safe");
            //used desmos graphing calculator to come up with a payout curve
            payoutMultiplier += 10 * ((bombs / 35) ** 2.4) + 0.14;
            multiplierHeader.textContent = `Multiplier ${payoutMultiplier.toFixed(2)}x`;
        });
    });

    cashoutListeners.forEach(listener => {
        cashoutBtn.removeEventListener("click", listener);
    });

    cashoutBtn.addEventListener("click", cashout);

    const cashoutHandler = () => {
        localBalance += bet * payoutMultiplier;
        gameOver();
    };

    cashoutListeners.push(cashoutHandler);
    cashoutBtn.addEventListener("click", cashoutHandler);

    function gameOver() {
        cells.forEach(cell => {
            cell.classList.add(`${cell.dataset.containsBomb === "1" ? "flipped-bomb" : "flipped-safe"}`);
            if (cell.classList.contains("flipped-bomb")) cell.textContent = "💣";
        });
    
        balanceDisplay.textContent = localBalance.toFixed(2);
        updateBalanceField(localBalance);
        play.disabled = false;
        cashoutBtn.disabled = true;
    }
});