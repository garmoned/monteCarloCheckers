class Piece {
    constructor(color, x, y) {
        this.color = color;
        this.king = false;
        this.x = x;
        this.y = y;
    }
}


class Tree {
    constructor(root) {
        this.root = root;
    }
}

class Node {
    constructor(boardState, color, parent = null, wins = 0, sims = 0, move) {
        this.boardState = boardState;
        this.color = color;
        this.wins = wins;
        this.sims = sims;
        this.parent = parent
        this.children = [];
        this.move = move;
    }
}


class Robot {

    constructor(diff, color) {
        this.difficulty = diff;
        this.color = color
    }


    playTurn(boardState) {

        if (this.difficulty === 'easy') {

            return this.makeRandomTurn(boardState, this.color);

        } else if (this.difficulty === 'hard') {
            //console.log(this.didWeWinSimulation(boardState,this.color))
            //return this.makeRandomTurn(boardState, this.color);
            return this.monteCarloMove(boardState, this.color, 2000);
        }
    }

    checkInRange = (x, y) => {
        return (x < 8 && x > -1 && y < 8 && y > -1)
    }


    makeRandomTurn = (boardState, color) => {
        return this.randomMove(boardState, color);
    }


    randomMove = (boardState, color) => {

        let moves = this.generateAllValidMoves(boardState, color)

        let move = moves[Math.floor(moves.length * Math.random())]

        return move;
    }


    opposingColor = (color) => {
        if (color === 'r') {
            return 'w'
        } return 'r'
    }

    generateAllValidMoves = (boardState, color) => {
        let moves = []

        for (let y = 0; (y < 8); y++) {
            for (let x = 0; (x < 8); x++) {
                if (boardState[x][y].color === color) {

                    this.generateValidMoves(boardState, x, y, color)
                        .forEach((move) => {
                            let nmove = {
                                piece: {
                                    xpos: x,
                                    ypos: y
                                },

                                pieceMove: move
                            };
                            moves.push(nmove)
                        })
                }
            }
        }

        let captures = moves.filter((move) =>
            move.pieceMove.flag === 'capture'
        )

        if (captures.length > 0) return captures;

        return moves;
    }

    didWeWinSimulation(boardState, color) {


        let loser = this.getLoser(boardState, color);

        return loser !== color;
    }

    getLoser(boardState, color) {
        //  this.printBoard(boardState)
        let moves = this.generateAllValidMoves(boardState, color);

        if (moves.length > 0) {

            let move = moves[Math.floor(moves.length * Math.random())]
            let newBoardState = this.makeSimulatedMove(move, this.makeCopy(boardState));
            let newColor = this.opposingColor(color);

            if (move.pieceMove.flag === 'capture') {
                if (this.generateAllValidMoves(newBoardState, color)
                    .some((move) => move.pieceMove.flag === 'capture'))

                    newColor = color;
            }
            return this.getLoser(this.makeCopy(newBoardState), newColor);
        } else {

            return color;
        }
    }


    makeSimulatedMove = (move, boardState) => {

        let newBoardState = boardState;


        if (move.pieceMove.flag === "capture") {

            newBoardState[move.pieceMove.positionOfOpp.x]
            [move.pieceMove.positionOfOpp.y]
                = new Piece(null, move.pieceMove.positionOfOpp.x, move.pieceMove.positionOfOpp.y)

        }


        newBoardState[move.pieceMove.x][move.pieceMove.y] =
            newBoardState[move.piece.xpos][move.piece.ypos];

        newBoardState[move.pieceMove.x][move.pieceMove.y].x = move.pieceMove.x;
        newBoardState[move.pieceMove.x][move.pieceMove.y].y = move.pieceMove.y;


        newBoardState[move.piece.xpos][move.piece.ypos] =
            new Piece(null, move.piece.xpos, move.piece.ypos);


        this.upgradeToKing(boardState, move.pieceMove.x, move.pieceMove.y);

        return newBoardState;
    }


    upgradeToKing = (newBstate, row, column) => {
        if ((newBstate[row][column].color === 'w' && row === 0) ||
            (newBstate[row][column].color === 'r' && row === 7)) {
            newBstate[row][column].king = true
        }
    }



    generateValidMoves = (boardState, xpos, ypos, color) => {

        let ydirs = [-1, 1];

        let moves = [];

        ydirs.forEach((ydir) => {

            let xdirs = []

            if (boardState[xpos][ypos].king) {
                xdirs.push(-1)
                xdirs.push(1)
            } else if (color === 'r') {
                xdirs.push(1)
            } else if (color === 'w') {
                xdirs.push(-1)
            }

            xdirs.forEach((xdir) => {

                let move = {
                    x: xpos + xdir,
                    y: ypos + ydir,
                    flag: 'move'
                }

                if (this.checkInRange(move.x, move.y) &&
                    boardState[move.x][move.y].color === this.opposingColor(color)) {
                    let capture = {
                        x: move.x + xdir,
                        y: move.y + ydir,
                        positionOfOpp: move,
                        flag: 'capture'
                    }
                    if (this.checkInRange(capture.x, capture.y) && boardState[capture.x][capture.y].color === null) {
                        moves.push(capture);
                    }
                } else

                    moves.push(move);
            })
        })



        let filterMoves = moves.filter((move) =>
            this.checkInRange(move.x, move.y) && (boardState[move.x][move.y].color !== color)
        );

        let captures = [];

        filterMoves.forEach((move) => {
            if (move.flag === 'capture') {
                captures.push(move);
            }
        })

        return captures.length > 0 ? captures : filterMoves;

    }


    makeCopy = (array) => {
        let copy = JSON.parse(JSON.stringify(array))
        return copy
    }

    UCTvalue = (node) => {

        let c = 1.141;

        let parentSims = node.parent !== null ? node.parent.sims : 1

        if (node.sims === 0) return Infinity;

        return (node.wins / node.sims) + c * Math.pow(Math.log(parentSims) / node.sims, .5);

    }


    monteCarloMove = (boardState, color, iterations) => {


        let root = new Node(this.makeCopy(boardState), this.opposingColor(this.color), null, 0, 0);
        let tree = new Tree(root);

        let testForOne = this.generateAllValidMoves(boardState, color);

        if (testForOne.length === 1) {

            return testForOne[0]

        } else {


            while (iterations > 0) {

                this.expandTree(tree);
                iterations--;

            }


            let bestMove = this.getBestMoveFromTree(tree);

            console.log(tree)

            return bestMove;



        }


    }

    printBoard = (boardState) => {
        console.log(boardState.map((row) => {
            return row.map((piece) => {
                return piece.color
            })
        }))
    }


    getBestMoveFromTree = (tree) => {

        let bestNode = tree.root.children[0];

        tree.root.children.forEach((node) => {
            if ((bestNode.sims) < (node.sims)) {
                bestNode = node
            }
        })

        return bestNode.move;
    }


    expandTree = (tree) => {

        let promisingNode = this.selectNode(tree.root);

        this.expandNode(promisingNode);

        let testNode = promisingNode.children[Math.floor(promisingNode.children.length * Math.random())];

        if (promisingNode.children.length === 0) {
            testNode = promisingNode;
        }

        let win = this.playOut(testNode)
        this.backPropagate(testNode, win)
       
        
    }


    selectNode = (node) => {



        if (node.sims > 0 && node.children.length > 0) {

            let mostValue = node.children[0];

            node.children.forEach((nNode) => {

                if (this.UCTvalue(nNode) > this.UCTvalue(mostValue)) {
                    mostValue = nNode;
                }
            })

            return this.selectNode(mostValue)

        } else {

            return node;

        }
    }

    expandNode = (node) => {

        let newColor = this.opposingColor(node.color)

        if ((node.move !== undefined) && (node.move.pieceMove.flag === 'capture')
            && this.generateAllValidMoves(node.boardState, node.color)
                .some((move) => move.pieceMove.flag === 'capture')) {
            newColor = node.color
        }

        let moves = this.generateAllValidMoves(node.boardState, newColor);


        moves.forEach((move) => {
            let newBoardState = this.makeSimulatedMove(move, this.makeCopy(node.boardState))
            let newNode = new Node(newBoardState, newColor, node, 0, 0, move);
            node.children.push(newNode);
        })
    }

    playOut = (node) => {


        let winning = this.didWeWinSimulation(this.makeCopy(node.boardState), this.color);

        if (winning) {
            node.wins++;
        }

        node.sims++;
        return winning;

    }

    backPropagate = (node, win) => {

        if (node.parent !== null) {
            node.parent.wins += win ? 1 : 0;
            node.parent.sims++;
            this.backPropagate(node.parent, win);
        }

    }

}




export default Robot;