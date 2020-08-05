const socket = io();
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "443",
});

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", function (call) {
      call.answer(stream); // Answer the call with an A/V stream.
      const video = document.createElement("video");
      call.on("stream", function (userVideoStream) {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });

peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  videoGrid.append(video);
};

let text = document.getElementById("chat_message");

document.body.addEventListener("keydown", (e) => {
  if (e.which === 13 && text.value.length !== 0) {
    socket.emit("message", text.value);
    text.value = "";
  }
});

socket.on("create-message", (message) => {
  let li = document.createElement("li");
  li.innerHTML = `<b>user</b><br />${message}`;
  document.getElementById("message_list").append(li);
  scrollToBottom();
});

const scrollToBottom = () => {
  let d = document.getElementById("main__chat_window");
  d.scrollTop = d.scrollHeight;
};

//Mute our video

const muteUnmute = () => {
  if (!myVideoStream) return;
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    setMuteButton();
  }
};

const setMuteButton = () => {
  const html = `<i class"fas fa-microphone"></i>
    <span>Mute</span>`;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `<i class"unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>`;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const playStop = () => {
  if (!myVideoStream) return;
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    setStopVideo();
  }
};

const setStopVideo = () => {
  const html = `<i class"fas fa-video"></i>
      <span>Stop Video</span>`;
  document.querySelector(".main__video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `<i class"stop fas fa-video-slash"></i>
      <span>Play Video</span>`;
  document.querySelector(".main__video_button").innerHTML = html;
};
