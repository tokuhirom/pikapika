// Returns a random integer between min (included) and max (excluded)
// // Using Math.round() will give you a non-uniform distribution!
//
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

class ForestCell {
    getColor() {
        return "#008800";
    }
}

class SeaCell {
    getColor() {
        return "#002288";
    }
}

class GrasslandCell {
    getColor() {
        return "#003300";
    }
}

class MountainCell {
    getColor() {
        return "#544545";
    }
}

// ----------------------------------------------------------------------
//
// Animals
//
// ----------------------------------------------------------------------

class Rabbit {
    getCharacter() {
        return "🐰";
    }

    getColor() {
        return "#cc00cc";
    }
}

class Tiger {
    getCharacter() {
        return "🐯";
    }

    getColor() {
        return "#cc00cc";
    }
}

// ----------------------------------------------------------------------

class CharacterContainer {
    constructor(x, y, character) {
        this.x = x;
        this.y = y;
        this.character = character;
    }
}

class Map {
    constructor() {
        this.width  = 64;
        this.height = 48;

        this.cells = [];
        for (let y=0; y<this.height; y++) {
            for (let x=0; x<this.width; x++) {
                const n = getRandomInt(0, 100);
                if (n<=7) {
                    this.put(x, y, new SeaCell());
                } else if (n <= 30) {
                    this.put(x, y, new MountainCell());
                } else if (n<=70) {
                    this.put(x, y, new ForestCell());
                } else {
                    this.put(x, y, new GrasslandCell());
                }
            }
        }
    }

    put(x, y, cell) {
        this.cells[x + y*this.width] = cell;
    }

    get(x, y) {
        return this.cells[x + y*this.width];
    }
}

class Game {
    constructor() {
        this.map = new Map();
        this.put_characters();
        this.init_canvas();
    }

    put_characters() {
        const characters = [];
        const num_rabbits = getRandomInt(2, 10);
        for (let i=0; i<num_rabbits; i++) {
            characters.push(new CharacterContainer(getRandomInt(0, 640), getRandomInt(0, 480), new Rabbit()));
        }
        const num_tigers = getRandomInt(2, 10);
        for (let i=0; i<num_tigers; i++) {
            characters.push(new CharacterContainer(getRandomInt(0, 640), getRandomInt(0, 480), new Tiger()));
        }
        this.characters = characters;
    }

    init_canvas() {
        const c = document.getElementById('game');
        c.width = 512;
        c.height = 480;

        this.ctx = c.getContext("2d");
        this.ctx.fillStyle="#000000";
        this.ctx.fillRect(0,0,640,480);
    }

    run() {
        this.render_map();

        this.next_tick();
        setInterval(
            () => {
                this.next_tick();
            }, 1000
        );
    }

    next_tick() {
        this.render_map();

        // move characters
        // eat something?

        // work tigers.
        // if hungry?
        //    there's food?
        //       eat(kill it, and hunger--)
        //    else
        //       go to food
        //    end
        // else
        //    hunger++
        // end

        // render characters
        for (let c of this.characters) {
            this.ctx.fillStyle=c.character.getColor();
            this.ctx.font="8px Helvetica";
            this.ctx.fillText(c.character.getCharacter(), c.x, c.y, 10);
        }
    }

    render_map() {
        for (let y=0, l=this.map.height; y<l; y++) {
            for (let x=0, m=this.map.width; x<m; x++) {
                const cell = this.map.get(x, y);
                this.ctx.fillStyle=cell.getColor();
                this.ctx.fillRect(x*10,y*10,10,10);
            }
        }
    }
}

function mainLoop() {
    const game = new Game();
    game.run();
}

document.addEventListener("DOMContentLoaded", function(event) {
    mainLoop();
});

