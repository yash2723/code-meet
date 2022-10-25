import React , {useEffect, useState} from 'react';
// import Avatar from 'react-avatar';

export const Client = ({username}) => {
  const idName = username + Math.random()*10000;
  useEffect(() => {
    const videoContainer = document.getElementById(idName);
    const myVideo = document.createElement('video');
    myVideo.muted = true;
    function addVideoStream(video , stream) {
      video.srcObject = stream;
      video.addEventListener('loadedmetadata' , () => {
        video.play();
      })
      videoContainer.append(video);
    }
    navigator.mediaDevices.getUserMedia({
      // video: true,
      // audio: true
    }).then(stream => {
      addVideoStream(myVideo , stream);
    })
  }, []);

  return (
    <div className="client" id="client">
      {/* <Avatar name={username} size={50} round="10px" />  */}
      <div className='video-container' id={idName}>

      </div>
      <span className="username">{username}</span>
    </div>
  )
}
