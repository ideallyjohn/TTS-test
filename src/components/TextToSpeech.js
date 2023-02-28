import React, { useState, useEffect } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const TextToSpeech = () => {
  const [text, setText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [audioUrl, setAudioUrl] = useState(null);

  useEffect(() => {
    // Set up speech synthesis voices when component mounts
    const voices = window.speechSynthesis.getVoices();
    setVoices(voices);
    setSelectedVoice(voices[0]);
  }, []);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setText(e.target.result);
    };
    reader.readAsText(file);
  };

  

const handlePlayButtonClick = () => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = selectedVoice;
  utterance.rate = rate;
  utterance.pitch = pitch;

  // Create an array to store the audio data
  const audioData = [];

  // Listen for 'boundary' events and append the audio data to the array
  utterance.addEventListener('boundary', (event) => {
    audioData.push(event.target.audioData);
  });

  // Speak the utterance and set 'isPlaying' to true
  window.speechSynthesis.speak(utterance);
  setIsPlaying(true);

  // Listen for the 'end' event and create an audio blob and URL from the data
  utterance.addEventListener('end', async () => {
    const fileType =
      utterance.voice && utterance.voice.localService
        ? 'audio/ogg'
        : 'audio/wav';
    console.log('File type:', fileType);
    const blob = new Blob(audioData, { type: 'audio/ogg' });

    // Convert the audio file format using ffmpeg.wasm
    const ffmpeg = createFFmpeg({
      log: true,
      corePath: '/@ffmpeg/core/dist/ffmpeg-core.js',
      wasmPath: '/@ffmpeg/core/dist/ffmpeg-core.wasm',
    });
    await ffmpeg.load();
    ffmpeg.FS('writeFile', 'input.ogg', await fetchFile(blob));
    await ffmpeg.run('-i', 'input.ogg', '-acodec', 'copy', 'output.wav');
    const outputData = ffmpeg.FS('readFile', 'output.wav');
    const outputBlob = new Blob([outputData.buffer], { type: 'audio/wav' });

    // Set the audio URL to the converted file
    const audioObjectUrl = URL.createObjectURL(outputBlob);
    setAudioUrl(audioObjectUrl);
  });
};


  const handleStopButtonClick = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handleVoiceSelectChange = (e) => {
    const voiceName = e.target.value;
    const voice = voices.find((v) => v.name === voiceName);
    setSelectedVoice(voice);
  };

  const handleRateInputChange = (e) => {
    setRate(e.target.value);
  };

  const handlePitchInputChange = (e) => {
    setPitch(e.target.value);
  };

  useEffect(() => {
    window.speechSynthesis.onvoiceschanged = () => {
      const voices = window.speechSynthesis.getVoices();
      setVoices(voices);
      setSelectedVoice(voices[0]);
    };
  }, []);

  return (
    <div className="text-to-speech">
      <textarea
        className="text-to-speech__textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="text-to-speech__controls">
        <div className="text-to-speech__voice-select">
          <select onChange={handleVoiceSelectChange}>
            <option value="">Select a voice</option>
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {`${voice.name} (${voice.lang})`}
              </option>
            ))}
          </select>
        </div>
        <div className="text-to-speech__rate-input">
          <label htmlFor="rate">Rate:</label>
          <input
            type="number"
            id="rate"
            min="0.1"
            max="10"
            step="0.1"
            value={rate}
            onChange={handleRateInputChange}
          />
        </div>
        <div className="text-to-speech__pitch-input">
          <label htmlFor="pitch">Pitch:</label>
          <input
            type="number"
            id="pitch"
            min="0.1"
            max="10"
            step="0.1"
            value={pitch}
            onChange={handlePitchInputChange}
          />
        </div>
        {isPlaying ? (
          <button
            className="text-to-speech__stop-button"
            onClick={handleStopButtonClick}
          >
            Stop
          </button>
        ) : (
          <button
            className="text-to-speech__play-button"
            onClick={handlePlayButtonClick}
          >
            Play
          </button>
        )}
      </div>
      <div className="text-to-speech__file-input">
        <label htmlFor="file">Load text from file:</label>
        <input
          type="file"
          id="file"
          accept=".txt"
          onChange={handleFileInputChange}
        />
      </div>      
      {audioUrl && (
        <button
          className="text-to-speech__replay-button"
          onClick={() => {
            const audio = new Audio(audioUrl);
            audio.play();
          }}
        >
          Replay
        </button>
      )}    
    </div>
  );
};

export default TextToSpeech;