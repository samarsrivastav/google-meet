import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

let senderSocket:null| WebSocket = null;
let receiverSocket:null| WebSocket = null;

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data: any) {
    const message = JSON.parse(data);

    //identify as sender or reciever
    if(message.type==="identify-as-sender"){
        console.log("sender set")
        senderSocket=ws;
    }else if(message.type==="identify-as-reciever"){
        console.log("receiver set")
        receiverSocket=ws;
    }else if(message.type==="createOffer"){    //create offer
        receiverSocket?.send(
            JSON.stringify({type:"createOffer",sdp:message.sdp})
        )
        console.log("offer created")
    }else if(message.type==="createAnswer"){   //create answer
        senderSocket?.send(
            JSON.stringify({type:"createAnswer",sdp:message.sdp})
        )
        console.log("answer set")
    }else if(message.type==="iceCandidate"){        //ice candidate
        if(ws==senderSocket){
            receiverSocket?.send(
                JSON.stringify({type:"iceCandidate",candidate:message.candidate})
            )
        }   
        else if(ws==receiverSocket){
            senderSocket?.send(
                JSON.stringify({type:"iceCandidate",candidate:message.candidate})
            )
        }
    }
  });

});
