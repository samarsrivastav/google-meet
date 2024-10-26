import { useEffect, useState } from "react"


export const Receiver = () => {
  const [play, setPlay] = useState(false)
  const [vid, setVid] = useState<HTMLVideoElement>()
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8080');
    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'identify-as-reciever'
      }));
    }
    startReceiving(socket);
  }, []);

  function startReceiving(socket: WebSocket) {
    const video = document.createElement('video');
    document.body.appendChild(video);

    const pc = new RTCPeerConnection();
    pc.ontrack = (event) => {
      video.srcObject = new MediaStream([event.track]);
      // video.play();
      setVid(video)
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'createOffer') {
        pc.setRemoteDescription(message.sdp).then(() => {
          pc.createAnswer().then((answer) => {
            pc.setLocalDescription(answer);
            socket.send(JSON.stringify({
              type: 'createAnswer',
              sdp: answer
            }));
          });
        });
      } else if (message.type === 'iceCandidate') {
        pc.addIceCandidate(message.candidate);
      }
    }
  }

  return <div>
    <button onClick={() => vid?.play()}>play</button>
  </div>
}