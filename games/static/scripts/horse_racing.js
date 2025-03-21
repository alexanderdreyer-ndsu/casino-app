const playBtn = document.querySelector("#play-btn");
const betMenu = document.querySelector("#bet-menu");
const betInputForm = document.querySelector("#bet-input-form");
const gameWindow = document.querySelector("#game");
const betInfoLabel = document.querySelector("#bet-info-label");
const balanceOutput = document.querySelector("#balance-output");

playBtn.addEventListener("click", () => betMenu.showModal());

betInputForm.addEventListener("submit", (event) => {
    event.preventDefault();
    betMenu.close();

    const lanes = document.querySelector("#lanes").value;
    const bet = document.querySelector("#bet").value;
    const betLane = document.querySelector("#on-lane").value;

    if (localBalance - bet < 0) {
        return window.alert("Bet Amount Rejected");
    }

    betInfoLabel.textContent = `Bet: $${bet}\tLane: ${betLane}`;
    balanceOutput.textContent = (localBalance - bet).toFixed(2);

    gameWindow.innerHTML = "";

    for (let i = 0; i < lanes; i++) {
        const thisLane = document.createElement("div");
        thisLane.classList.add("lane");
        gameWindow.appendChild(thisLane);

        const thisHorse = document.createElement("div");
        thisLane.appendChild(thisHorse);
        thisHorse.textContent = "🏇";
        thisHorse.classList.add("horse");
    }

    const positions = [];
    let raceOver = false;
    let fastestHorse;
    const horses = document.querySelectorAll(".horse");
    let win = false;

    for (let i = 0; i < lanes; i++) {
        positions.push(0);
    }

    let raceInterval = setInterval(() => {
        if (raceOver) {
            clearInterval(raceInterval);

            if (`Lane ${betLane}` === fastestHorse.parentElement.id) {
                localBalance += bet * lanes;
                win = true;
            } else {
                localBalance -= bet;
            }

            betInfoLabel.textContent = win ? `Win: $${bet * lanes}` : `Loss`;
            fastestHorse.parentElement.style.borderColor = "gold";

            updateBalanceField(localBalance);
            balanceOutput.textContent = localBalance.toFixed(2);
            return;
        }

        for (let i = 0; i < horses.length; i++) {
            positions[i] += Math.random() * 5;
            horses[i].style.left = `${positions[i]}px`;

            if (positions[i] >= horses[i].parentElement.clientWidth) {
                fastestHorse = horses[i];
                raceOver = true;
            }
        }
    }, 50);
});