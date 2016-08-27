// Returns a random integer between min (included) and max (excluded)
// // Using Math.round() will give you a non-uniform distribution!
//
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
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
        this.grass += 1;
    }
}

// ----------------------------------------------------------------------
//
// Animals
//
// ----------------------------------------------------------------------

class Rabbit {
    constructor(name) {
        this.hunger = 0;
        this.name = name;
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

class Tiger {
    constructor() {
        this.hunger = 0;
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
        return this.cells[x + y*this.width];
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
        this.put_characters();
        this.init_canvas();
    }

    put_characters() {
        const characters = [];
        const num_rabbits = getRandomInt(2, 10);
        for (let i=0; i<num_rabbits; i++) {
            let x = getRandomInt(0, this.tile_width);
            let y = getRandomInt(0, this.tile_height);
            if (this.map.get(x, y).isCharacterAvailable()) {
                characters.push(new CharacterContainer(x, y, new Rabbit("Rabbit " + i)));
            }
        }
        const num_tigers = getRandomInt(2, 10);
        for (let i=0; i<num_tigers; i++) {
            let x = getRandomInt(0, this.tile_width);
            let y = getRandomInt(0, this.tile_height);
            if (this.map.get(x, y).isCharacterAvailable()) {
                characters.push(new CharacterContainer(x, y, new Tiger()));
            }
        }
        this.characters = characters;
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
        setInterval(
            () => {
                this.next_tick();
            }, 100
        );
    }

    next_tick() {
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
            console.log(container.x, container.y);
            const cell = this.map.get(container.x, container.y);
            const grass = cell.grass;
            if (grass > 0) {
                const ate = Math.max(getRandomInt(1, grass), 10);
                rabbit.hunger = Math.max(rabbit.hunger - ate, 0);
                cell.grass -= ate;
                console.log(rabbit.name + " ate " + ate + " grass(Current hunger: " + rabbit.hunger + ")");
            }
 
            rabbit.hunger++;
            console.log("hunger++");

            if (rabbit.hunger > 100) {
                rabbit.death = true;
                console.log(rabbit.name + " death");
            }

            // Random move
            const xMove = getRandomInt(0, 3) - 1;
            const yMove = getRandomInt(0, 3) - 1;
            console.log("xMove: " +  xMove);
            container.x = Math.min(Math.max(container.x + xMove, 0), this.tile_width - 1);
            container.y = Math.min(Math.max(container.y + yMove, 0), this.tile_height - 1);
        }
    }

    work_tiger(container, tiger) {
        if (tiger.death) {
            // TODO 腐敗度++
        } else {
            // TODO if tiger on plain, eat 
            console.log(container.x, container.y);
            const cell = this.map.get(container.x, container.y);

            tiger.hunger++;
            console.log("hunger++");

            if (tiger.hunger > 100) {
                tiger.death = true;
                console.log(tiger.name + " death");
            }

            // Random move
            const xMove = getRandomInt(0, 3) - 1;
            const yMove = getRandomInt(0, 3) - 1;
            console.log("xMove: " +  xMove);
            container.x = Math.min(Math.max(container.x + xMove, 0), this.tile_width - 1);
            container.y = Math.min(Math.max(container.y + yMove, 0), this.tile_height - 1);
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

