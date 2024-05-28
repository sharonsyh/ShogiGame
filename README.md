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

## Trade-offs

- **Maintainability**: If the game rules change or new features are added, it can be achieved by extending the existing classes and adding new functions without major modification.
- **Performance Overheads**: Object creation and method calls in a high-complexity game might lead to performance overheads compared to direct procedural programming techniques.
