import Square from './square'
import React from 'react';
import Robot from './robot';

class Piece {
  constructor(color, x, y) {
    this.color = color;
    this.king = false;
    this.x = x;
    this.y = y;
  }



}

class board extends React.Component {



  constructor(props) {
    super(props);

    this.robots = [];

    this.robots.push(new Robot('hard', 'r'))
    //this.robots.push(new Robot('easy', 'w'))

    this.state = {

      playerTurn: 'r',

      capturePossible: false,

      selectedPiece: null,

      bState: this.initBoardState()

    }

  }


  componentDidMount() {

    this.robots
      .forEach((robot) => {
        if (this.state.playerTurn === robot.color) {
          this.makeRobotMove(this.state.bState, robot);
        }
      })

  }

  initBoardState = () => {

    var bState = [];

    for (let i = 0; i < 8; i++) {

      var row = [];

      for (let x = 0; x < 8; x++) {
        if (i < 3) {
          if ((x + i) % 2 !== 0) {
            row.push(new Piece('r', i, x))
          } else
            row.push(new Piece(null, i, x))
        } else if (i > 4) {
          if ((x + i) % 2 !== 0) {
            row.push(new Piece('w', i, x))
          } else {
            row.push(new Piece(null, i, x))
          }
        } else {
          row.push(new Piece(null, i, x));
        }
      }
      bState.push(row);
    }
    return bState;

  }

  changeSelection = async (row, column) => {

    if (this.state.selectedPiece === null) {
      await this.setState({ selectedPiece: this.state.bState[row][column] })
    } else if (this.state.selectedPiece.x === row &&
      this.state.selectedPiece.y === column) {
      await this.setState({ selectedPiece: null });
    } else {
      await this.setState({ selectedPiece: this.state.bState[row][column] })
    }
  }

  getSelection = async (row, column) => {

    await this.humanMove(row, column);


  }


  humanMove = async (row, column) => {

    if (this.state.bState[row][column].color === this.state.playerTurn) {

      await this.changeSelection(row, column);

    } else if (this.state.bState[row][column].color === null &&
      this.state.selectedPiece !== null) {

      this.tryToMove(this.state.selectedPiece.x, this.state.selectedPiece.y
        , row, column);
    }

  }


  tryToMove = (x, y, row, column, robot) => {

    this.generateValidMoves(x
      , y, this.state.playerTurn)
      .forEach(async (move) => {
        if (move.x === row && move.y === column) {

          if (move.flag === 'capture') {

            this.capture(x, y, row, column, move.positionOfOpp, robot);

          } else if (!this.state.capturePossible) {
            await this.movePiece(x, y, row, column);
            this.changeTurn(this.state.playerTurn);
          }
        }
      })
  }

  capture = async (x, y, row, column, positionOfOpp, robot) => {

    let newBstate = this.state.bState;

    newBstate[positionOfOpp.x][positionOfOpp.y]
      = new Piece(null, positionOfOpp.x, positionOfOpp.y);

    this.setState({
      bstate: newBstate
    })


    await this.movePiece(x, y, row, column);

    if (!this.generateValidMoves(row, column, this.state.playerTurn)
      .some((move) =>
        move.flag === 'capture'
      )) {
      this.changeTurn(this.state.playerTurn);
    } else if (robot !== undefined && this.state.playerTurn === robot.color) {
      this.makeRobotMove(this.state.bState, robot);
    }

  }

  checkForCaptures = (oppColor) => {

    let looking = true;

    for (let y = 0; (y < 8) && looking; y++) {
      for (let x = 0; (x < 8) && looking; x++) {
        if (this.state.bState[x][y].color === oppColor) {
          if (this.generateValidMoves(x, y, oppColor)
            .some((move) =>
              move.flag === 'capture'
            )) {
            this.setState({
              capturePossible: true
            })
            looking = false;
          }
        }
      }
    }

    if (looking) this.setState({ capturePossible: false })
  }

  changeTurn = async (currentTurn) => {

    let oppColor = this.opposingColor(currentTurn);

    if (this.gameOver(this.state.bState, oppColor)) {
      this.setState({
        playerTurn: currentTurn + " wins"
      })
    } else {
      this.setState({
        playerTurn: (oppColor)
      })

      this.checkForCaptures(oppColor);

      this.robots
        .forEach((robot) => {
          if (oppColor === robot.color) {
            this.makeRobotMove(this.state.bState, robot);
          }
        })

    }
  }

  gameOver = (boardState, color) => {

    let moves = this.generateAllValidMoves( boardState, color);

    return moves.length === 0;

  }


  generateAllValidMoves = (color) => {
    let moves = []

    for (let y = 0; (y < 8); y++) {
      for (let x = 0; (x < 8); x++) {
        if (this.state.bState[x][y].color === color) {

          this.generateValidMoves(x, y, color)
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


  makeRobotMove = (boardState, robot) => {

    let roboMove = robot.playTurn(boardState);

    this.tryToMove(roboMove.piece.xpos, roboMove.piece.ypos,
      roboMove.pieceMove.x, roboMove.pieceMove.y, robot)

  }



  movePiece = async (x, y, row, column) => {

    var newBstate = this.state.bState;
    newBstate[row][column] = this.state.bState[x][y]
    newBstate[row][column].x = row;
    newBstate[row][column].y = column;
    newBstate[x][y] = new Piece(null, x, y);

    if ((newBstate[row][column].color === 'w' && row === 0) ||
      (newBstate[row][column].color === 'r' && row === 7)) {
      newBstate[row][column].king = true
    }

    await this.setState({
      bstate: newBstate,
      selectedPiece: null
    })



  }

  opposingColor = (color) => {
    if (color === 'r') {
      return 'w'
    } return 'r'
  }

  checkInRange = (x, y) => {
    return (x < 8 && x > -1 && y < 8 && y > -1)
  }

  generateValidMoves = (xpos, ypos, color) => {


    let ydirs = [-1, 1];

    let moves = [];

    ydirs.forEach((ydir) => {

      let xdirs = []

      if (this.state.bState[xpos][ypos].king) {
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
          this.state.bState[move.x][move.y].color === this.opposingColor(color)) {
          let capture = {
            x: move.x + xdir,
            y: move.y + ydir,
            positionOfOpp: move,
            flag: 'capture'
          }
          if (this.checkInRange(capture.x, capture.y) && this.state.bState[capture.x][capture.y].color === null) {
            moves.push(capture);
          }
        }

        moves.push(move);
      })
    })



    let filterMoves = moves.filter((move) =>
      this.checkInRange(move.x, move.y) && (this.state.bState[move.x][move.y].color !== color)
    );

    let captures = [];

    filterMoves.forEach((move) => {
      if (move.flag === 'capture') {
        captures.push(move);
      }
    })

    return captures.length > 0 ? captures : filterMoves;


  }


  renderSquare(val, x, y, king) {
    return <Square
      value={val}
      x={x}
      y={y}
      key={x + y + val}
      king={king}
      sendSelection={this.getSelection}
    />;
  }

  displayBoard() {

    return (this.state.bState.map((row, x) => {
      return (
        <div key={x} className="board-row">
          {row.map((piece, y) => {

            return this.renderSquare(piece.color, x, y, piece.king)
          })}
        </div>)
    }))
  }

  render() {
    const status = 'Player Turn: ';

    return (
      <div>

        <div className="status">{status + this.state.playerTurn}</div>

        {this.displayBoard()}

      </div>
    );
  }
}

export default board;