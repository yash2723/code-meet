import React , {useState , useRef , useEffect} from 'react';
import Actions from '../Actions';
import {Client} from '../Components/Client';
import {Editor} from '../Components/Editor';
import { initSocket } from '../socket';
import { initVideo } from '../script';
import {Navigate, useLocation , useNavigate , useParams} from 'react-router-dom';
import toast from 'react-hot-toast';
import {Peer} from 'peerjs';

export const EditorPage = () => {

  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const {roomId} = useParams();
  const [clients , setClients] = useState([
    {
      socketId : 1,
      username : "Yash"
    },
    {
      socketId : 2,
      username : "Preyash"
    }
  ]);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      // await initVideo(roomId , socketRef.current);
      socketRef.current.on("connect_error" , (err) => handleErrors(err));
      socketRef.current.on("connect_failed" , (err) => handleErrors(err));

      function handleErrors(err) {
        console.log("Socket Error" , err);
        toast.error("Socket Connection failed, try again later.");
        reactNavigator('/');
      }

      socketRef.current.emit(Actions.JOIN , {
        roomId,
        username : location.state?.username,
      });

      socketRef.current.on(Actions.JOINED , ({clients , username , socketId}) => {
        if(username !== location.state?.username) {
          toast.success(`${username} joined the room.`);
        }
        setClients(clients);

        socketRef.current.emit(Actions.SYNC_CODE , {
          code : codeRef.current,
          socketId
        });
      });

      socketRef.current.on(Actions.DISCONNECTED , ({socketId , username}) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter(client => client.socketId !== socketId)
        })
      })


      // ----------
      const ROOM_ID = roomId;
      const videoGrid = document.getElementById('clientsList')
      const myPeer = new Peer(undefined, {
        host: 'https://peer-js-27.herokuapp.com/',
        secure: true,
        // path: 'peerjs',
        // port: '9746'
      })
      const myVideo = document.createElement('video')
      // myVideo.muted = true
      const peers = {}
      navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      }).then(stream => {
        addVideoStream(myVideo, stream)

        myPeer.on('call', call => {
          console.log("Call is made");
          call.answer(stream)
          const video = document.createElement('video');
          call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
          })
        })
        socketRef.current.emit('ready');

        socketRef.current.on('user-connected', userId => {
          connectToNewUser(userId, stream)
        })
      })

      socketRef.current.on('user-disconnected', userId => {
        if (peers[userId]) peers[userId].close()
      })

      myPeer.on('open', id => {
        socketRef.current.emit('video-join-room', ROOM_ID, id)
      })

      function connectToNewUser(userId, stream) {
        console.log("New user joined.");
        const call = myPeer.call(userId, stream)
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
        call.on('close', () => {
          video.remove()
        })

        peers[userId] = call
      }

      function addVideoStream(video, stream) {
        video.srcObject = stream
        video.addEventListener('loadedmetadata', () => {
          video.play()
        })
        videoGrid.append(video)
      }
      // ----------

    };
    init();

    return () => {
      socketRef.current.disconnect();
      socketRef.current.off(Actions.JOINED);
      socketRef.current.off(Actions.DISCONNECTED);
    }

  },[]);

  if(!location.state) {
    return <Navigate to="/" />
  }

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied successfully.");
    }
    catch(err) {
      toast.error("Room Id could not be copied successfully.")
    }
  }

  function leaveRoom() {
    reactNavigator('/');
  }

  return (
    <div className="editor-container">
      <div className="editor-left">
        <div className="editor-left-inner">
          <div className="logo">
            <img className="logoImage" src="/images/code-meet-logo-transparent.png" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList" id='clientsList'>
            {/* {
              clients.map((client) => (
                <Client key={client.socketId} username={client.username} />
              ))
            } */}
          </div>
        </div>
        <button className='btn copyBtn' onClick={copyRoomId}>Copy Room ID</button>
        <button className='btn leaveBtn' onClick={leaveRoom}>Leave</button>
      </div>
      <div className="editor-right">
        <Editor socketRef={socketRef} roomId={roomId} onCodeChange={((code) => {codeRef.current = code})} />
      </div>
    </div>
  )
}
