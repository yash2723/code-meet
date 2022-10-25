import React , {useState} from 'react';
import {v4} from 'uuid';
import toast from 'react-hot-toast';
import {useNavigate} from 'react-router-dom';

export const HomePage = () => {
  const navigate = useNavigate();
  const [roomId , setRoomId] = useState("");
  const [username , setUsername] = useState("");

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = v4();
    setRoomId(id);
    toast.success("Crated a new Room.");
    // document.querySelector(".inputBox").value = id;
  }

  const joinRoom = () => {
    if(!username || !roomId) {
        toast.error("Room Id and Username are required.");
        return;
    }
    navigate(`/editor/${roomId}` , {
        state : {
            username
        }
    });
  }

  const handleInputEnter = (e) => {
    if(e.code === "Enter") {
        joinRoom();
    }
  }

  return (
    <div className="home-container">
        <div className="form-container">
            <img src="/images/code-meet-logo-transparent.png" />
            <p className="label">
                Paste invitation Room ID
            </p>
            <div className='inputGroup'>
                <input type="text" className="inputBox" placeholder="Room ID" value={roomId} onChange={(e) => setRoomId(e.target.value)} onKeyUp={handleInputEnter} />
                <input type="text" className="inputBox" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} onKeyUp={handleInputEnter} />
                <button className="btn joinBtn" onClick={joinRoom}>Join</button>
                <span className="info">
                    If you don't have an invite then create &nbsp;
                    <a onClick={createNewRoom} href="" className="infoBtn"> new room </a>
                </span>
            </div>
        </div>
        <footer>
            <p> 
                Built with ❤️ by &nbsp; <a href=""> Yash Upadhyay </a>
            </p>
        </footer>
    </div>
  )
}
