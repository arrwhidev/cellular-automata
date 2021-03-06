function wolfram(canvasId, activeCol, inactiveCol, width, height) {
    const canvas = document.getElementById(canvasId || 'canvas');
    const ctx = canvas.getContext("2d");
    const WIDTH = width || canvas.width;
    const HEIGHT = height || canvas.height;
    const ACTIVE_COLOUR = activeCol || '#03A9F4';
    const INACTIVE_COLOUR = inactiveCol || '#000';
    const SIDE = 2;
    const RULES = [
        {
            id: 45, // http://atlas.wolfram.com/01/01/45/
            rules: [
                [1,1,1,0],
                [1,1,0,0],
                [1,0,1,1],
                [1,0,0,0],
                [0,1,1,1],
                [0,1,0,1],
                [0,0,1,0],
                [0,0,0,1]
            ]
        }, {
            id: 105, // http://atlas.wolfram.com/01/01/105/
            rules: [
                [1,1,1,0],
                [1,1,0,1],
                [1,0,1,1],
                [1,0,0,0],
                [0,1,1,1],
                [0,1,0,0],
                [0,0,1,0],
                [0,0,0,1]
            ]
        }, {
            id:150, // http://atlas.wolfram.com/01/01/150/
            rules: [
                [1,1,1,1],
                [1,1,0,0],
                [1,0,1,0],
                [1,0,0,1],
                [0,1,1,0],
                [0,1,0,1],
                [0,0,1,1],
                [0,0,0,0]
            ]
        }
    ]

    function createButtonsForRules() {
        const ul = document.getElementById("buttons");

        for(let i = 0; i < RULES.length; i++) {
            const rule = RULES[i];

            const btn = document.createElement("button");
            btn.onclick = setRule.bind(null, rule.id);
            btn.innerHTML = `Rule ${rule.id}`;

            const li = document.createElement("li");
            li.appendChild(btn);
            ul.appendChild(li);
        }
    }

    function init() {
        const opts = {
            ctx,
            activeColour: ACTIVE_COLOUR,
            inactiveColour: INACTIVE_COLOUR,
            side: SIDE,
            numCols: WIDTH / SIDE,
            numRows: HEIGHT / SIDE,
            rules: RULES.find(r => r.id === rule).rules,
            randomStart: random
        };

        wolframAtlas(opts);
    }

    function setRule(_rule) {
        rule = _rule
        init();
    }

    function toggleRandom() {
        random = !random;
        init();
    }

    function wolframAtlas(opts) {
        const {
            ctx,
            activeColour,
            inactiveColour,
            side,
            numCols,
            numRows,
            rules,
            randomStart
        } = opts;
        const rand = () => Math.floor(Math.random() * 2);
        const createBlock = (x, y, isActive) => ({ x, y, isActive: isActive });
        const calculateIsActive = (l, s, r) => {
            return rules.reduce((isActive, rule) => {
                if(l.isActive == rule[0] && s.isActive == rule[1] && r.isActive == rule[2]) {
                    isActive = rule[3];
                }
                return isActive;
            }, 0);
        }

        const rows = [];
        for(let row = 0; row < numRows; row++) {
            const y = row * side;
            rows.push({ cols: [] });

            for(let col = 0; col < numCols; col++) {
                const x = col * side;
                let isActive;

                if (row === 0) {
                    if (randomStart) {
                        isActive = rand();
                    } else {
                        isActive = (col === (Math.floor(numCols / 2))) ? true : false;
                    }
                } else if(row > 0) {
                    const prevRow = rows[row - 1];
                    const prevL = prevRow.cols[col - 1] || prevRow.cols[prevRow.cols.length - 1];
                    const prevSelf = prevRow.cols[col];
                    const prevR = prevRow.cols[col + 1] || prevRow.cols[0];
                    isActive = calculateIsActive(prevL, prevSelf, prevR);
                }

                rows[row].cols.push(createBlock(x, y, isActive));
            }
        }

        rows.forEach(row => {
            row.cols.forEach(col => {
                ctx.fillStyle = col.isActive ? activeColour : inactiveColour;
                ctx.fillRect(col.x, col.y, side, side);
            });
        });
    }

    let rule = 150;
    let random = false;
    init();
    // createButtonsForRules();

    return {
        toggleRandom
    }
}
