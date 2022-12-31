import { basePath } from "./classes/api/base.js";
import { GameServices } from "./classes/api/GameServices.js";
import { Player } from "./classes/Player.js";
import { WinStorage } from "./classes/WindowStorageManager.js";

const socket = io();
 
// Variables necesarias y nodos del DOM
const user = WinStorage.getParsed('currentUser');
const roomSelected = WinStorage.getParsed('roomSelected');
//Nodos para setear los boards
const roomId = roomSelected.name.substring(5);
const userNameLeft = document.querySelector(`#room-${roomId} #board-user-left`);
const userBoardLeft = document.querySelector(`#room-${roomId} .user-board-left`);
const userBoardLeftScore = document.querySelector(`#room-${roomId} .user-board-left .user-score .text`);
const userBoardLeftPercentage = document.querySelector(`#room-${roomId} .user-board-left .user-percentage .text`);
const userBoardLeftNoUser = document.querySelector(`#room-${roomId} .user-board-left-no-user`);
const svgLeft = document.querySelectorAll(`#room-${roomId} #svg-left path`);
const userNameRight = document.querySelector(`#room-${roomId} #board-user-right`);
const userBoardRight = document.querySelector(`#room-${roomId} .user-board-right`);
const userBoardRightScore = document.querySelector(`#room-${roomId} .user-board-right .user-score .text`);
const userBoardRightPercentage = document.querySelector(`#room-${roomId} .user-board-right .user-percentage .text`);
const userBoardRightNoUser = document.querySelector(`#room-${roomId} .user-board-right-no-user`);
const svgRight = document.querySelectorAll(`#room-${roomId} #svg-right path`);
const winText = document.querySelector(`#room-${roomId} .final`);
const boardSquares = document.querySelectorAll(`#room-${roomId} .board-item`);
const boardSquaresCanvas = document.querySelectorAll(`#room-${roomId} .board-item canvas`);

document.querySelector('.header').classList.add('hide');
document.querySelector('.footer').classList.add('hide');

let playerOneData = {};
let playerTwoData = {};
let playerOneScore = 0;
let playerTwoScore = 0;
let gameId;
let players = [{}, {}];



    boardSquaresCanvas.forEach(element => {
        const ctx = element.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, element.width, element.height);

    })

/**
 * Función que gestiona el inicio de la partida
 */
function initGame(){
    let gameExist = false;
    let isGameCreated = false;

    //comprobamos si existe algún juego activo con nuestro id de room
    GameServices.getAllGames()
        .then(response => {
            
            // Comprobamos si el array de la respuesta tiene longitud
            if(response.length){
                
                response.forEach(item => {
                    //Si existe un juego con el id de nuestro room añadimos un jugador
                    if(item.room.id == roomId){
                        gameExist = true;
                        gameId = item.id;
                        
                    }
                });
            }
            else{
                // Si no tiene longitud creamos el juego
                isGameCreated = true
                setExitButton();
                createNewGame();
            };

            if(gameExist){
                
                addNewPlayerOnGame(gameId)
            }
            if(!gameExist && !isGameCreated){
                
                setExitButton();
                createNewGame();
            }
        });
};


// FUnción que inicializa todo
initGame();


/**
 * Acción para setear el otón de salir del juego
 */
function setExitButton(){
    // Acción para sacar a un jugador de la sala
    const btnExitRoom = document.querySelector(`#room-${roomId} .btn-exit-room`);
    btnExitRoom.style.display = 'inline-block';
    btnExitRoom.addEventListener('click', () => {
        GameServices.deleteGameById(gameId)
        .then(() => {
            //Datos para pasar al servicio
            const data = {
                _id: user._id,
                userName: user.userName
            };
            GameServices.deletePLayerOnRoom(data, roomSelected._id)
            .then(() => {
                // Borramos los datos del room en el localStorage
                document.querySelector('.header').classList.remove('hide');
                document.querySelector('.footer').classList.remove('hide');
                WinStorage.removeItem('roomSelected');

                socket.emit('game::exit', ({
                    user: user,
                    roomId: roomSelected._id

                }));

                window.location.href = '/rooms.html';
            })
            .catch(err => {
                console.error(err)
            });
        })
        .catch(err => {
            console.error(err)
        })
    });
}

/**
 * Función para crear una nueva partida
 */
function createNewGame(){
    //Datos para pasar al servicio
    const data = {
        player: {
            id: user._id,
            userName: user.userName,
            email: user.email
        },
        room: {
            id: roomId,
            name: roomSelected.name
        }
    };

    GameServices.createGame(data)
    .then(response => {
        gameId = response.id;
        const playerData = response.players[0];
        Object.assign(playerData, {boardPosition: 'left'});
        players[0] = new Player(playerData);
        setPlayerOne();
    })
    .catch((err) => {
        // Gestionar el error
        console.error(err)
    })
};

/**
 * Función para añadir un nuevo jugador a la partida
 * @param {Number} gameId id del juego 
 */
function addNewPlayerOnGame(gameId){

    const data = {
        id: user._id,
        userName: user.userName,
        email: user.email
    };

    GameServices.addPlayerOnGame(data, gameId)
    .then(() => {
        //Ocultamos el botón de salir del juego
        document.querySelector(`#room-${roomId} .btn-exit-room`).style.display = 'none';

        GameServices.getGameById(gameId)
        .then(response => {
            // Socket envía mensaje al server para iniciar el juego
            socket.emit(`game::start-${roomId}`, (response.players));
            
        })
        .catch(err => console.log(err))
    })
    .catch(err => {
        // Gestionar el error
        console.error(err)
    })
};

// Socket recibe mensaje del server para iniciar el juego
socket.on(`game::start-${roomId}`, (args) => {
    startGame(args)
});

function startGame(args){
    // Datos recibidos del socket:server
    // Aquí se podría pintar el tablero con los datos del JSON
    const {gamePLayers, json} = args;


    // Añadimos el id del juego actual al local storage, será necesario si vamos a hacer logout después
    roomSelected.currentGameId = gameId;
    WinStorage.set('roomSelected', roomSelected);

    //Animación del contador para empezar a jugar
    const countDown = document.querySelector(`#room-${roomId} .countdown`);
    const countDownMsg = document.querySelector(`#room-${roomId} .countdown .msg`);
    countDown.classList.add('show');
    
    //Ocultamos el botón de salir del juego
    document.querySelector(`#room-${roomId} .btn-exit-room`).style.display = 'none';

    const arrMessages = ['Ready', '3', '2', '1', 'Go!'];
    let msg;

    const messages = setInterval(function () {
        msg = arrMessages.shift();
          if (msg === undefined) {
           countDown.classList.remove('show')
           clearInterval(messages);
           return;
        }
        countDownMsg.innerHTML = msg;
      },1000);

    // Seteamos los datos del jugador
    playerOneData = gamePLayers[0];
    Object.assign(playerOneData, {boardPosition: 'left'});
    players[0] = new Player(playerOneData);

    playerTwoData = gamePLayers[1];
    Object.assign(playerTwoData, {boardPosition: 'right'});
    players[1] = new Player(playerTwoData);

    setPlayerOne();
    setPlayerTwo();

    //Recorremos el array de cuadrados del HTML
    boardSquaresCanvas.forEach((element, index) => {
        
        //Asignamos un escuchador con el evento click a cada elemento del array
        element.addEventListener('click', function(event){
            const boardItem = boardSquares[index]
            const cellSelected = Number(boardItem.id);
            setCell(cellSelected);
        });
    });
}


/**
 * Acción para gestionar el número de celda seleccionada
 * @param {Number} cellNumber Número de la celda seleccionada
 */
function setCell(cellNumber){
    // const currentPlayer = players.find(player => Object.keys(player).length && Number(player.player.id) === Number(user.id));
    const currentPlayer = players.find(item => item.player.id == user._id);
    
    const data = {
        id: cellNumber,
        color: currentPlayer.player.color
    };

    GameServices.putCellOnGame(data, gameId, cellNumber)
    .then(response => {
        if(!response.msg){
            
            // Emitimos mensaje al server para colocar la celda
            socket.emit(`game::set-cell-${roomId}`, ({
                cellNumber: cellNumber,
                currentPlayer: currentPlayer,
                gameId: gameId
            }));
        }
        else{
            // Gestionar el error
        }
    })
    .catch(err => {
        // Gestionar el error
        console.error(err)
    })
};

// Recibimos mensaje al server para actualizar los datos del juego
socket.on(`game::set-cell-${roomId}`, (args) => {
    updateGame(args);
});

/**
 * Acción para actualizar los datos del juego
 * @param {Object} args objeto con los datos que recibimos del socket:server 
 */
function updateGame(args){
    const {gamePlayercurrentPlayer, json} = args;
    //const currentPlayer = players.find(player => Object.keys(player).length && Number(player.player.id) === Number(gamePlayercurrentPlayer.player.id));
    const currentPlayer = players.find(item => item.player.id == gamePlayercurrentPlayer.player.id);
    let scoreOne = 0;
    let scoreTwo = 0;

    //Pinta las celdas de su color correspondiente y calcula las puntuaciones
    json.cells.forEach((cell, index) => {
        if(cell.color !== 'NONE'){
            const currentCanvas = boardSquaresCanvas[index];

            let ctx = currentCanvas.getContext("2d");
            ctx.fillStyle = cell.color;
            ctx.fillRect(0, 0, currentCanvas.width, currentCanvas.height);
            if(currentPlayer.player.color === cell.color && currentPlayer.player.boardPosition === 'left'){
                scoreOne++;
                playerOneScore = scoreOne;
                currentPlayer.player.score = scoreOne;
            }
            if(currentPlayer.player.color === cell.color && currentPlayer.player.boardPosition === 'right'){
                scoreTwo++;
                playerTwoScore = scoreTwo;
                currentPlayer.player.score = scoreTwo;
            }

        }
    });


    if(currentPlayer.player.boardPosition === 'left'){
        userBoardLeftScore.innerHTML = `${playerOneScore}/36`;
        userBoardLeftPercentage.innerHTML = `${setPercentage(playerOneScore)}%`;
    }
    else{
        userBoardRightScore.innerHTML = `${playerTwoScore}/36`;
        userBoardRightPercentage.innerHTML = `${setPercentage(playerTwoScore)}%`;
    }

    // lógica del ganador
    if(playerOneScore + playerTwoScore === json.cells.length){
        winText.classList.add('show');

        // lógica del ganador si hay empate
        if(playerOneScore === playerTwoScore){
            winText.innerHTML = `${players[0].player.userName} & ${players[1].player.userName} are tie!!`;
        }
        else if(playerOneScore > playerTwoScore){
            // lógica del ganador playerOne
            winText.innerHTML = `${players[0].player.userName} wins!!`;
        }
        else{
            // lógica del ganador playerTwo
            winText.innerHTML = `${players[1].player.userName} wins!!`;
        }

        const currentPlayer = players.find(item => item.player.id == user._id);
        setScore(currentPlayer)

        //Mostramos el botón de salir del juego
        setExitButton();

    }
    
}


function setScore(player){
    const rival = players.find(item => item.player.id !== player.player.id)
    const data = {
        percentage: `${setPercentage(player.player.score)}%`,
        playerRival: rival.player.userName,
        roomId: roomSelected._id,
        gameId: gameId
    }

    fetch(`${basePath}/users/${player.player.id}/scores`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: new Headers(
            {
            'Content-Type':  'application/json'
            }
        )           
    })
    .then(data => data.json()) 
    .then(response => {
        console.log('Respuesta front fetch', response)
    })
    .catch(err => {
        console.log('Error fetch front', err);
    })
};



// Acción que calcula el porcentaje
function setPercentage(value){
    const total = 36;
    return Math.round(100 * value / total);
};

// Setea el board del HTML del jugador 1
function setPlayerOne(){
    userBoardLeft.classList.add('show');
    userBoardLeftNoUser.classList.add('hide');
    userNameLeft.innerHTML = players[0].player.userName;
    svgLeft.forEach(item => {
        item.style.fill = players[0].player.color;
    });

};

// Setea el board del HTML del jugador 2
function setPlayerTwo(){
    userBoardRight.classList.add('show');
    userBoardRightNoUser.classList.add('hide');
    userNameRight.innerHTML = players[1].player.userName;
    svgRight.forEach(item => {
        item.style.fill = players[1].player.color;
    });
};
