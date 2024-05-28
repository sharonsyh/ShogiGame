const utils = require("./utils");
const Board = require("./Board");
const Piece = require("./Piece");
const Player = require("./Player");
const readline = require("readline");
const os = require('os');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const Type = {

  'd': 1,
  'n': 2,
  'g': 3,
  's': 4,
  'r': 5,
  'p': 6
  
}

let lTypes = [null, 'd', 'n', 'g', 's', 'r', 'p'];
let uTypes = [null, 'D', 'N', 'G', 'S', 'R', 'P'];

var command = ['move','drop'];
let upper = new Player(-1); //upper 
let lower = new Player(1); //lower
let board = new Board(upper,lower);
let playerIndex = 1;
let AllPlayer = [upper, null, lower];


const commandLineArgs = process.argv.slice(2);

function initializeGame(fileData) {
    resetGame();
    initializePieces(fileData.initialPieces);

    // console.log(`!!!!${board.typeBoard}`);
    initializeBoard();
    initializeCapturedPieces(upper, fileData.upperCaptures);
    initializeCapturedPieces(lower, fileData.lowerCaptures);

    
    // console.log(`!${board.typeBoard}`)

    commandCheck(fileData.moves);
}

function getCurrentPlayer(playerIndex) {
    if(playerIndex == -1) return "UPPER";
    else return "lower";
}

function resetGame() {
    board.resetBoard();
    upper.resetAndInitializePieces();
    lower.resetAndInitializePieces();

    // console.log(`Typeboard \n ${board.typeBoard}`);
    // upper.currentPiece = [];
    // lower.currentPiece = [];
}

function initializePieces(initialPieces) {
    initialPieces.forEach(item => {
        
        let isPromoted = item.piece.includes('+');
        let normalizedPieceType = isPromoted ? item.piece.replace('+', '') : item.piece;

        const pieceType = Type[normalizedPieceType.toLowerCase()];
        const placeLocation = item.position.split("");
        const placeCol = +(placeLocation[0].charCodeAt(0) - 'a'.charCodeAt(0));
        const placeRow = +placeLocation[1] - 1;

        const piece = new Piece(placeCol, placeRow, pieceType);
        
        if(isPromoted) piece.setPromote(true);

        if (normalizedPieceType === normalizedPieceType.toUpperCase()) {
            upper.currentPiece.push(piece);
            board.placeTypeBoard(pieceType * (-1), placeCol, placeRow);
        } else {
            lower.currentPiece.push(piece);
            board.placeTypeBoard(pieceType, placeCol, placeRow);
        }

        board.placeBoard(item.piece, placeCol, placeRow);

    });
}

function initializeBoard() {
    board.lowerBoard = board.initializePlayerBoard(lower);
    board.upperBoard = board.initializePlayerBoard(upper);
}

function initializeCapturedPieces(player, captured) {

    player.capturedPiece = captured.map(pieceCode => {
        const pieceType = Type[pieceCode.toLowerCase()];
        return new Piece(null,null,pieceType);
    });
}

function gameEndPrint(){
  
    board.printBoard();
    printCaptures();  
}

function commandCheck(moves) {
    for (let moveCommand of moves) {
        const [command, from, to, promote] = moveCommand.split(' ');
        
        AllPlayer[playerIndex + 1].turn += 1;
        
        if (command === "move") {
            processMove(from, to, promote);
        } if (command === "drop") {
            processDrop(from, to);
        }
        

        if(isCheckmateEndCondition(false)) {

            if(promote == "promote") console.log(`${getCurrentPlayer(playerIndex)} player action: ${command} ${from} ${to}, promote`);
            else console.log(`${getCurrentPlayer(playerIndex)} player action: ${command} ${from} ${to}`);
            
            gameEndPrint();

            console.log(`${getCurrentPlayer(playerIndex)} player wins.  Checkmate.`);
            process.exit(0);
        }

        if (isMoveLimitReached()) {
            
          if(promote == "promote") console.log(`${getCurrentPlayer(playerIndex)} player action: ${command} ${from} ${to}, promote`);
          else console.log(`${getCurrentPlayer(playerIndex)} player action: ${command} ${from} ${to}`);
          
          gameEndPrint();
          console.log("Tie game.  Too many moves.");
          
          process.exit(0);
      }
        switchPlayers();
    }

    switchPlayers();
    console.log(`${getCurrentPlayer(playerIndex)} player action: ${moves[moves.length - 1]}`);
    gameEndPrint();
    isCheckmateEndCondition(true);
    console.log(`${getCurrentPlayer(playerIndex *(-1))}>`);
    process.exit(0);
}

function processMove(from, to, promote) {
    // Implementation for processing a move

    var locationTo = isValidLocation(to);
    var filePlayer = AllPlayer[playerIndex + 1]; //0 - upper 2 - lower
    var toCol = +(locationTo[0].charCodeAt(0) - 'a'.charCodeAt(0));
    var toRow = +locationTo[1] - 1;
 
    var locationFrom = isValidLocation(from); 
    var fromCol = +(locationFrom[0].charCodeAt(0) - 'a'.charCodeAt(0));
    var fromRow = +locationFrom[1] - 1;

    if(filePlayer.move(fromCol, fromRow, toCol, toRow, board)) {

      if(promote == "promote"){
            
          // console.log(`${getCurrentPlayer(playerIndex)} player action: move ${from} ${to} promote`);

          var promotedPiece = filePlayer.findPiece(toCol,toRow);
          if(promotedPiece.type == 1 || promotedPiece.type == 4) {
            console.log(`${getCurrentPlayer(playerIndex)} player action: move ${from} ${to} promote`);
              gameEndPrint();
              console.log(`${getCurrentPlayer(playerIndex * (-1))} player wins.  Illegal move.`);
              process.exit(0);
          }
          promotedPiece.setPromote(true);
      }

        var opponent = AllPlayer[playerIndex*(-1) + 1];

        if(board.typeBoard[toCol][toRow] != 0){ //capture
          
          if(board.typeBoard[toCol][toRow] * filePlayer.playerStatus == -1) {

            if(promote == "promote") console.log(`${getCurrentPlayer(playerIndex)} player action: move ${from} ${to}, promote`);
            else console.log(`${getCurrentPlayer(playerIndex)} player action: move ${from} ${to}`);
            
            gameEndPrint();

            if(filePlayer.playerStatus == -1) console.log("UPPER player wins.  Checkmate.");
            else console.log("lower player wins. Checkmate.");

            process.exit(0);
          }
          
          var capturedPiece = opponent.findPiece(toCol,toRow);
          filePlayer.capturedPiece.push(capturedPiece);
          opponent.remove(capturedPiece,opponent.currentPiece);        
        }

        //After running Player move, the location of the piece is already updated --> findPiece with toCol and toRow

        // console.log("CAN YOU COME HERE?");
        board.updateBoard(filePlayer.playerStatus,filePlayer.findPiece(toCol,toRow),fromCol,fromRow);
        board.updatePlayerBoard(filePlayer);
        // console.log("CAN YOU COME HERE?");
        // board.printBoard();

      }
      else{
       
        if(promote == "promote") console.log(`${getCurrentPlayer(playerIndex)} player action: move ${from} ${to}, promote`);
        else console.log(`${getCurrentPlayer(playerIndex)} player action: move ${from} ${to}`);

        gameEndPrint();

        console.log(`${getCurrentPlayer(playerIndex * (-1))} player wins.  Illegal move.`);
        
        process.exit(0);
        
    }
}

function processDrop(piece, to) {
    // Implementation for processing a drop
    let pieceType = piece; 
    if (piece in Type) {
        var targetType = Type[pieceType];
    } else {
    console.log("Error: Invalid piece type.");
    }

    var locationTo = isValidLocation(to);
    var filePlayer = AllPlayer[playerIndex + 1]; //0 - upper 2 - lower
    var toCol = +(locationTo[0].charCodeAt(0) - 'a'.charCodeAt(0));
    var toRow = +locationTo[1] - 1;

    dropPiece = filePlayer.findPieceFromList(targetType, filePlayer.capturedPiece);
    var opponent = AllPlayer[playerIndex * (-1) + 1];
    var drivePiece = opponent.findPieceFromList(1, opponent.currentPiece);
    // dropPiece.col = -1;
    // dropPiece.row =

    var flag = false;
    // if(opponent.isCheckmate(drivePiece.col, drivePiece.row, board))

    // console.log(`(${toCol}, ${toRow})`);
    // console.log(`(${board.board[toCol][toRow]})`);

    // console.log(`(drive : ${drivePiece.col}, ${drivePiece.row})`);

    if(Type[pieceType] == 6 && simulateDrop(filePlayer, dropPiece, pieceType, targetType, toCol, toRow, board)) {
      flag = true;
      // console.log("HERE");
    }

    if(!flag && filePlayer.drop(targetType,toCol,toRow,board) && dropPiece ) {

        board.updateDropBoard(filePlayer.playerStatus,dropPiece, pieceType);
        board.updatePlayerBoard(filePlayer);


    }
    else {
        
        console.log(`${getCurrentPlayer(playerIndex)} player action: drop ${piece} ${to}`);
        
        gameEndPrint();

        console.log(`${getCurrentPlayer(playerIndex * (-1))} player wins.  Illegal move.`);

        process.exit(0);
    }
}

function switchPlayers() {
    playerIndex *= -1; 
}

function simulateDrop(curPlayer, piece, pieceType, targetType, toCol, toRow, board) {
  
  var preBoard = board.board.map(v => [...v]);
  var preTypeBoard = board.typeBoard.map(v => [...v]);
  var preLowerBoard = board.lowerBoard.map(v => [...v]);
  var preUpperBoard = board.upperBoard.map(v => [...v]);
  var opponent = AllPlayer[curPlayer.playerStatus * (-1) + 1];

  curPlayer.drop(targetType, toCol, toRow, board);
  if(curPlayer.dropIndex != -1) var index = curPlayer.dropIndex;
  board.updateDropBoard(curPlayer.playerStatus, piece, pieceType);
  board.updatePlayerBoard(opponent);

  var isDoubleCheckmate = false;

  if(opponent.isCheckmate(toCol, toRow, board)) {
    isDoubleCheckmate = true;
  }

  board.board =  preBoard;
  board.typeBoard =  preTypeBoard;
  board.lowerBoard = preLowerBoard;
  board.upperBoard = preUpperBoard;

  curPlayer.remove(piece,curPlayer.currentPiece);
  curPlayer.capturedPiece.splice(index, 0, piece);

  return isDoubleCheckmate;
}

function simulateMove(curPlayer, piece, toCol,toRow, board) {
  //remember toCol, toRow, type if not 0
  var preBoard = board.board.map(v => [...v]);
  var preTypeBoard = board.typeBoard.map(v => [...v]);
  var preLowerBoard = board.lowerBoard.map(v => [...v]);
  var preUpperBoard = board.upperBoard.map(v => [...v]);
  var prePiece;
  var opponent = AllPlayer[curPlayer.playerStatus * (-1) + 1];
  
   var fromCol = piece.col;
   var fromRow = piece.row;
   
   if(board.typeBoard[toCol][toRow] != 0) {
       prePiece = opponent.findPiece(toCol, toRow);
       opponent.remove(prePiece,opponent.currentPiece);
   }
   
//    console.log(`${opponent.currentPiece.length}`);

   piece.move(toCol,toRow);
   board.updateBoard(curPlayer.playerStatus,piece,fromCol,fromRow);
   board.updatePlayerBoard(opponent);
   
   var isDoubleCheckmate = false;

//    if(piece.promote) processMove(from, to, "promote");
//    else processMove(from, to, "");

  if(curPlayer.isCheckmate(toCol, toRow, board)) {
   isDoubleCheckmate = true;
  }
  
  piece.move(fromCol,fromRow);
  board.board =  preBoard;
  board.typeBoard =  preTypeBoard;
  board.lowerBoard = preLowerBoard;
  board.upperBoard = preUpperBoard;
  
  if(prePiece != null){
    opponent.currentPiece.push(prePiece);
  }
//    opponent.remove(prePiece,opponent.currentPiece);

//    var recovPiece = opponent.findPiece(toCol, toRow);

//    recovPiece.move(fromCol, fromRow);
//    board.updateBoard(opponent.playerStatus,recovPiece,toCol,piece.toRow);
//    board.updatePlayerBoard(opponent);

  return isDoubleCheckmate;

}

function isCheckmateEndCondition(print) {
    // Check for checkmate condition and return boolean

    var currentPlayer = AllPlayer[playerIndex + 1];
    var opponent = AllPlayer[playerIndex * (-1) + 1];

    var drivePiece = opponent.findPieceFromList(1, opponent.currentPiece);

    if(opponent.isCheckmate(drivePiece.col, drivePiece.row, board)){

        var listForAvailableMoves = opponent.findAllPath(drivePiece, board);

        for(var i = 0; i < listForAvailableMoves.length; i ++) {

            if(simulateMove(opponent, drivePiece, listForAvailableMoves[i][0], listForAvailableMoves[i][1], board)) {
                // console.log("simul");
                listForAvailableMoves.splice(i, 1);
            }
        }
        if(listForAvailableMoves.length == 0) {
            return true;
        }

        if(print) {

            console.log(`${getCurrentPlayer(playerIndex * (-1))} player is in check!`);

            console.log("Available moves:");

            var convertColToChar1 = String.fromCharCode('a'.charCodeAt(0) + drivePiece.col);

            for(var i = 0; i < listForAvailableMoves.length; i ++) {
                var convertColToChar2 = String.fromCharCode('a'.charCodeAt(0) + listForAvailableMoves[i][0]);
                console.log(`move ${convertColToChar1}${drivePiece.row+1} ${convertColToChar2}${listForAvailableMoves[i][1]+1}`);
            }
        }
    }

    return false;
}

function isMoveLimitReached() {
    return upper.turn === 200 && lower.turn === 200;
}

function printCaptures() {

    process.stdout.write("\nCaptures UPPER:");
    for(var i = 0; i < upper.capturedPiece.length; i ++) {
      process.stdout.write(` ${uTypes[upper.capturedPiece[i].type]}`);
    }
  
    process.stdout.write("\nCaptures lower:");
    for(var i = 0; i < lower.capturedPiece.length; i ++) {
      process.stdout.write(` ${lTypes[lower.capturedPiece[i].type]}`);
    }
  
    console.log("\n");
}

function isValidLocation(place) {

    const location = place.split("");
    
    if (location.length > 2) {
      throw new Error("Wrong Command: ex) move a1 [promote]");
    }
    if (location[0] < 'a' || location[0] > 'e') {
      throw new Error("Wrong Command: Location out of bound");
    }
    if (location[1] < '1' || location[1] > '5') { 
      throw new Error("Wrong Command: Location out of bound");
    }
  
    return location;
  }

function startGame() {
    if (commandLineArgs[0] === "-f" && commandLineArgs[1]) {
        const fileData = utils.parseTestCase(commandLineArgs[1]);
        initializeGame(fileData);
    } else if (commandLineArgs[0] === "-i") {
        startInteractiveMode();
    } else {
        console.log("Invalid mode. Please use -f for file mode or -i for interactive mode.");
    }
}

function startInteractiveMode() {
    nextTurn();
}

startGame();