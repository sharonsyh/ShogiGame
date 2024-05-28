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

function gameEndPrint(){
  
  board.printBoard();

  // console.log("");

  process.stdout.write("\nCaptures UPPER:");
  for(var i = 0; i < upper.capturedPiece.length; i ++) {
    process.stdout.write(` ${uTypes[upper.capturedPiece[i].type]}`);
  }

  // console.log("");

  process.stdout.write("\nCaptures lower:");
  for(var i = 0; i < lower.capturedPiece.length; i ++) {
    process.stdout.write(` ${lTypes[lower.capturedPiece[i].type]}`);
  }

  console.log("\n");
}

function processMove(command, from, to, promote) {

}


function fileInitialState(fileData) {
  
//RESET FUNCTION
  board.resetBoard();
  //reinitialize the current and captured piece
  upper.resetAndInitializePieces(); 
  lower.resetAndInitializePieces();

  //FIX??????
  upper.currentPiece = [];
  lower.currentPiece = [];

  fileData.initialPieces.forEach(item => {

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
    } else {
        lower.currentPiece.push(piece);
    }

    board.placeBoard(item.piece, placeCol, placeRow);
    board.placeTypeBoard(Type[pieceType], placeCol, placeRow);
    
  });

  board.lowerBoard = board.initializePlayerBoard(lower);
  board.upperBoard = board.initializePlayerBoard(upper);

  upper.capturedPiece = fileData.upperCaptures.map(pieceCode => {
    const pieceType = Type[pieceCode.toLowerCase()];
    return new Piece(null,null,pieceType);
  });

  lower.capturedPiece = fileData.lowerCaptures.map(pieceCode => {
      const pieceType = Type[pieceCode.toLowerCase()];
      return new Piece(null,null,pieceType); 
  });

  fileData.moves.forEach(moveCommand => {

    const [command, from, to, promote] = moveCommand.split(' '); //move a1 a2
    // processMove(command, from, to, promote);

  
    
    
    locationTo = isValidLocation(to);
    var filePlayer = AllPlayer[playerIndex + 1]; //0 - upper 2 - lower
    var toCol = +(locationTo[0].charCodeAt(0) - 'a'.charCodeAt(0));
    var toRow = +locationTo[1] - 1;

    filePlayer.turn += 1;

    if(command == "move"){

      locationFrom = isValidLocation(from); 
      // locationTo = isValidLocation(to);

      var fromCol = +(locationFrom[0].charCodeAt(0) - 'a'.charCodeAt(0));
      var fromRow = +locationFrom[1] - 1;

      // console.log(`Moving (${fromCol},${fromRow}) to (${toCol},${toRow})`);

      if(filePlayer.move(fromCol, fromRow, toCol, toRow, board)) {

        if(promote == "promote"){
          var promotedPiece = filePlayer.findPiece(toCol,toRow);
          promotedPiece.setPromote(true);
        }

        var opponent = AllPlayer[playerIndex*(-1) + 1];

        if(board.typeBoard[toCol][toRow] != 0){ //capture
          
          // console.log(`board.typeBoard[toCol][toRow]  = ${board.typeBoard[toCol][toRow] }`);
          //accessing the opponent's player object
          if(board.typeBoard[toCol][toRow] * filePlayer.playerStatus == -1) {

            if(playerIndex == -1) {
              if(promote == "promote") console.log(`UPPER player action: ${command} ${from} ${to}, promote : ${promote}`);
              else console.log(`UPPER player action: ${command} ${from} ${to}`);
            }
            else {
              if(promote == "promote") console.log(`lower player action: ${command} ${from} ${to}, promote : ${promote}`);
              else console.log(`lower player action: ${command} ${from} ${to}`);
            }
            // board.printBoard();
            gameEndPrint();

            if(filePlayer.playerStatus == -1) console.log("UPPER player wins. Checkmate.");
            else console.log("lower player wins. Checkmate.");

            process.exit(0);
          }
          var capturedPiece = opponent.findPiece(toCol,toRow);
          filePlayer.capturedPiece.push(capturedPiece);
          opponent.remove(capturedPiece,opponent.currentPiece);        
        }

        //After running Player move, the location of the piece is already updated --> findPiece with toCol and toRow
        board.updateBoard(filePlayer.playerStatus,filePlayer.findPiece(toCol,toRow),fromCol,fromRow);
        board.updatePlayerBoard(filePlayer);
     
        //ADDED FOR THE CHECKMATE
        
        var drivePiece = opponent.findPieceFromList(1, opponent.currentPiece);

        if(opponent.isCheckmate(drivePiece.col, drivePiece.row, board)){
          // if the drive piece is in 
          // if(playerIndex == -1) console.log("lower player is in check!");
          // else console.log("UPPER player is in check!");

          var listForAvailableMoves = opponent.findAllPath(drivePiece, board);

          // console.log("Available moves:");

          if(listForAvailableMoves.length == 0) {

            
            if(playerIndex == -1) {
              if(promote == "promote") console.log(`UPPER player action: ${command} ${from} ${to}, promote : ${promote}`);
              else console.log(`UPPER player action: ${command} ${from} ${to}`);
             
            }
            else {
              if(promote == "promote") console.log(`lower player action: ${command} ${from} ${to}, promote : ${promote}`);
              else console.log(`lower player action: ${command} ${from} ${to}`);

            }
            // board.printBoard();
            gameEndPrint();

            // console.log("HERE???");

            if(playerIndex == -1) console.log(`lower player wins. Checkmate.`);
            else console.log(`UPPER player wins. Checkmate.`);
            process.exit(0);
            // ENDGAME
          }

          // var convertColToChar1 = String.fromCharCode('a'.charCodeAt(0) + drivePiece.col);

          // for(var i = 0; i < listForAvailableMoves.length; i ++) {
          //   var convertColToChar2 = String.fromCharCode('a'.charCodeAt(0) + listForAvailableMoves[i][0]);
          //   console.log(`move ${convertColToChar1}${drivePiece.row+1} ${convertColToChar2}${listForAvailableMoves[i][1]+1}`);
          // }
        }

        // board.printBoard();
      }
      else{
        // console.log("ILLEGAL MOVE");
       
        if(playerIndex == -1) {
          if(promote == "promote") console.log(`UPPER player action: ${command} ${from} ${to}, promote : ${promote}`);
          else console.log(`UPPER player action: ${command} ${from} ${to}`);

        }
        else {
          if(promote == "promote") console.log(`lower player action: ${command} ${from} ${to}, promote : ${promote}`);
          else console.log(`lower player action: ${command} ${from} ${to}`);

        }
        // board.printBoard();
        gameEndPrint();

        if(playerIndex == -1) console.log("lower player wins.  Illegal move.");
        else console.log("UPPER player wins.  Illegal move.");
        process.exit(0);
        
      }
    }
    else if(command == "drop"){
      let pieceType = from; 
      if (from in Type) {
        var targetType = Type[pieceType];
      } else {
        console.log("Error: Invalid piece type.");
      }

      // console.log(`locationTo : ${isValidLocation(to)}`);

      // console.log(`targetType : ${targetType}`);
      // console.log(`capturedPiece.type : ${filePlayer.capturedPiece[0].type}`);

      dropPiece = filePlayer.findPieceFromList(targetType, filePlayer.capturedPiece);
      if(filePlayer.drop(targetType,toCol,toRow,board)) {

        board.updateDropBoard(filePlayer.playerStatus,dropPiece, pieceType);
        board.updatePlayerBoard(filePlayer);

      }
      else {
        // console.log("Drop Invalid!");
        // if(playerIndex == -1) console.log(`lower player wins. Checkmate.`);
        // else console.log(`UPPER player wins. Checkmate.`);

        if(playerIndex == -1) {
          if(promote == "promote") console.log(`UPPER player action: ${command} ${from} ${to}, promote : ${promote}`);
          else console.log(`UPPER player action: ${command} ${from} ${to}`);
        }
        else {
          if(promote == "promote") console.log(`lower player action: ${command} ${from} ${to}, promote : ${promote}`);
          else console.log(`lower player action: ${command} ${from} ${to}`);
        }
        // board.printBoard();
        gameEndPrint();

        if(playerIndex == -1) console.log(`lower player wins.  Illegal move.`);
        else console.log(`UPPER player wins.  Illegal move.`);

        process.exit(0);
      }
    }
    playerIndex *= (-1);

    if (upper.turn == 200 && lower.turn == 200) {

      // console.log(`TURN: ${filePlayer.turn} ${moveCommand}`);

      if(playerIndex == -1) {
        if(promote == "promote") console.log(`lower player action: ${command} ${from} ${to}, promote : ${promote}`);
        else console.log(`lower player action: ${command} ${from} ${to}`);

      }
      else {
        if(promote == "promote") console.log(`UPPER player action: ${command} ${from} ${to}, promote : ${promote}`);
        else console.log(`UPPER player action: ${command} ${from} ${to}`);

      }
      
      gameEndPrint();

      console.log("Tie game.  Too many moves.");

      // if(filePlayer.playerStatus == -1) console.log("lower player wins. Checkmate.");
      // else console.log("UPPER player wins. Checkmate.");

      process.exit(0);
    }
    // board.printBoard();
    //move(from, to, board, upper, lower);
  });

  const lastMoveCommand = fileData.moves[fileData.moves.length - 1];
  if(fileData.moves.length % 2 == 0) {
    console.log("UPPER player action:", lastMoveCommand);
    gameEndPrint();

    var drivePiece = lower.findPieceFromList(1, lower.currentPiece);

    if(lower.isCheckmate(drivePiece.col, drivePiece.row, board)){

      var listForAvailableMoves = lower.findAllPath(drivePiece, board);

      console.log("lower player is in check!");
      console.log("Available moves:");
      
      var convertColToChar1 = String.fromCharCode('a'.charCodeAt(0) + drivePiece.col);

      for(var i = 0; i < listForAvailableMoves.length; i ++) {
        var convertColToChar2 = String.fromCharCode('a'.charCodeAt(0) + listForAvailableMoves[i][0]);
        console.log(`move ${convertColToChar1}${drivePiece.row+1} ${convertColToChar2}${listForAvailableMoves[i][1]+1}`);
      }
    }


    console.log("lower>");
    process.exit(0);
  }
  else {
    console.log("lower player action:", lastMoveCommand);
    gameEndPrint();

    var drivePiece = upper.findPieceFromList(1, upper.currentPiece);

    console.log(`drivePiece : ${drivePiece.col}, ${drivePiece.row}`);

    if(upper.isCheckmate(drivePiece.col, drivePiece.row, board)){

      var listForAvailableMoves = upper.findAllPath(drivePiece, board);
      console.log("upper player is in check!");
      console.log("Available moves:");
    

      var convertColToChar1 = String.fromCharCode('a'.charCodeAt(0) + drivePiece.col);

      for(var i = 0; i < listForAvailableMoves.length; i ++) {
        var convertColToChar2 = String.fromCharCode('a'.charCodeAt(0) + listForAvailableMoves[i][0]);
        console.log(`move ${convertColToChar1}${drivePiece.row+1} ${convertColToChar2}${listForAvailableMoves[i][1]+1}`);
      }
    }

    console.log("UPPER>");

    process.exit(0);

  }
  // board.printBoard();
}

if (commandLineArgs[0] === "-f" && commandLineArgs[1]) {
  const input = utils.parseTestCase(commandLineArgs[1]);
//   console.log(`UPPER player action: drop s d1
// 5 |__|__| R|__| D|
// 4 |__|__|__|__|__|
// 3 |__|__|__|__|__|
// 2 |__|__|__|__|__|
// 1 | d| g|__| n|__|
//     a  b  c  d  e

// Captures UPPER: S R P
// Captures lower: p n g s

// lower player wins.  Illegal move.
// `);

  fileInitialState(input);



}

else if (commandLineArgs[0] === "-i") {
  // Interactive mode
  board.printBoard();
  
//   console.log("");
  process.stdout.write("\nCaptures UPPER:");
  upper.capturedPiece.forEach(piece => {
    if (piece) { 
      process.stdout.write(` ${lTypes[piece.type]}`);
    }
  });
//   console.log("");
  process.stdout.write("\nCaptures lower:");
  lower.capturedPiece.forEach(piece => {
    if (piece) { 
      process.stdout.write(` ${uTypes[piece.type]}`);
    }
  });
  console.log("\n");

  nextTurn(); 
}

function isValidLocation(command) {
  const location = command.split("");
  
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

function nextTurn() {
  let player = AllPlayer[playerIndex + 1];

  let playerName = playerIndex === -1 ? "UPPER> " : "lower> ";


  rl.question(`${playerName}`, (input) => {

    player.turn += 1;

    if (player.turn == 200) { // + Checkmate stopping condition ??!!!
      console.log("Tie game. Too many moves.");
      rl.close(); 
      process.exit(0);
    }

    let whosTurn = playerIndex === -1 ? "UPPER" : "lower";

    console.log(`${whosTurn} player action: ${input}`);

    const playerCommand = input.split(" ");
    copyCommand = playerCommand;
    if(playerCommand[0] == command[0]) { //move
  
      if(playerCommand.length > 4){
        //throw excetpion
        throw new Error("Command Invalid : too many arguments ex) move a1 a2 [promote]");
        
      }else if(playerCommand.length == 4){
        // if not promote throw
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

      if(player.move(fromCol,fromRow, toCol, toRow , board)){ //move (fromCol,fromRow) to (toCol,toRow)
        
        var opponent = AllPlayer[playerIndex*(-1) + 1];

        if(board.typeBoard[toCol][toRow] != 0){ //capture
          
          if(board.typeBoard[toCol][toRow] * player.playerStatus == -1) {

            // console.log("DRIVE IS CAPTURED");
            if(playerIndex == -1) console.log(`UPPER player wins. Checkmate.`);
            else console.log(`lower player wins. Checkmate.`);

            rl.close();
            process.exit(0);
          }
          //accessing the opponent's player object
          var capturedPiece = opponent.findPiece(toCol,toRow);
          player.capturedPiece.push(capturedPiece);
          opponent.remove(capturedPiece,opponent.currentPiece);        
        }

        //After running Player move, the location of the piece is already updated --> findPiece with toCol and toRow
        board.updateBoard(player.playerStatus,player.findPiece(toCol,toRow),fromCol,fromRow);
        board.updatePlayerBoard(player);

        board.printBoard();
  
        console.log("");
        process.stdout.write("Captures UPPER: ");
        upper.capturedPiece.forEach(piece => {
          if (piece) { 
            process.stdout.write(`${lTypes[piece.type]} `);
          }
        });
        console.log("");
        process.stdout.write("Captures lower: ");
        lower.capturedPiece.forEach(piece => {
          if (piece) { 
            process.stdout.write(`${uTypes[piece.type]} `);
          }
        });
        console.log("\n");
     
        //ADDED FOR THE CHECKMATE
        
        var drivePiece = opponent.findPieceFromList(1, opponent.currentPiece);

        if(opponent.isCheckmate(drivePiece.col, drivePiece.row, board)){
          // if the drive piece is in 
          if(playerIndex == -1) console.log("lower player is in check!");
          else console.log("UPPER player is in check!");

          var listForAvailableMoves = opponent.findAllPath(drivePiece, board);

          if(listForAvailableMoves.length == 0) {
            // console.log("HERE?????");
            if(playerIndex == -1) console.log(`UPPER player wins. Checkmate.`);
            else console.log(`lower player wins. Checkmate.`);

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
        if(playerIndex == -1){
          console.log("lower player wins.  Illegal move.");
        }
        else if(playerIndex == 1){
          console.log("UPPER player wins.  Illegal move.");
        }
        rl.close();
        process.exit(0);
      }
    }

    else if(playerCommand[0] == command[1]){ //drop
      if(playerCommand.length > 3){
        // throw exception
        throw new Error("Command Invalid : too many arguments ex) drop s a2");
      }

      // drop s e2
      // pieceType = isValidLocation(playerCommand[1]); //s

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
      if(player.drop(targetType,toCol,toRow,board)) {

        board.updateDropBoard(player.playerStatus,dropPiece, pieceType);
        board.updatePlayerBoard(player);

      }
      else {
        console.log("Drop Invalid!");
      }
    }
    else {
      //throw exception —> wrong command
      throw new Error("Command Invalid : ex) move a1 a2 [promote] / drop s a2");
    }

    //checkmate —> show all available moves

    playerIndex *= -1; // Switch players
    nextTurn();

  });
}
