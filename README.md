# Shogi Game Implementation

## High Level Explanation

This project involves the implementation of a Shogi game using Object-Oriented Design (OOD). It focuses on managing the states and behavior of each piece, the board, and the players.

### Structure

- **Piece**: Manages individual Shogi pieces, encapsulating details such as type, movement capabilities, and board position. Each type has its own distinct movement rules and promotion capabilities, which are handled dynamically in this class.
- **Player**: Represents a player in the game, keeping track of the pieces they currently control on the board and pieces captured from the opponent. Manages player actions such as move and drop.
- **Board**: Maintains the state of the board. It has three representations:
  - **Upper/Lower Board**: Indicates all possible movements of each player’s current pieces.
  - **Type Board**: Contains all pieces on the board with type as [1,6] for lower player, [-6,-1] for upper player.
  - **Board**: Contains all pieces on the board with character type (for printing).

## Particular Components Explanation

### Piece Class

```jsx
constructor(col = null, row = null, type) {
  this.col = col;
  this.row = row;
  this.promote = false;
  this.type = type;
  this.direction = this.setDirection(type, this.promote);
  this.size = this.setSize(type, this.promote);
}

### Properties: col, row, promote, type, direction, size.

**setDirection(type, promote)**
Determines the movements for each piece (clockwise).

case 2:
  direction = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  if (promote) {
    var directionDrive = [[-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0]];
    var directionDup = direction.concat(directionDrive);
    direction = this.removeDup(directionDup);
  }
  break;
case 3:
  direction = [[-1, 1], [1, 1], [1, -1], [-1, -1]];
  if (promote) {
    var directionDrive = [[-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0]];
    var directionDup = direction.concat(directionDrive);
    direction = this.removeDup(directionDup);
  }
  break;


**setSize(type, promote)**
Determines how far a piece can move based on type and promotion status.

setSize(type, promote) {
  var size = [1];
  if (type == 2 || type == 3) {
    if (promote) {
      size = [10, 1];
    } else {
      size = [10];
    }
  }
  return size;
}

Calculating Possible Moves

for (var i = 0; i < piece.direction.length; i++) {
  if ((piece.type == 2 || piece.type == 3) && piece.promote) {
    index = Math.floor(i / 4);
  }
  var size = piece.size[index];
  var nextCol = piece.col + piece.direction[i][0];
  var nextRow = piece.row + piece.direction[i][1] * this.playerStatus;
  var doNotJump = false;

  while (size > 0 && !doNotJump) {
    if (nextCol > 4 || nextCol < 0) break;
    if (nextRow > 4 || nextRow < 0) break;
    if (board.typeBoard[nextCol][nextRow] * this.playerStatus > 0) break;
    if (piece.type == 1 && this.isCheckmate(nextCol, nextRow, board)) break;

    possibleList.push([nextCol, nextRow]);
    if (board.typeBoard[nextCol][nextRow] * this.playerStatus != 0) {
      doNotJump = true;
    }

    nextCol += piece.direction[i][0];
    nextRow += piece.direction[i][1] * this.playerStatus;
    size--;
  }
}


### Player Class

constructor(playerStatus) {
  this.playerStatus = playerStatus; // lower or upper // 1 or -1
  this.turn = 0;  // turn <= 200
  this.currentPiece = [];
  this.capturedPiece = [];
  this.initalizePlayerPiece();
}


Properties: playerStatus, turn, currentPiece, capturedPiece.

isIllegalMove(piece, toCol, toRow, board)

isIllegalMove(piece, toCol, toRow, board) {
  var list = this.findAllPath(piece, board);
  for (var i = 0; i < list.length; i++) {
    if (list[i][0] == toCol && list[i][1] == toRow) return false;
  }
  return true;
}


checkPromote(piece, toCol, toRow)

checkPromote(piece, toCol, toRow) {
  if ((this.playerStatus == -1 && toRow == 0) || (this.playerStatus == 1 && toRow == 4)) {
    piece.setPromote(true);
  }
}


isCheckmate(toCol, toRow, board)

isCheckmate(toCol, toRow, board) {
  if (board.upperBoard == null || board.lowerBoard == null) return false;

  if (this.playerStatus == -1) { // upper
    if (board.lowerBoard[toCol][toRow]) return true;
  } else { // lower
    if (board.upperBoard[toCol][toRow]) return true;
  }

  return false;
}
