
const DEBUGGING = location.hash.indexOf("debug") >= 0;

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

// http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
function shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

// セカイノオワリ
class EdgeCell {
    constructor() { this.grass = 0; }

    getColor() { return "#000000"; }
    isCharacterAvailable() { return false; }
    growGrass() { }
}

class ForestCell {
    constructor() {
        this.grass = getRandomInt(0, 20);
    }

    getColor() {
        return "#008800";
    }
    isCharacterAvailable() {
        return true;
    }

    growGrass() {
        this.grass += 2;
    }
}

class SeaCell {
    constructor() {
        this.grass = getRandomInt(0, 0);
    }

    getColor() {
        return "#002288";
    }
    isCharacterAvailable() {
        return false;
    }
    growGrass() { }
}

class GrasslandCell {
    constructor() {
        this.grass = getRandomInt(0, 50);
    }

    getColor() {
        return "#003300";
    }
    isCharacterAvailable() {
        return true;
    }

    growGrass() {
        this.grass += 3;
    }
}

class MountainCell {
    constructor() {
        this.grass = getRandomInt(0, 10);
    }

    getColor() {
        return "#544545";
    }
    isCharacterAvailable() {
        return true;
    }

    growGrass() {
        this.grass += 0;
    }
}

// ----------------------------------------------------------------------
//
// Animals
//
// ----------------------------------------------------------------------

const MALE = Symbol("MALE");
const FEMALE = Symbol("FEMALE");

let rabbit_counter = 0;

class Rabbit {
    constructor() {
        this.hunger = 0;
        this.name = "Rabbit " + (++rabbit_counter);
        this.sex = getRandomInt(0, 2) == 0 ? MALE : FEMALE;
    }

    getCharacter() {
        if (this.death) {
            return "💀";
        } else {
            return "🐰";
        }
    }

    getColor() {
        return "#cc00cc";
    }
}

let tiger_counter = 0;

class Tiger {
    constructor() {
        this.hunger = 0;
        this.name = "Tiger " + ++tiger_counter;
    }

    getCharacter() {
        if (this.death) {
            return "💀";
        } else {
            return "🐯";
        }
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
    constructor(width, height) {
        this.width  = width;
        this.height = height;

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
        if (x < 0 || x > this.width || y < 0 || y > this.height) {
            return new EdgeCell();
        }
        const retval = this.cells[x + y*this.width];
        if (retval) {
            return retval;
        } else {
            return new EdgeCell();
        }
    }
}

class Game {
    constructor(pixel_width, pixel_height, tile_size, char_size) {
        this.pixel_width = pixel_width;
        this.pixel_height = pixel_height;
        this.tile_width = Math.floor(pixel_width/tile_size);
        this.tile_height = Math.floor(pixel_height/tile_size);
        this.tile_size = tile_size;
        this.char_size = char_size;
        this.map = new Map(this.tile_width, this.tile_height);
        this.init_characters();
        this.init_canvas();
        this.interval = DEBUGGING ? 10 : 300;
        document.body.onkeydown = (e) => {
            this.keydown(e);
        };
    }

    init_characters() {
        this.characters = [];
        const num_rabbits = Math.floor(this.tile_width * this.tile_height/20);
        for (let i=0; i<num_rabbits; i++) {
            let x = getRandomInt(0, this.tile_width);
            let y = getRandomInt(0, this.tile_height);
            const cell = this.map.get(x, y);
            if (cell.isCharacterAvailable()) {
                this.put_character(x, y, new Rabbit());
            }
        }
        const num_tigers = Math.ceil(this.tile_width * this.tile_height/100);
        for (let i=0; i<num_tigers; i++) {
            let x = getRandomInt(0, this.tile_width);
            let y = getRandomInt(0, this.tile_height);
            if (this.map.get(x, y).isCharacterAvailable()) {
                this.put_character(x, y, new Tiger());
            }
        }
    }

    keydown(e) {
        if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
            if (e.key == "1") {
                this.interval = 300;
            } else if (e.key == "2") {
                this.interval = 150;
            } else if (e.key == "3") {
                this.interval = 70;
            } else if (e.key == "4") {
                this.interval = 10;
            } else if (e.key == "5") {
                this.interval = 1;
            }
        }
    }

    put_character(x, y, character) {
        this.characters.push(new CharacterContainer(x, y, character));
    }

    init_canvas() {
        const c = document.getElementById('game');
        c.width = this.pixel_width;
        c.height = this.pixel_height;

        this.ctx = c.getContext("2d");
        this.ctx.fillStyle="#000000";
        this.ctx.fillRect(0,0,this.pixel_width,this.pixel_height);
    }

    run() {
        this.render_map();

        this.next_tick();
    }

    next_tick() {
        let run;
        run = () => {
            try {
                this.do_next_tick();
            } catch (e) {
                console.log(e);
            } finally {
                setTimeout(run, this.interval);
            }
        };
        setTimeout(run, this.interval);
    }

    do_next_tick() {
        this.render_map();

        // move characters
        // eat something?
        for (let container of this.characters) {
            let character = container.character;
            if (character instanceof Rabbit) {
                this.work_rabbit(container, character);
            } else if (character instanceof Tiger) {
                this.work_tiger(container, character);
            }
        }

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

        // TODO grow glasses
        this.eachCell((x, y) => {
            const cell = this.map.get(x, y);
            cell.growGrass();
        });

        // render characters
        for (let c of this.characters) {
            this.ctx.fillStyle=c.character.getColor();
            this.ctx.font="8px Helvetica";
            this.ctx.fillText(c.character.getCharacter(), c.x*this.char_size, c.y*this.char_size, this.char_size);
        }
    }

    work_rabbit(container, rabbit) {
        if (rabbit.death) {
            // TODO 腐敗度++
        } else {
            // TODO if rabbit on plain, eat 
            const cell = this.map.get(container.x, container.y);
            const grass = cell.grass;
            if (grass > 0) {
                const ate = Math.max(getRandomInt(1, grass), 10);
                rabbit.hunger = Math.max(rabbit.hunger - ate, 0);
                cell.grass -= ate;
                // console.log(rabbit.name + " ate " + ate + " grass(Current hunger: " + rabbit.hunger + ")");
            }

            this.breed(container);
 
            rabbit.hunger++;

            if (rabbit.hunger > 100) {
                rabbit.death = true;
                console.log(rabbit.name + " death");
            }

            // Random move
            this.random_move(container);
        }
    }

    breed(container) {
        const character = container.character;
        for (const dx of [-1, 1]) {
            for (const dy of [-1, 1]) {
                const x = container.x + dx;
                const y = container.y + dy;
                for (const partner of this.getCharacters(x, y)) {
                    if (character.prototype === partner.prototype) {
                        if (getRandomInt(0, 300) < 1) {
                            (() => {
                                // 隣接の空白ますに spawn
                                for (const dx of [-1, 1]) {
                                    for (const dy of [-1, 1]) {
                                        const x = container.x + dx;
                                        const y = container.y + dy;
                                        if (this.getCharacters(x, y).length == 0) {
                                            console.log('spawn character');
                                            this.put_character(x, y, new character.constructor());
                                            return;
                                        }
                                    }
                                }
                            })();
                            return;
                        }
                    }
                }
            }
        }
    }

    getCharacters(x, y) {
        const cell = this.map.get(x, y);
        if (!cell.isCharacterAvailable()) {
            return [];
        }

        const retval = [];
        for (const partner of this.characters) {
            if (partner.x == x && partner.y == y) {
                retval.push(partner);
            }
        }
        return retval;
    }

    work_tiger(container, tiger) {
        if (tiger.death) {
            // TODO 腐敗度++
        } else {
            // TODO if tiger on plain, eat 
            const cell = this.map.get(container.x, container.y);

            if (tiger.hunger > (DEBUGGING ? 0 : 30)) {
                // IF tiger is hungry, it eats rabbits in adjacent cell.
                for (const dx of [-1, 1]) {
                    for (const dy of [-1, 1]) {
                        const x = container.x + dx;
                        const y = container.y + dy;
                        const cell = this.map.get(x, y);
                        if (cell.isCharacterAvailable()) {
                            for (const food of this.characters) {
                                if (food.x == x && food.y == y && !food.death) {
                                    food.character.death = true;
                                    tiger.hunger = 0;
                                }
                            }
                        }
                    }
                }
            }

            tiger.hunger++;
            // console.log("hunger++");

            if (tiger.hunger > 100) {
                tiger.death = true;
                console.log(tiger.name + " death");
            }

            // Random move
            this.random_move(container);
            // 山だと移動しにくいとかそういうの
        }
    }

    random_move(container) {
        const candidates = shuffle([
            [-1, -1],
            [-1, 1],
            [-1, 0],
            [1, -1],
            [1, 1],
            [1, 0],
            [0, -1],
            [0, 1],
            [0, 0],
        ]);
        for (const candidate of candidates) {
            const x = container.x + candidate[0];
            const y = container.y + candidate[1];
            const cell = this.map.get(x, y);
            if (cell.isCharacterAvailable()) {
                container.x = x;
                container.y = y;
                return;
            }
        }
    }


    render_map() {
        for (let y=0, l=this.map.height; y<l; y++) {
            for (let x=0, m=this.map.width; x<m; x++) {
                const cell = this.map.get(x, y);
                this.ctx.fillStyle=cell.getColor();
                this.ctx.fillRect(x*this.tile_size,y*this.tile_size,this.tile_size,this.tile_size);
            }
        }
    }

    eachCell(cb) {
        for (let y=0, l=this.map.height; y<l; y++) {
            for (let x=0, m=this.map.width; x<m; x++) {
                cb(x, y);
            }
        }
    }
}

function mainLoop() {
    const game = new Game(1024, 768, 10, 10);
    game.run();
}

document.addEventListener("DOMContentLoaded", function(event) {
    mainLoop();
});

