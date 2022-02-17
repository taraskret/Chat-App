
const socket = io() 
///Elements
const $messageForm = document.querySelector('#message');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');

const $sendLocationButton = document.querySelector('#send-location');

const $messages = document.querySelector('#messages')
//const $locations = document.querySelector('#locations')

//Templates
const messageTamplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    //new mwssage element
    const $lastMessage = $messages.lastElementChild

    //height of the last message
    const lastMessageStyles = getComputedStyle($lastMessage)
    const lastMessageMargin = parseInt(lastMessageStyles.marginBottom)
    const lastMessageHight = $lastMessage.offsetHeight + lastMessageMargin

    //visible hight
    const visibleHeight = $messages.offsetHeight

    // hight of messages container
    const containerHeight = $messages.scrollHeight

    //how far have I scroll
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - lastMessageHight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (message)=>{
    const html = Mustache.render(messageTamplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('LT')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})

socket.on('locationMessage', (mess)=>{
    
    const html = Mustache.render(locationTemplate, {
        username: mess.username,
        url: mess.url,
        createdAt: moment(message.createdAt).format('LT')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('roomData', ({room, users}) => {
    console.log(users);
    const html = Mustache.render(sidebarTemplate, {
        room, 
        users
    })
    document.querySelector('#sidebar').innerHTML = html
 } )

 $messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    ///DISABLE BUtton
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error)=>{

        //Enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            console.log(error); 
        }
        console.log('Massege  delivered!!!');
    })
})



$sendLocationButton.addEventListener('click', ()=>{

    
    if(!navigator.geolocation){
        return alert('geolocationis not suported by browser')
    }
    //disable
    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
       const lat =  position.coords.latitude;
       const lon = position.coords.longitude

       const sendLocation = {
           latitude: lat,
           longitude: lon
       } 
       socket.emit('sendLocation', sendLocation, ()=>{
        console.log('location shered');
    
    $sendLocationButton.removeAttribute('disabled')
   })
    })
});

socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
} )

