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