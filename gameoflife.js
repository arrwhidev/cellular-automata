function gameOfLife(canvasId, activeCol, inactiveCol, width, height) {
    const canvas = document.getElementById(canvasId || 'canvas');
    const ctx = canvas.getContext("2d");
    const ACTIVE_COLOUR = activeCol || '#525564';
    const INACTIVE_COLOUR = inactiveCol || '#BEB9B5';
    const WIDTH = width || canvas.width;
    const HEIGHT = height || canvas.height;
    const SIDE = 5;
    const NUM_COLS = WIDTH / SIDE;
    const NUM_ROWS = HEIGHT / SIDE;
    const NEIGHBOUR_OFFSETS = [
        {y: -1, x: -1},
        {y: -1, x: 0},
        {y: -1, x: +1},
        {y: 0, x: -1},
        {y: 0, x: +1},
        {y: +1, x: -1},
        {y: +1, x: 0},
        {y: +1, x: +1},
    ];
    let speed = 100;
    let universe;
    let lastTime;

    const speedUp = () => {
        if(speed > 0) speed -= 50;
    }
    const slowDown = () => {
        if(speed < 1000) speed += 50;
    }

    const forEachCell = fn => {
        for(let y = 0; y < NUM_ROWS; y++) {
            for(let x = 0; x < NUM_COLS; x++){
                fn(x, y);
            }
        }
    };

    const randomUniverse = () => {
        forEachCell((x,y) => universe[y][x] = Math.floor(Math.random() * 2));
    }
    const clearUniverse = () => {
        universe = createEmptyUniverse();
    }
    const addGliderGuns = () => {
        const gliderGun = [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0],
            [0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        ];

        // Make a few guns ar various offets.
        [{x:0, y:0}, {x:60, y:10}, {x:20, y:60}].forEach(offset => {
            forEachCell((x,y) => {
                if(gliderGun[y] && gliderGun[y][x]) {
                    universe[offset.y+y][offset.x+x] = gliderGun[y][x];
                }
            });
        });
    };

    const createEmptyUniverse = () => {
        const arr = [];
        for(let y = 0; y < NUM_ROWS; y++) {
            arr[y] = new Array(NUM_COLS);
            for(let x = 0; x < NUM_COLS; x++) {
                arr[y][x] = 0;
            }
        }
        return arr;
    }

    const cellState = (y, x) => {
        if(universe[y] && universe[y][x]) return universe[y][x];
        return 0;
    }

    const getNumLiveNeighbours = (x, y) => {
        return NEIGHBOUR_OFFSETS.reduce((numLiveNeighbours, n) => {
            return numLiveNeighbours + cellState(y-n.y, x-n.x);
        }, 0);
    }

    const calculateIsAlive = (x, y) => {
        const numLiveNeighbours = getNumLiveNeighbours(x, y);
        let isAlive = cellState(y, x);

        if (isAlive === 1) {
            if (numLiveNeighbours < 2) {
                isAlive = 0;
            } else if (numLiveNeighbours === 2 || numLiveNeighbours === 3) {
                isAlive = 1;
            } else if (numLiveNeighbours > 3) {
                isAlive = 0;
            }
        } else {
            if (numLiveNeighbours === 3) isAlive = 1;
        }

        return isAlive;
    }

    const renderAndUpdateUniverse = () => {
        const nextGeneration = createEmptyUniverse();
        forEachCell((x,y) => {
            ctx.fillStyle = universe[y][x] ? ACTIVE_COLOUR : INACTIVE_COLOUR;
            ctx.fillRect(x * SIDE, y * SIDE, SIDE, SIDE);
            nextGeneration[y][x] = calculateIsAlive(x, y);
        });
        universe = nextGeneration;
    }

    const universeTick = timestamp => {
        if(!lastTime) lastTime = timestamp;
        window.requestAnimationFrame(universeTick);
        const delta = timestamp - lastTime;
        if(delta >= speed) {
            lastTime = timestamp;
            renderAndUpdateUniverse();
        }
    }

    // Let's create our universe and begin...
    universe = createEmptyUniverse();
    randomUniverse();
    window.requestAnimationFrame(universeTick);

    return {
        clearUniverse,
        randomUniverse,
        addGliderGuns,
        speedUp,
        slowDown
    };
}
