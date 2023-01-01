import { basePath } from "./classes/api/base.js";
import { WinStorage } from "./classes/WindowStorageManager.js";

const socket = io();

const elementRooms = document.querySelectorAll('.card');
const titleRooms = document.querySelectorAll('.card-text');
const imageRooms = document.querySelectorAll('.card-header img');
const errorMessage = document.querySelector('.error-message');
const user = WinStorage.getParsed('currentUser');
$('#btn-go').prop('disabled', true);
//Drag and Drop
//Recogemos los elementos del DOM. El avatar y las tarjetas donde queremos que entre el avatar
const imagen = document.querySelector('#avatar-output img');
const cardItems = document.querySelectorAll('.card');
//Fin Drag and Drop

function setRooms(){
    return fetch(`${basePath}/rooms`)
        .then(data => data.json()) 
        .then(response => {

            response.forEach((item, index) => {
                elementRooms[index].id = item._id;
                titleRooms[index].innerHTML = item.name;
                imageRooms[index].src = 'img/' + item.image + '.jpg';
            });

            response.forEach((element, index) => {
                element.players.forEach(player => {

                    socket.emit(`rooms::show-avatars`, ({
                        roomId: element._id,
                        user: player
                    }));

                })
            });

            saveRoom();

        })
        .catch(err => console.log('Error fetch front', err))
}

setRooms();

//Drag and Drop
//Asignamos un escuchador al avatar con el evento DragStart
imagen.addEventListener('dragstart', handleImageDragStart)

//Función que se ejecuta tras el evento DragStart del avatar
function handleImageDragStart(e) {

    //Asignamos el usuario del localStorage al objeto DataTransfer
    e.dataTransfer.setData('currentUser', JSON.stringify(user));

    e.dataTransfer.setDragImage(e.target, 50,50);

}

// Recorremos el array de las cards
cardItems.forEach(item => {
    //Asignamos un escuchador a cada card con el evento DragOver
    item.addEventListener('dragover', allowDrop);
    //Asignamos un escuchador a cada card con el evento Drop
    item.addEventListener('drop', drop);
    
});

//Función para recoger el elemento soltado
function drop(ev) {
    //Previene el comportamiento por defecto del navegador
    ev.preventDefault();    

}

//Función necesaria para permitir el Drag and Drop
function allowDrop(ev) {
    ev.preventDefault();
}

//Fin Drag and Drop


// Función que asigna un click a cada room y salva la room seleccionada en el localStorage
function saveRoom(){
    elementRooms.forEach(element => {
        element.addEventListener('dragover', allowDrop);
        element.addEventListener('drop', (ev) => {
            console.log(element)
            //Previene el comportamiento por defecto del navegador
            ev.preventDefault();
            //Creamos una variable a la que se le asigna el valor de lo que contiene el objeto dataTransfer
            const currentUser = ev.dataTransfer.getData("currentUser");

            if(!currentUser){
                //Animación jQuery
                showAlert('unsuccess', 'Please drag & drop your avatar!', {
                    "bottom": '0' 
                })
            }
            else{
                fetch(`${basePath}/rooms/${element.id}/users`, {
                    method: "POST",
                    body: currentUser,
                    headers: new Headers(
                        {
                           'Content-Type':  'application/json'
                        }
                    )          
                })
                .then(data => data.json()) 
                .then(response => {

                    if(response.msg){
                        errorMessage.innerHTML = 'The room is full! Please choose another room!';
                        errorMessage.classList.remove('hide');
                        errorMessage.classList.add('show');

                        //Animación jQuery
                        hideAlert();
                    }
                    else {
                        errorMessage.innerHTML = "";
                        
                        const room = response
                        WinStorage.set('roomSelected', response);

                        //Animación jQuery
                        const alertMessage = 'You choose the ' + room.name + ' Press Go! to enter.';
                        showAlert('success', alertMessage, {
                            "bottom": '0' 
                        });
                        //Fin Animación jQuery
                        $('#btn-go').prop('disabled', false);

                        const currentUserToJson = JSON.parse(currentUser);

                        const roomIdSubstract = room.name.substring(5);
                       
                        $( "#btn-go" ).click(function() {
                            window.location.href = 'room' + roomIdSubstract + '.html';
                        });

                        socket.emit(`rooms::show-avatars`, ({
                            roomId: room._id,
                            user: currentUserToJson
                        }));
                        
                    }
                    
                })
                .catch(err => {
                    console.error(err);
                    errorMessage.innerHTML = err;
                    errorMessage.classList.remove('hide');
                    errorMessage.classList.add('show');
                    console.log('Error fetch front', err);
                });
            }
            
        });

    });
};

socket.on(`rooms::show-avatars`, (args) => {
    console.log('llega al emit: ', args)
    setAvatarsInRooms(args)
});

socket.on('game::exit', (args) => {
    deleteAvatar(args)
});

function setAvatarsInRooms(data){
    console.log('setAvatarsInRooms: ' ,data)
    const cardFooter = document.querySelector(`[id='${data.roomId}'] .card-footer`);
    const hasImages = document.querySelectorAll(`[id='${data.roomId}'] .avatar-room-drop img`);

    if(!hasImages || hasImages.length < 2){
        const imgExist = document.getElementById(`avatar-room-drop-img-${data.user.avatar._id}`);
        if(imgExist == null || imgExist == undefined){
            const avatarRoomImgWrapper = document.createElement("div");
            avatarRoomImgWrapper.classList.add('avatar-room-drop');
            avatarRoomImgWrapper.setAttribute('id', `avatar-room-drop-${data.user.avatar._id}`);
            avatarRoomImgWrapper.innerHTML = `
            <img id="avatar-room-drop-img-${data.user.avatar._id}" src="img/avatar-${data.user.avatar.id}.jpg">
            <span>${data.user.userName}</span>
            `;
            cardFooter.appendChild(avatarRoomImgWrapper);
        }
    }
    
}

function deleteAvatar(data){
    document.getElementById(`avatar-room-drop-${data.user.avatar._id}`).remove();
}

//Función mostrar alerta animación jQuery
function showAlert(type, text, animation) {
    const alertRoom = $('.alert-room');
    if(type === 'success'){
        alertRoom.removeClass('unsuccess');
    }
    else{
        alertRoom.removeClass('success');
    }
    alertRoom.addClass(type);
    alertRoom.text(text);
    alertRoom.animate(animation);
};

//Función ocultar alerta animación jQuery
function hideAlert(){
    $('.alert-room').animate({
        "bottom": '-100%' 
    });
}

//función asignar avatar escogido
if(user !== null && user !== undefined){
    fetch(`${basePath}/users/${user._id}`)
            .then(data => data.json())
            .then(response => {
                const image = document.querySelector('#avatar-output img');
                image.src ='img/avatar-' + response.avatar.id + '.jpg';
                image.setAttribute('id', response.avatar.id);
            
            })
}
else{
    window.location.href = '/login.html';
}


    