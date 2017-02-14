window.addEventListener("load", function () {
    let game = new Game();
    game.start();
});

// Card suits
const SUIT = {
    HEART: Symbol('♥'),
    DIAMOND: Symbol('♦'),
    SPADE: Symbol('♠'),
    CLUB: Symbol('♣'),
    JOKER: Symbol('J')
};

/**
 * Card holder class
 */
class CardHolder {

    constructor(array) {
        this.array = array;
        this.index = 0;
    }

    shuffle() {
        for (let i = this.array.length; i; i--) {
            let j = Math.floor(Math.random() * i);
            [this.array[i - 1], this.array[j]] = [this.array[j], this.array[i - 1]];
        }
    }

    next() {
        return this.array[this.index++];
    }

    remaining() {
        return 53 - this.index;
    }
}

/**
 * Card
 */
class Card {

    constructor(stage, suit, number) {
        this.stage = stage;
        this.suit = suit;
        this.number = number;
    }

    setLocation(x, y) {
        this.x = x;
        this.y = y;
    }

    drawFaceUp() {
        let x = this.x;
        let y = this.y;

        let color;
        switch (this.suit) {
            case SUIT.HEART:
                color = "#FF0000";
                break;
            case SUIT.DIAMOND:
                color = "#FF0000";
                break;
            case SUIT.SPADE:
                color = "#000000";
                break;
            case SUIT.CLUB:
                color = "#000000";
                break;
            case SUIT.JOKER:
                color = "#000000";
                break;
            default:
                console.error("Unknown card suit detected!");
                return;
        }

        this.graphics = new PIXI.Graphics();

        this.graphics.lineStyle(2, 0x000000, 1);
        this.graphics.beginFill(0xFFFFFF, 1);
        this.graphics.drawRect(x, y, Card.getWidth(), Card.getHeight());
        this.graphics.interactive = true;
        this.graphics.buttonMode = true;
        this.graphics.hitArea = new PIXI.Rectangle(x, y, Card.getWidth(), Card.getHeight());

        let cardStr;
        if (this.suit != SUIT.JOKER) {
            cardStr = this.getSuit() + this.number;
        } else {
            cardStr = this.getSuit();
        }

        let cardSuit = new PIXI.Text(
            cardStr,
            {
                fontSize: '40px',
                fill: color
            }
        );

        this.cardSuit = cardSuit;

        cardSuit.x = x + ((Card.getWidth() / 2) - (cardSuit.width / 2));
        cardSuit.y = y + (Card.getHeight() / 3);
        cardSuit.hitArea = new PIXI.Rectangle(cardSuit.x, cardSuit.y, cardSuit.width, cardSuit.height);

        this.stage.addChild(this.graphics);
        this.stage.addChild(cardSuit);
    }

    drawFaceDown() {
        let x = this.x;
        let y = this.y;

        this.graphics = new PIXI.Graphics();

        this.graphics.lineStyle(2, 0x000000, 1);
        this.graphics.beginFill(0x165E83, 1);
        this.graphics.drawRect(x, y, Card.getWidth(), Card.getHeight());
        this.graphics.interactive = true;
        this.graphics.buttonMode = true;
        this.graphics.hitArea = new PIXI.Rectangle(x, y, Card.getWidth(), Card.getHeight());

        let instance = this;
        let stage = this.stage;
        this.graphics.click = function (e) {
            stage.removeChild(instance.graphics);
            instance.drawFaceUp();
        };
        stage.addChild(instance.graphics);
    }

    clear() {
        this.stage.removeChild(this.graphics);
        this.stage.removeChild(this.cardSuit);
    }

    getSuit() {
        return this.suit.toString().slice(7, -1);
    }

    static getWidth() {
        return 90;
    }

    static getHeight() {
        return 120;
    }
}

class Button {

    constructor(stage, text) {
        this.stage = stage;
        this.text = text;
    }

    setCallback(callback) {
        this.callback = callback;
    }

    setBackgroundColor(backgroundColor) {
        this.backgroundColor = backgroundColor;
    }

    setLocation(x, y) {
        this.x = x;
        this.y = y;
    }

    setWidth(width) {
        this.width = width;
    }

    setHeight(height) {
        this.height = height;
    }

    setTextLocationOffset(xTLocOffset, yTLocOffset) {
        this.xTLocOffset = xTLocOffset;
        this.yTLocOffset = yTLocOffset;
    }

    draw() {
        let instance = this;
        let stage = this.stage;

        let text = this.text;

        let x = this.x;
        let y = this.y;
        let width = this.width;
        let height = this.height;

        let backgroundColor = this.backgroundColor;
        let callback = this.callback;

        let xTLocOffset = this.xTLocOffset;
        let yTLocOffset = this.yTLocOffset;

        this.graphics = new PIXI.Graphics();

        this.graphics.lineStyle(2, 0x000000, 1);
        this.graphics.beginFill(backgroundColor, 1);
        this.graphics.drawRect(x, y, width, height);
        this.graphics.interactive = true;
        this.graphics.buttonMode = true;
        this.graphics.hitArea = new PIXI.Rectangle(x, y, width, height);
        this.graphics.click = function (e) {
            callback();
        };
        stage.addChild(instance.graphics);

        this.buttonText = new PIXI.Text(
            text,
            {
                fontSize: '36px',
                fontWeight: 'bold',
                fill: '#FFFFFF'
            }
        );
        this.buttonText.x = x + xTLocOffset;
        this.buttonText.y = y + yTLocOffset;
        this.buttonText.hitArea =
            new PIXI.Rectangle(
                this.buttonText.x,
                this.buttonText.y,
                this.buttonText.width,
                this.buttonText.height
            );
        stage.addChild(this.buttonText);
    }

    clear() {
        let card = this;
        let stage = this.stage;
        stage.removeChild(card.graphics);
        stage.removeChild(card.buttonText);
    }
}

class Game {

    constructor(){
        this.width = 800;
        this.height = 640;
        this.lock = false;
    }

    start() {
        this.win = 0;
        this.lose = 0;
        this.draw = 0;
        this.score = 0;

        let game = this;

        let renderer = PIXI.autoDetectRenderer(this.width, this.height, {backgroundColor: 0x00B040});
        this.renderer = renderer;
        document.body.appendChild(renderer.view);

        let stage = new PIXI.Container();
        this.stage = stage;
        stage.interactive = true;

        let titleText = new PIXI.Text(
            'HIGH & LOW',
            {
                fontSize: '36px',
                fontWeight: 'bold',
                fill: '#FFFFFF'
            }
        );
        titleText.x = (this.width / 2) - (titleText.width / 2);
        titleText.y = ((this.height / 2) - (titleText.height / 2)) / 4;
        stage.addChild(titleText);

        let highButton = new Button(stage, "▲ HIGH");
        highButton.setLocation(this.width / 2.5, this.height / 3);
        highButton.setBackgroundColor(0xFF0000);
        highButton.setWidth(150);
        highButton.setHeight(50);
        highButton.setTextLocationOffset(5, 5);
        highButton.setCallback(function () {
            if (game.lock)return;
            game.lock = true;

            let card1 = game.card1;
            let card2 = game.card2;

            if (card1.number == card2.number) {
                game.draw++;
            } else if (card1.number < card2.number) {
                game.win++;
                game.score += card2.number;
            } else {
                game.lose++;
            }

            setTimeout(function () {
                card2.clear();
                card2.drawFaceUp();
                game.renderer.render(game.stage);

                setTimeout(function () {
                    card1.clear();
                    card2.clear();
                    game.renderer.render(game.stage);

                    setTimeout(function () {
                        game.next();
                    }, 500);
                }, 500);
            }, 500);
        });
        highButton.draw();
        this.highButton = highButton;

        let lowButton = new Button(stage, "▼ LOW");
        lowButton.setLocation(this.width / 2.5, this.height / 2.25);
        lowButton.setBackgroundColor(0x0000FF);
        lowButton.setWidth(150);
        lowButton.setHeight(50);
        lowButton.setTextLocationOffset(5, 5);
        lowButton.setCallback(function () {
            if (game.lock)return;
            game.lock = true;

            let card1 = game.card1;
            let card2 = game.card2;

            if (card1.number == card2.number) {
                game.draw++;
            } else if (card1.number > card2.number) {
                game.win++;
                game.score += card2.number;
            } else {
                game.lose++;
            }

            setTimeout(function () {
                card2.clear();
                card2.drawFaceUp();
                game.renderer.render(game.stage);

                setTimeout(function () {
                    card1.clear();
                    card2.clear();
                    game.renderer.render(game.stage);

                    setTimeout(function () {
                        game.next();
                    }, 500);
                }, 500);
            }, 500);
        });
        lowButton.draw();
        this.lowButton = lowButton;


        let cards = new Array(53);
        for (let i = 0; i < cards.length; i++) {
            if (0 <= i && i <= 12) {
                cards[i] = new Card(stage, SUIT.HEART, i + 1);
            } else if (13 <= i && i <= 25) {
                cards[i] = new Card(stage, SUIT.DIAMOND, i + 1 - 13);
            } else if (26 <= i && i <= 38) {
                cards[i] = new Card(stage, SUIT.SPADE, i + 1 - 26);
            } else if (39 <= i && i <= 51) {
                cards[i] = new Card(stage, SUIT.CLUB, i + 1 - 39);
            } else if (51 <= i) {
                cards[i] = new Card(stage, SUIT.JOKER, 14);
            }
        }

        let holder = new CardHolder(cards);
        this.holder = holder;
        for (let i = 0; i < 5; i++) {
            holder.shuffle();
        }

        this.next();
    }

    next() {
        if (this.holder.remaining() < 2) {
            this.showResult();
            return;
        }

        let card1 = this.holder.next();
        let card2 = this.holder.next();
        this.card1 = card1;
        this.card2 = card2;

        card1.setLocation((this.width / 4) - (Card.getWidth() / 2), this.height / 3);
        card2.setLocation(((this.width / 4) * 3) - (Card.getWidth() / 2), this.height / 3);

        card1.drawFaceUp();
        card2.drawFaceDown();
        this.renderer.render(this.stage);

        this.lock = false;
    }

    showResult() {
        let instance = this;
        let highButton = this.highButton;
        let lowButton = this.lowButton;
        setTimeout(function () {
            highButton.clear();
            lowButton.clear();
            let resultText = new PIXI.Text(
                'Result\n\nwin: ' + instance.win + '\nlose: ' + instance.lose + '\ndraw: ' + instance.draw + '\n\nScore: ' + instance.score,
                {
                    fontSize: '25px',
                    fontWeight: 'bold',
                    fill: '#FFFFFF'
                }
            );
            resultText.x = (instance.width / 2) - (resultText.width / 2);
            resultText.y = ((instance.height / 2) - (resultText.height / 2)) / 2 * 2;
            instance.stage.addChild(resultText);
            instance.renderer.render(instance.stage);
        }, 500);
    }
}