import React from 'react';
import { FiMoon, FiSun, FiRefreshCcw } from 'react-icons/fi';
import { RiArrowGoBackLine, RiChat4Line, RiChatOffLine } from 'react-icons/ri';
import { useState, useEffect, useRef } from 'react';

import 'bootstrap/dist/js/bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import './App.css';

const randomWords = require('random-words');
const themes = {
  light: {
    bg: '#ffffff',
    //base, current, correct, incorrect, text
    colors: ['#24292e', '#005cc5', '#22863a', '#d73a49', '#24292e']
  },
  dark: {
    bg: '#121212',
    //base, current, correct, incorrect, text
    colors: ['#898989', '#fd971f', '#a6e22e', '#f92672', '#f8f8f2']
  }
}

function App() {
  const [tiptap, setTipTap] = useState({
    'words': [],
  });
  const [conf, setConf] = useState({
    'theme'  : 'dark',
    'prompt' : false,
  });
  const [menu, setMenu] = useState(false);
  const userInputRef = useRef(null);

  const useMountEffect = (f) => useEffect(f, []);
  useMountEffect(() => newGame(50));

  function colWord(w, i) {
    return <span className="m-1" key={i} style={{ color: themes[conf['theme']]['colors'][tiptap.stat[i]], fontSize: '1.6em', fontWeight: '450' }}>{w}</span>
  }

  function newGame(len) {
    let tt = {...tiptap};
    tt.rm    = false;
    tt.len   = len;
    tt.words = randomWords(len);

    tt.start = 0;
    tt.end   = 0;
    tt.stat = Array(tt.len).fill(0);
    tt.ptr   = 0;
    tt.wpm   = 'xx';
    tt.acc   = 'xx';
    tt.ch    = 0;
    tt.wc    = 0;

    tt.stat[0] = 1;
    setTipTap(tt);
  }

  function handleKeyDown(e) {
    if (!tiptap.start) {
      setTipTap({...tiptap, start: new Date()});
    }
    if (e.keyCode === 32) {
      let tt = {...tiptap};
      if (tt.end < 1) {
        e.preventDefault();
        e.stopPropagation();
        if (tt.words[tt.ptr] === userInputRef.current.value) {
          tt = setWordCorrect(tt);
        } else {
          tt = setWordIncorrect(tt);
        }
        if (tt.ptr >= tt.len) {
          tt.end = 1;
        } else {
          tt.stat[tt.ptr] = 1;
        }
        userInputRef.current.value = "";
      }
      setTipTap(tt);
    } else if (tiptap.ptr === (tiptap.len - 1)) {
      if (tiptap.words[tiptap.ptr] === userInputRef.current.value.concat(e.key)) {
        let tt = {...tiptap};
        tt = setWordCorrect(tt);
        tt.end = 1;
        setTipTap(tt);
        userInputRef.current.value = "";
      }
    }
  }

  function handleKeyUp(e) {
    if (tiptap.end === 1) {
      userInputRef.current.value = "";
    }
  }

  function setWordCorrect(tt) {
    tt.stat[tt.ptr] = 2;
    tt.wc = tt.wc + 1;
    tt.ch = tt.ch + userInputRef.current.value.length + 1;
    tt.ptr = tt.ptr + 1;
    tt.wpm = Math.ceil(tt.ch*12/((new Date()-tt.start)/1000));
    tt.acc = ((tt.wc/tt.ptr)*100).toFixed(2) + "%";
    return tt;
  }

  function setWordIncorrect(tt) {
    tt.stat[tt.ptr] = 3;
    tt.ch = tt.ch + userInputRef.current.value.length + 1;
    tt.ptr = tt.ptr + 1;
    tt.wpm = Math.ceil(tt.ch*12/((new Date()-tt.start)/1000));
    tt.acc = ((tt.wc/tt.ptr)*100).toFixed(2) + "%";
    return tt;
  }

  function nextTheme() {
    if (conf['theme'] === 'dark') {
      setConf({...conf, theme: 'light'});
    } else if (conf['theme'] === 'light') {
      setConf({...conf, theme: 'dark'});
    }
  }

  let inputStyle = {
    background: 'transparent',
    zIndex: '2',
    padding: '0px',
    caretColor: themes[conf['theme']]['colors'][1],
    color: themes[conf['theme']]['colors'][1],
    fontSize: '2.5em',
    height: '1.5em'
  }

  console.log(tiptap);
  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center" style={{ backgroundColor: themes[conf['theme']]['bg'] }}>
      <div className="container">
        <div style={{ color: themes[conf['theme']]['colors'][4] }}>
          <div className="d-flex justify-content-between" style={{ marginBottom: '2em' }}>
            <div>
              <h1>Tip<span style={{ color: themes[conf['theme']]['colors'][1] }}>Tap</span></h1>
            </div>
            <div>
              <button onClick={ (e) => setConf({...conf, prompt: ~conf['prompt']}) } className="px-2 h-100 btn" style={{ color: themes[conf['theme']]['colors'][4], backgroundColor: 'transparent' }}>
                { conf['prompt'] ? <RiChat4Line size={32} /> : <RiChatOffLine size={32} /> }
              </button>
              <button onClick={ (e) => nextTheme() } className="px-2 h-100 btn" style={{ color: themes[conf['theme']]['colors'][4], backgroundColor: 'transparent' }}>
                { conf['theme'] === 'dark' ? <FiMoon size={32} /> : <FiSun size={32} /> }
              </button>
            </div>
          </div>
          <div className="d-flex justify-content-between">
            <div>
              <ul className="list-inline">
                <li className="list-inline-item"><span style={{ fontSize: '1.5em' }}>WPM: { tiptap.wpm }</span></li>
                <li className="list-inline-item"><span style={{ fontSize: '1.5em' }}>ACC: { tiptap.acc }</span></li>
              </ul>
            </div>
            <div>
              <ul className="list-inline">
                <li className={`list-inline-item ${ tiptap.len === 10 ? 'border-bottom' : '' }`} style={{ borderColor: themes[conf['theme']]['colors'][4] }}>
                  <button onClick={(e) => newGame(10)} className="btn" style={{ color: themes[conf['theme']]['colors'][4], fontSize: '1.5em' }}>10</button>
                </li>
                <li className="list-inline-item" style={{ borderBottom: `${ tiptap.len === 25 ? '2px solid ' + themes[conf['theme']]['colors'][4] : ''}` }}>
                  <button onClick={(e) => newGame(25)} className="btn" style={{ color: themes[conf['theme']]['colors'][4], fontSize: '1.5em' }}>25</button>
                </li>
                <li className="list-inline-item" style={{ borderBottom: `${ tiptap.len === 50 ? '2px solid ' + themes[conf['theme']]['colors'][4] : ''}` }}>
                  <button onClick={(e) => newGame(50)} className="btn" style={{ color: themes[conf['theme']]['colors'][4], fontSize: '1.5em' }}>50</button>
                </li>
                <li className="list-inline-item" style={{ borderBottom: `${ tiptap.len === 100 ? '2px solid ' + themes[conf['theme']]['colors'][4] : ''}` }}>
                  <button onClick={(e) => newGame(100)} className="btn" style={{ color: themes[conf['theme']]['colors'][4], fontSize: '1.5em' }}>100</button>
                </li>
                <li className="list-inline-item" style={{ borderBottom: `${ tiptap.len === 250 ? '2px solid ' + themes[conf['theme']]['colors'][4] : ''}` }}>
                  <button onClick={(e) => newGame(250)} className="btn" style={{ color: themes[conf['theme']]['colors'][4], fontSize: '1.5em' }}>250</button>
                </li>
                <li className="list-inline-item" style={{ borderBottom: `${ tiptap.len === 500 ? '2px solid ' + themes[conf['theme']]['colors'][4] : ''}` }}>
                  <button onClick={(e) => newGame(500)} className="btn" style={{ color: themes[conf['theme']]['colors'][4], fontSize: '1.5em' }}>500</button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="d-flex flex-wrap" style={{ marginBottom: '1em' }}>
        {
          tiptap.words.map((w, i) =>
            colWord(w, i)
          )
        }
        </div>
        <div className="w-100 d-flex d-row" style={{ borderBottom: '2px solid ' + themes[conf['theme']]['colors'][4] }}>
          { conf['prompt'] ? <div className="d-flex" style={{ position: 'absolute', zIndex: '1', color: themes[conf['theme']]['colors'][0], fontSize: '2.5em', height: '1.5em' }}>
            {tiptap.words.slice(tiptap.ptr, tiptap.ptr+2).map((w, i) => ` ${w}`)}
          </div> : <div />}
          <div className="w-100 d-flex flex-row">
            <input
              className="flex-grow-1"
              onKeyDown={ (e) => handleKeyDown(e) }
              onKeyUp={ (e) => handleKeyUp() }
              ref={ userInputRef }
              style={ inputStyle }
              disabled={ tiptap.end ? 'disabled' : '' }
            />
            <button onClick={(e) => newGame(tiptap.len)} className="btn" style={{ background: 'transparent', border: '0px', color: themes[conf['theme']]['colors'][1] }}><FiRefreshCcw size={32} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
