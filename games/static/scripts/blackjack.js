//SHOE CLASS
class Shoe {
    constructor() {
        this.shoe = [];

        const suites = ["Spades", "Hearts", "Clubs", "Diamonds"];
        const values = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];

        for (let suite of suites) {
            for (let numValue of values) {
                let card = new Card(numValue, suite, window.staticPaths.cardPath + `${numValue}Of${suite}.png`);
                this.shoe.push(card);
            }
        }
    }

    drawCard() {
        const drawIndex = Math.floor(Math.random() * this.shoe.length);
        const card = this.shoe[drawIndex];

        return card;
    }
}




//HAND CLASS
class Hand {
    constructor() {
        this.cards = [];
        this.count = 0;
        this.selected = false;
        this.betOnThisHand = 0;
    }

    calculateHandCount() {
        this.count = 0;

        for (let card of this.cards) {
            const value = card.numValue;
            
            const faceCards = ["Jack", "Queen", "King"];

            if (faceCards.includes(value)) {
                this.count += 10;
            } else if (value === "Ace") {
                this.count += 11;
            } else {
                this.count += parseInt(value);
            }
        }

        return this.count;
    }

    addToHand(card) {
        this.cards.push(card);
        this.calculateHandCount();
    }

    popFromHand(removeThisCard) {
        for (const img of document.querySelectorAll(".game-cards")) {
            if (img.src.includes(`${removeThisCard.numValue}Of${removeThisCard.suite}`) && this.cards.includes(removeThisCard)) {
                img.parentElement.removeChild(img);
                break;
            }
        }

        this.cards.splice(1, 1);
        this.calculateHandCount();
    }
}




//CARD CLASS
class Card {
    constructor (numValue, suite, imagePath) {
        this.numValue = numValue;
        this.suite = suite;
        this.imagePath = imagePath;
    }
}




//GAME LOGIC
const playBtn = document.querySelector("#play-btn");
const hitBtn = document.querySelector("#hit-btn");
const stayBtn = document.querySelector("#stay-btn");
const splitBtn = document.querySelector("#split-btn");
const doubleBtn = document.querySelector("#double-btn");
const playerCardDisplay = document.querySelector("#display-player-cards");
const dealerCardDisplay = document.querySelector("#display-dealer-cards");
const playerSplitCardDisplay = document.querySelector("#display-player-split-cards");
const displayGameInfo = document.querySelector("#game-output-display");
const balanceOutput = document.querySelector("#balance-output");
const faceDownCardImage = document.createElement("img");
const dealerHand = new Hand();
const playerHand1 = new Hand();
const playerHand2 = new Hand();

let shoe = new Shoe();
let originalBet, totalBet, faceDownCard;

dealerHand.cardDisplay = dealerCardDisplay;
playerHand1.cardDisplay = playerCardDisplay;
playerHand2.cardDisplay = playerSplitCardDisplay;

function drawCard(hand) {
    const card = shoe.drawCard();
    hand.addToHand(card);
    
    const img = document.createElement('img');
    img.src = card.imagePath;
    img.className = "game-cards slideInTop";
    
    hand.cardDisplay.appendChild(img);
}

function clearHand(hand) {
    hand.cards = [];
    hand.count = 0;
            
    document.querySelectorAll(".game-cards").forEach(img => {
        img.parentElement.removeChild(img);
    });
}

function endGame(calcWinner) {
    faceDownCardImage.src = faceDownCard.imagePath;

    disableButtons();

    if (calcWinner) calculateWinner();

    balanceOutput.textContent = localBalance.toFixed(2);
    updateBalanceField(localBalance);

    setTimeout(() => {
        playBtn.disabled = false;
    }, 1000);
}

function checkForBlackjack() {
    const isDealerBlackjack = dealerHand.count === 21;
    const isPlayerBlackjack = playerHand1.count === 21;
    const didPlayerSplit = playerHand1.selected && playerHand2.count !== 0;

    if (!didPlayerSplit) {
        if (isDealerBlackjack) {
            isPlayerBlackjack ? localBalance += playerHand1.betOnThisHand : localBalance = localBalance;

            displayGameInfo.textContent = `${isPlayerBlackjack ? "Push" : "Dealer Blackjack"}`;

            return endGame(false);
        }

        if (isPlayerBlackjack) {
            localBalance += playerHand1.betOnThisHand * 2.5;

            displayGameInfo.textContent = "Player Blackjack";

            return endGame(false);
        }
    }
    
    const isPlayer2Blackjack = playerHand2.count === 21;

    if (isPlayerBlackjack && isPlayer2Blackjack) {
        localBalance += totalBet * 2.5;

        displayGameInfo.textContent = "Player Hand 1 Blackjack, Player Hand 2 Blackjack";

        return endGame(false);
    } 
    
    if (isPlayerBlackjack) {
        localBalance += playerHand1.betOnThisHand * 2.5;

        displayGameInfo.textContent = "Player Hand 1 Blackjack";

        return stay();
    }
    
    if (isPlayer2Blackjack) {
        localBalance += playerHand2.betOnThisHand * 2.5;

        playerHand1.selected = true;
        playerHand2.selected = false;

        displayGameInfo.textContent = "Player Hand 2 Blackjack";
    }
}

function checkForSplitAllowed(hand) {
    const faceCardCheck = ["Jack", "Queen", "King"];

    if ((faceCardCheck.includes(hand.cards[0].numValue) && faceCardCheck.includes(hand.cards[1].numValue)) || 
    ((faceCardCheck.includes(hand.cards[0].numValue)) && hand.cards[1].numValue === "10") || 
    ((faceCardCheck.includes(hand.cards[1].numValue)) && hand.cards[0].numValue === "10")) return true;

    return hand.cards[0].numValue === hand.cards[1].numValue;
}

function calculateWinner() {
    const dealerScore = dealerHand.count <= 21 ? dealerHand.count : 0;
    const playerScore = playerHand1.count <= 21 ? playerHand1.count : -1;
    const didPlayerSplit = playerHand2.count !== 0;
    const dealerWon = dealerScore > playerScore;

    console.log(`Dealer score = ${dealerScore}`);
    console.log(`Player score = ${playerScore}`);

    if (!didPlayerSplit) {
        if (dealerScore !== playerScore) {
            dealerWon ? localBalance = localBalance : localBalance += playerHand1.betOnThisHand * 2;

            return displayGameInfo.textContent = `${dealerWon ? "Dealer Win" : "Player Win"}`;
        }

        localBalance += totalBet;
        return displayGameInfo.textContent = "Push";
    }

    const player2Score = playerHand2.count <= 21 ? playerHand2.count : -1;
    const dealerWonHand2 = dealerScore > player2Score;
    let dealerVsPlayer1Message;
    let dealerVsPlayer2Message;
    console.log(`Player 2 score = ${player2Score}`);

    if (dealerScore !== playerScore) {
        dealerWon ? localBalance = localBalance : localBalance += playerHand1.betOnThisHand * 2;

        dealerVsPlayer1Message = dealerWon ? "Dealer Win Hand 1" : "Player Win Hand 1";
    } else {
        localBalance += totalBet;

        dealerVsPlayer1Message = "Push";
    }

    if (dealerScore !== player2Score) {
        dealerWonHand2 ? localBalance = localBalance : localBalance += playerHand2.betOnThisHand * 2;

        dealerVsPlayer2Message = dealerWonHand2 ? "Dealer Win Hand 2" : "Player Win Hand 2";
    } else {
        localBalance += totalBet;

        dealerVsPlayer2Message = "Push";
    }

    displayGameInfo.textContent = `${dealerVsPlayer1Message}, ${dealerVsPlayer2Message}`;
}

function disableButtons() {
    stayBtn.disabled = true;
    hitBtn.disabled = true;
    doubleBtn.disabled = true;
    splitBtn.disabled = true;
}

function reduceHandAces(hand) {
    if (hand.count <= 21) return;

    let numberOfAces = hand.cards.filter(card => card.numValue === "Ace").length;
    let trackAcesReduced = 0;

    while (hand.count > 21 && trackAcesReduced < numberOfAces) {
        hand.count -= 10;
        trackAcesReduced++;
    }
}

function runDealerTurn() {
    if (dealerHand.count === 22) {
        reduceHandAces(dealerHand);
    }

    while (dealerHand.count < 17) {
        drawCard(dealerHand);
        reduceHandAces(dealerHand);
    }

    if (dealerHand.count - 10 === 7 && dealerHand.cards.some(card => card.numValue === 'Ace')) {
        drawCard(dealerHand);
        reduceHandAces(dealerHand);
    }

    endGame(true);
}

function hit() {
    if (playerHand1.selected && playerHand1.count < 21) drawCard(playerHand1);

    if (playerHand2.selected && playerHand2.count < 21) drawCard(playerHand2);

    reduceHandAces(playerHand1);
    reduceHandAces(playerHand2);

    if (playerHand1.count < 21) {
        doubleBtn.disabled = true;
        splitBtn.disabled = true;
        return;
    }

    if (playerHand1.count >= 21 && playerHand2.count === 0) {
        return playerHand1.count > 21 ? endGame(true) : runDealerTurn();
    }

    if (playerHand2.count > 21 || playerHand2.count === 21) {
        return playerHand2.count > 21 ? endGame(true) : runDealerTurn();
    }

    playerHand1.selected = false;
    playerHand2.selected = true;

    doubleBtn.disabled = false;

    playerCardDisplay.style.backgroundColor = null;
    playerSplitCardDisplay.style.backgroundColor = 'limegreen';
}

function double() {
    localBalance -= originalBet;
    balanceOutput.textContent = localBalance.toFixed(2);

    if (playerHand1.selected) {
        playerHand1.betOnThisHand += originalBet;

        drawCard(playerHand1);
        reduceHandAces(playerHand1);
    }

    if (playerHand2.selected) {
        playerHand2.betOnThisHand += originalBet;

        drawCard(playerHand2);
        reduceHandAces(playerHand2);
        runDealerTurn();
    }

    const didPlayerSplit = playerHand2.count !== 0;

    if (!didPlayerSplit) {
        return playerHand1.count > 21 ? endGame(true) : runDealerTurn();
    }

    playerHand1.selected = false;
    playerHand2.selected = true;

    playerCardDisplay.style.backgroundColor = null;
    playerSplitCardDisplay.style.backgroundColor = 'limegreen';
}

function stay() {
    const didPlayerSplit = playerHand1.selected && playerHand2.count !== 0;

    if (!didPlayerSplit) {
        return runDealerTurn();
    } 

    playerHand1.selected = false;
    playerHand2.selected = true;

    doubleBtn.disabled = false;

    playerCardDisplay.style.backgroundColor = null;
    playerSplitCardDisplay.style.backgroundColor = 'limegreen';
}

function split() {
    localBalance -= originalBet;
    playerHand2.betOnThisHand = playerHand1.betOnThisHand;
    balanceOutput.textContent = localBalance.toFixed(2);

    splitBtn.disabled = true;

    playerCardDisplay.style.backgroundColor = 'limegreen';

    const splitCard = playerHand1.cards[1];
    playerHand2.addToHand(splitCard);
    playerHand1.popFromHand(splitCard);

    const img = document.createElement('img');
    img.src = splitCard.imagePath;
    img.classList.add("game-cards");

    playerSplitCardDisplay.appendChild(img);

    drawCard(playerHand1);
    drawCard(playerHand2);
    checkForBlackjack();
}

async function game() {
    const userBetInput = document.querySelector("#user-input-bet").value;
    clearHand(dealerHand);
    clearHand(playerHand1);
    clearHand(playerHand2);
    displayGameInfo.textContent = "";

    originalBet = Number(userBetInput) >= 0.01 && Number(userBetInput) <= localBalance ? Number(userBetInput) : 0;

    if (originalBet === 0) return window.alert("Invalid Bet");

    playerHand1.betOnThisHand = originalBet;
    totalBet = originalBet;
    localBalance -= totalBet;
    balanceOutput.textContent = localBalance.toFixed(2);

    playBtn.disabled = true;

    playerHand1.selected = true;
    playerHand2.selected = false;

    playerCardDisplay.style.backgroundColor = null;
    playerSplitCardDisplay.style.backgroundColor = null;

    faceDownCard = shoe.drawCard();
    dealerHand.addToHand(faceDownCard);

    faceDownCardImage.src = window.staticPaths.backOfCard;
    faceDownCardImage.className = "game-cards slideInTop";

    dealerCardDisplay.appendChild(faceDownCardImage);

    await new Promise(resolve => setTimeout(() => {
        drawCard(playerHand1);
        resolve();
    }, 750));

    await new Promise(resolve => setTimeout(() => {
        drawCard(dealerHand);
        resolve();
    }, 550));

    await new Promise(resolve => setTimeout(() => {
        drawCard(playerHand1);
        resolve();
    }, 750));
    
    checkForSplitAllowed(playerHand1) ? splitBtn.disabled = false : splitBtn.disabled = true;
    hitBtn.addEventListener("click", hit);
    if (localBalance - originalBet >= 0) doubleBtn.addEventListener("click", double);
    stayBtn.addEventListener("click", stay);
    if (localBalance - originalBet >= 0) splitBtn.addEventListener("click", split);
    stayBtn.disabled = false;
    hitBtn.disabled = false;
    doubleBtn.disabled = false;
    checkForBlackjack();
}

window.addEventListener("DOMContentLoaded", () => {
    playBtn.addEventListener("click", game);
});