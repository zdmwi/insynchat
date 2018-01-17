var socket;

// handle joining private chatrooms and choosing usernames
var $loginForm  = $('#login-form');
$loginForm.on('submit', handleLogin);

// setup the toggle for displaying the chat list
var $chatListToggle  = $('#chatroomListToggle');
var $chatListContainer = $('#chatroomUserListContainer');
$chatListToggle.on('click', toggleChatList);

var $userListCount = $('#userListTotal');
var $userList = $('#userList');

// handle sending messages
var $form = $('#message-form');
var $message = $form.find('input[name=message]');
$form.on('submit', handleSubmission);

function handleLogin(e) {
    var $username = $loginForm.find('input[name=username]');
    var $chatroom  = $loginForm.find('input[name=chatroom]');
    var username = $username.val();
    var chatroom = $chatroom.val();
    var $loginScreen = $('#login-screen');

    function validate(inputItem, helpTextId) {
        if (inputItem.val() == '') {
            var $helpText = $loginForm.find(helpTextId);
            if (!inputItem.hasClass('is-invalid')) { 
                inputItem.addClass('is-invalid');
                $helpText.addClass('invalid-feedback');
                $helpText.removeClass('text-muted');
            }
            inputItem.focus();
            return false;
        } else {
            return true;
        }
    }

    function joinRoom() {
        // setup the user's socket
        socket = io();
        socket.emit('joinRoom', {
            chatroom: $chatroom.val(),
            username: $username.val()  
        });
        // setup event listener's on the socket
        socket.on('message', sendMessage);
        socket.on('systemMsg', sendSystemMessage);
        socket.emit('systemMsg');
        socket.on('requesttodraw', setupCanvas);
        socket.on('drawing', draw);
        socket.on('putpoint', draw);
        socket.on('uploadimg', uploadImage);
        socket.on('updateRoom', updateChatUI);
    }

    function leaveRoom() {
        socket.emit('leaveRoom', {
            chatroom: chatroom,
            username: username
        });
    }

    function createChatroom() {
        $('#chatroomLabel').html(`${$chatroom.val()}`);
        $loginScreen.remove();
        $('#chatroom-screen').fadeIn(500, () => {
            $('#chat-message-input').focus();
        });
    }

    e.preventDefault();
    var isUsernameSupplied = validate($username, '#usernameHelpText');
    var isChatroomSupplied = validate($chatroom, '#chatroomHelpText');
    if(isUsernameSupplied && isChatroomSupplied){
        // remove event listeners and prevent continuous submission
        $loginForm.off();
        $loginForm.attr('disabled', 'disabled');
        joinRoom();
        $loginScreen.fadeOut(500, createChatroom);
    }
}

function updateChatUI(data) {
    // userCount, userList, userListColor
    $userListCount.html(data.userCount);
    var newList = '';
    for (var i=0; i<data.userCount; i++) {
        newList += `<li class="text-center" style="list-style: none;">
                        <strong style="color: ${data.userListColor[i]};">
                            ${data.userList[i]}
                        </strong>
                    </li>`
    }
    $userList.html(newList);
}

function toggleChatList(e) {

    $chatListContainer.animate({
        height: 'toggle',
    }, 300);
}

function sendMessage(message) {
	var momentTimestamp = moment.utc(message.timestamp);
	var $messages = $('.messages');
    
	console.log(`${message.username}: ${message.text}`);

    $messages.append(`<div class="message-container">
                        <p>
                            <strong style="color: ${message.usernameColor} !important; margin-right: 3px;">
                                ${message.username}
                            </strong> 
                                ${message.text} 
                            <small>@ 
                                ${momentTimestamp.local().format("h:mm A")}
                            </small>
                        </p>
                    </div>`);
	// Force scroll to the bottom of the chat when a new message is added
	$("#chat").animate({ scrollTop: $("#chat")[0].scrollHeight}, 1000);
}

function sendSystemMessage(message) {
	var momentTimestamp = moment.utc(message.timestamp);
	var $messages = $('.messages');
	
	console.log(`${message.username} ${message.text}`);

    $messages.append(`<div class="message-container text-center">
                        <p>
                            <small>
                                ${momentTimestamp.local().format("h:mm A")}
                            </small><br>
                            <strong style="color: ${message.usernameColor} !important; margin-right: 3px;">
                                ${message.username}
                            </strong> 
                                ${message.text} 
                        </p>
                    </div>`);
	// Force scroll to the bottom of the chat when a new message is added
	$("#chat").animate({ scrollTop: $("#chat")[0].scrollHeight}, 1000);
}

function handleSubmission(e) {
    e.preventDefault();
	if ($message.val() !== '') {
		socket.emit('message', {
            text: $message.val(),
		});
        $message.val('');
	}
}

function setupCanvas() {
	if (!$('canvas').length) {
		$('.sync-window-watermark').toggle(); // hides the watermark for a blank space
        $('#canvas-settings').removeClass('force-hidden');
        syncArea.initCanvas();
		console.log('canvas created');
	} else {
        $('#canvas-settings').addClass('force-hidden');
		$('.sync-window-watermark').toggle(); // redisplays the watermark for a blank space
		syncArea.canvas.parentNode.removeChild(syncArea.canvas);
	}
}

function draw(data){
    var w = syncArea.canvas.width;
    var h = syncArea.canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.SETTINGS);
}

function uploadImage(data) {
	var img = new Image();
	img.onload = function () {
		syncArea.ctx.rect(0,0,syncWindow[0].clientWidth,syncWindow[0].clientHeight);
		syncArea.ctx.fillStyle = '#fff';
		syncArea.ctx.fill();
		syncArea.ctx.drawImage(img, 0, 0);
	}
	img.src = data.src;
}