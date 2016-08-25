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

class Map {
    constructor() {
        this.width  = 64;
        this.height = 48;

        this.cells = [];
        for (let y=0; y<this.height; y++) {
            for (let x=0; x<this.width; x++) {
                const n = Math.floor((Math.random() * 100) + 1); // 1〜100
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

function mainLoop(c) {
    const map = new Map();

    c.width = 512;
    c.height = 480;

    var ctx = c.getContext("2d");
    ctx.fillStyle="#000000";
    ctx.fillRect(0,0,640,480);

    for (let y=0, l=map.height; y<l; y++) {
        for (let x=0, m=map.width; x<m; x++) {
            const cell = map.get(x, y);
            ctx.fillStyle=cell.getColor();
            ctx.fillRect(x*10,y*10,10,10);
        }
    }
}

document.addEventListener("DOMContentLoaded", function(event) {
    const c = document.getElementById('game');
    mainLoop(c);
});

