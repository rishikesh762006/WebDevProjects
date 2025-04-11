const p1 = [];
const p2 = [];
let turn = 1;
const winMoves = [[1,2,3], [1,4,7], [1,5,9], [2,5,8], [3,6,9], [3,5,7], [4,5,6], [7,8,9]];
let isGameRunning = true;
const result = document.getElementById("result");
let moves = 0;
let w = false;


async function checkWin(p) {
    for (let i = 0; i < p.length-2; i++) {
        for (let j = i+1; j < p.length-1; j++) {
            for (let k = i+2; k < p.length; k++) {
                for (let l = 0; l < winMoves.length; l++) {
                    if (winMoves[l].toString() == [p[i], p[j], p[k]].toString()) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}


async function store(x) {
    if (isGameRunning) {
        const c = document.getElementById(x);
        if (c.getAttribute("value") == "0") {
            moves += 1;
            c.setAttribute("value", "1");
            const a = x - "0";
            if (turn == 1) {
                p1.push(a);
                p1.sort(function(b,e) {return b-e})
                if (p1.length > 2) {
                    let check = await checkWin(p1);
                    if (check) {
                        result.innerText = "P1 Wins";
                        isGameRunning = false;
                        w = true;
                    }
                }
                c.innerHTML = `<image src="X.png"></image>`;
                turn = 2;
            }
            else {
                p2.push(a);
                p2.sort(function(b,e) {return b-e})
                if(p2.length > 2) {
                    let check = await checkWin(p2);
                    if (check) {
                        result.innerText = "P2 Wins";
                        isGameRunning = false;
                        w = true;
                    }
                }
                c.innerHTML = `<image src="O.png"></image>`;
                turn = 1;
            }
        }
        if (isGameRunning && moves == 9 && !w) {
            result.innerText = "Match Tie";
            isGameRunning = false;
        }
    }
}