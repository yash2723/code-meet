import React,{useEffect , useRef , useState} from 'react';
import useLocalStorage from './useLocalStorage';
import Codemirror from 'codemirror'; 
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/dracula.css';
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/htmlmixed/htmlmixed';
import Actions from '../Actions';

export const Editor = ({socketRef , roomId , onCodeChange}) => {
  const editorRef = useRef(null);
  const [userCode, setuserCode] = useLocalStorage('userCode', '')
  const [srcDoc, setSrcDoc] = useState('')

  useEffect(() => {
    function init() {
      editorRef.current = Codemirror.fromTextArea(document.getElementById("realTimeEditor") , {
        mode : {name:'javascript' , json:true},
        theme : 'dracula',
        autoCloseTags : true,
        autoCloseBrackets : true,
        lineNumbers : true
      });

      editorRef.current.on('change' , (instance , changes) => {
        // console.log("changes : " , changes);
        const {origin} = changes; 
        const code = instance.getValue();
        setuserCode(code);
        onCodeChange(code);
        // console.log(code);
        if(origin !== 'setValue') {
          socketRef.current.emit(Actions.CODE_CHANGE , {
            roomId,
            code
          });
        }
      });

    }
    init();
    // console.log(document.querySelector(".CodeMirror"));
  } , []);  

  useEffect(() => {
    if(socketRef.current) {
      socketRef.current.on(Actions.CODE_CHANGE , ({code}) => {
        if(code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
      socketRef.current.off(Actions.CODE_CHANGE);
    }

  } , [socketRef.current])
  

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSrcDoc(`
        ${userCode}
      `)
    }, 250)

    return () => clearTimeout(timeout)
  }, [userCode])

  function toggle() {
    const navMenuBtn = document.querySelector(".nav-menu-btn");
    const output = document.querySelector(".output-container");

    navMenuBtn.addEventListener("click", () => {
      console.log(navMenuBtn.innerHTML);
        if(navMenuBtn.innerHTML === "Output") {
          navMenuBtn.innerHTML = "Close";
            output.style.right = "0%";
        }
        else {
          navMenuBtn.innerHTML = "Output";
            output.style.right = "-62%";
        }
    });
  }

  return (
    <>
      <textarea id="realTimeEditor" value={userCode}></textarea>
      <div class="nav-menu-btn" onClick={toggle}>Output</div>
      <div className='output-container'>
        <p className='output-title'>Output</p>
        <div className='separator'></div>
        <div className="output-pane">
          <iframe
            srcDoc={srcDoc}
            title="output"
            sandbox="allow-scripts"
            frameBorder="0"
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </>
  )
}
