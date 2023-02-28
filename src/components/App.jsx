import React, { useState } from 'react';
import TextToSpeech from './TextToSpeech';
import '../App.css';

function App() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);

  return (
    <div className="app-container">
      <h1 className="app-title">Text to Speech</h1>
      <TextToSpeech text={text} voice={voice} rate={rate} pitch={pitch} />
    </div>
  );
}

export default App;
