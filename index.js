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


// const checkTypeBehind = {

//   '1: 1,
//   'n': 2,
//   'g': 3,
//   's': 4,
//   'r': 5,
//   'p': 6
  
// }

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
    initializeBoard();
    initializeCapturedPieces(upper, fileData.upperCaptures);
    initializeCapturedPieces(lower, fileData.lowerCaptures);
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
        } else if (command === "drop") {
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

// const Type = {

//   'd': 1,
//   'n': 2,
//   'g': 3,
//   's': 4,
//   'r': 5,
//   'p': 6
  
// }

function processMove(from, to, promote) {

    var locationTo = isValidLocation(to);
    var filePlayer = AllPlayer[playerIndex + 1]; //0 - upper 2 - lower
    var toCol = +(locationTo[0].charCodeAt(0) - 'a'.charCodeAt(0));
    var toRow = +locationTo[1] - 1;
 
    var locationFrom = isValidLocation(from); 
    var fromCol = +(locationFrom[0].charCodeAt(0) - 'a'.charCodeAt(0));
    var fromRow = +locationFrom[1] - 1;

    var currentPiece = filePlayer.findPiece(fromCol,fromRow);
    var pieceBehind = board.typeBoard[fromCol][fromRow -1];
    if((fromRow - 1 >= 0) && pieceBehind != 0) {
      typePieceBehind = Type[currentPiece.type];

      

    }

    if(filePlayer.move(fromCol, fromRow, toCol, toRow, board)) {

      if(promote == "promote"){
            
          var promotedPiece = filePlayer.findPiece(toCol,toRow);
          if(promotedPiece.type == 1 || promotedPiece.type == 4 || (promotedPiece.promote && (promotedPiece.type != 6))) {
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

      board.updateBoard(filePlayer.playerStatus,filePlayer.findPiece(toCol,toRow),fromCol,fromRow);
      board.updatePlayerBoard(filePlayer);

    } else {
      
      if(promote == "promote") console.log(`${getCurrentPlayer(playerIndex)} player action: move ${from} ${to}, promote`);
      else console.log(`${getCurrentPlayer(playerIndex)} player action: move ${from} ${to}`);

      gameEndPrint();
      console.log(`${getCurrentPlayer(playerIndex * (-1))} player wins.  Illegal move.`);
      process.exit(0);
      
    }
}

function processDrop(piece, to) {
  let pieceType = piece; 
  var preBoard = board.board.map(v => [...v]);

  if (pieceType in Type) {
      var targetType = Type[pieceType];
  } else {
      console.log("Error: Invalid piece type.");
  }

  var locationTo = isValidLocation(to);
  var filePlayer = AllPlayer[playerIndex + 1]; //0 - upper 2 - lower
  var toCol = +(locationTo[0].charCodeAt(0) - 'a'.charCodeAt(0));
  var toRow = +locationTo[1] - 1;
  var opponent = AllPlayer[playerIndex * (-1) + 1];
  // var isInvalid = false;

  dropPiece = filePlayer.findPieceFromList(targetType, filePlayer.capturedPiece);

  if(dropPiece && filePlayer.drop(targetType,toCol,toRow,board)) {

      board.updateDropBoard(filePlayer.playerStatus,dropPiece, pieceType);
      board.updatePlayerBoard(filePlayer);

      //check for the immediate checkmate

      var drivePiece = opponent.findPieceFromList(1, opponent.currentPiece);

      if(opponent.isCheckmate(drivePiece.col, drivePiece.row, board) && dropPiece.type == 6){

        console.log(`${getCurrentPlayer(playerIndex)} player action: drop ${piece} ${to}`);
        board.board =  preBoard;
        gameEndPrint();
        console.log(`${getCurrentPlayer(playerIndex * (-1))} player wins.  Illegal move.`);
        process.exit(0);

      } else {

        filePlayer.remove(dropPiece, filePlayer.capturedPiece);
       
      }


  } else {
    console.log(`${getCurrentPlayer(playerIndex)} player action: drop ${piece} ${to}`);
    gameEndPrint();
    console.log(`${getCurrentPlayer(playerIndex * (-1))} player wins.  Illegal move.`);
    process.exit(0);

  }
}

function switchPlayers() {
    playerIndex *= -1; 
}

function simulateMove(curPlayer, piece, toCol,toRow, board) {

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

   piece.move(toCol,toRow);
   board.updateBoard(curPlayer.playerStatus,piece,fromCol,fromRow);
   board.updatePlayerBoard(opponent);
   
   var isDoubleCheckmate = false;

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

  return isDoubleCheckmate;

}

function isCheckmateEndCondition(print) {
    // Check for checkmate condition and return boolean

    var opponent = AllPlayer[playerIndex * (-1) + 1];
    var drivePiece = opponent.findPieceFromList(1, opponent.currentPiece);

    if(opponent.isCheckmate(drivePiece.col, drivePiece.row, board)){

        var listForAvailableMoves = opponent.findAllPath(drivePiece, board);

        for (var i = listForAvailableMoves.length - 1; i >= 0; i--) {
          // console.log(`!!Checking (col, row) = (${listForAvailableMoves[i][0]}, ${listForAvailableMoves[i][1]})`);
          if (simulateMove(opponent, drivePiece, listForAvailableMoves[i][0], listForAvailableMoves[i][1], board)) {
              listForAvailableMoves.splice(i, 1);
          }
        }

        listForAvailableMoves.sort((a, b) => {
          if (a[0] === b[0]) {
              return a[1] - b[1]; // If columns are the same, sort by rows
          }
          return a[0] - b[0]; // Sort by columns otherwise
        });

      
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

function processMoveCommand(player, playerCommand) {

  if(playerCommand.length > 4){
    throw new Error("Command Invalid : too many arguments ex) move a1 a2 [promote]");
    
  } else if(playerCommand.length == 4){
    if(command[3] != "promote"){
      throw new Error("Command Invalid : wrong command ex) move a1 a2 [promote]");
    }
  }

  locationFrom = isValidLocation(playerCommand[1]); 
  locationTo = isValidLocation(playerCommand[2]);
  // console.log(`!${locationFrom}, ${locationTo}`)

  var fromCol = +(locationFrom[0].charCodeAt(0) - 'a'.charCodeAt(0));
  var fromRow = +locationFrom[1] - 1;
  var toCol = +(locationTo[0].charCodeAt(0) - 'a'.charCodeAt(0));
  var toRow = +locationTo[1] - 1;

  if(command[3] == "promote"){
    var currentPlayer = AllPlayer[playerIndex + 1];
    var promotedPiece = currentPlayer.findPiece(toCol,toRow);
    promotedPiece.setPromote(true);
  }

  if(player.move(fromCol,fromRow, toCol, toRow , board)){ 
        
    var opponent = AllPlayer[playerIndex*(-1) + 1];

    if(board.typeBoard[toCol][toRow] != 0){ //capture
      
      if(board.typeBoard[toCol][toRow] * player.playerStatus == -1) {

        console.log(`${getCurrentPlayer(playerIndex)} player wins. Checkmate.`);

        rl.close();
        process.exit(0);
      }
      //accessing the opponent's player object
      var capturedPiece = opponent.findPiece(toCol,toRow);
      player.capturedPiece.push(capturedPiece);
      opponent.remove(capturedPiece,opponent.currentPiece);        
    }

    board.updateBoard(player.playerStatus,player.findPiece(toCol,toRow),fromCol,fromRow);
    board.updatePlayerBoard(player);

    gameEndPrint();
    
    var drivePiece = opponent.findPieceFromList(1, opponent.currentPiece);

    if(opponent.isCheckmate(drivePiece.col, drivePiece.row, board)){

      console.log(`${getCurrentPlayer(playerIndex*(-1))} player is in check!`);

      var listForAvailableMoves = opponent.findAllPath(drivePiece, board);

      for(var i = 0; i < listForAvailableMoves.length; i ++) {

        if(simulateMove(opponent, drivePiece, listForAvailableMoves[i][0], listForAvailableMoves[i][1], board)) {
            listForAvailableMoves.splice(i, 1);
        }
      }
      if(listForAvailableMoves.length == 0) {

        console.log(`${getCurrentPlayer(playerIndex)} player wins. Checkmate.`);
        rl.close();
        process.exit(0);
      }

      console.log("Available moves:");
      var convertColToChar1 = String.fromCharCode('a'.charCodeAt(0) + drivePiece.col);

      for(var i = 0; i < listForAvailableMoves.length; i ++) {
        var convertColToChar2 = String.fromCharCode('a'.charCodeAt(0) + listForAvailableMoves[i][0]);
        console.log(`move ${convertColToChar1}${drivePiece.row+1} ${convertColToChar2}${listForAvailableMoves[i][1]+1}`);
      }
    }
  }
  else{
    //illegal move
    console.log(`${getCurrentPlayer(playerIndex*(-1))} player wins.  Illegal move.`);
    rl.close();
    process.exit(0);
  }

}

function processDropCommand(player, playerCommand) {

  if(playerCommand.length > 3){
    // throw exception
    throw new Error("Command Invalid : too many arguments ex) drop s a2");
  }
  let pieceType = playerCommand[1]; 
  if (pieceType in Type) {
    var targetType = Type[pieceType];
  } else {
    console.log("Error: Invalid piece type.");
  }

  locationTo = isValidLocation(playerCommand[2]); //e2
  var toCol = +(locationTo[0].charCodeAt(0) - 'a'.charCodeAt(0));
  var toRow = +locationTo[1] - 1;

  //check if s belongs to the player's captured piece
  //player.capturedPiece
  console.log(`targetType : ${targetType}`);
  console.log(`capturedPiece.type : ${player.capturedPiece[0].type}`);

  dropPiece = player.findPieceFromList(targetType, player.capturedPiece);
  if(player.drop(targetType,toCol,toRow,board) && dropPiece) {

    board.updateDropBoard(player.playerStatus,dropPiece, pieceType);
    board.updatePlayerBoard(player);

  } else {
    console.log(`${getCurrentPlayer(playerIndex)} player action: drop ${pieceType} ${locationTo}`);
    gameEndPrint();
    console.log(`${getCurrentPlayer(playerIndex * (-1))} player wins.  Illegal move.`);
    rl.close();
    process.exit(0);
  }
}


function nextTurn() {

  let player = AllPlayer[playerIndex + 1];
  let playerName = playerIndex === -1 ? "UPPER> " : "lower> ";

  rl.question(`${playerName}`, (input) => {
    player.turn += 1;
    const playerCommand = input.split(" ");

    console.log(`${playerIndex === -1 ? "UPPER" : "lower"} player action: ${input}`);

    try {
      if (playerCommand[0] === "move") {
        processMoveCommand(player, playerCommand);
      } else if (playerCommand[0] === "drop") {
        processDropCommand(player, playerCommand);
      } else {
        throw new Error("Command Invalid: Use 'move' or 'drop'");
      }
    } catch (error) {
      console.error(error.message);
      rl.close();
      return; 
    }

    playerIndex *= -1; 
    nextTurn(); 
  });
}

function startInteractiveMode() {

  board.printBoard();

  process.stdout.write("\nCaptures UPPER:");

  upper.capturedPiece.forEach(piece => {
    if (piece) { 
      process.stdout.write(` ${lTypes[piece.type]}`);
    }
  });

  process.stdout.write("\nCaptures lower:");

  lower.capturedPiece.forEach(piece => {
    if (piece) { 
      process.stdout.write(` ${uTypes[piece.type]}`);
    }
  });
  console.log("\n");

  nextTurn(); 
}

startGame();
}