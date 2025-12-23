class AudioProcessor extends AudioWorkletProcessor {
    process(inputs) {
      const input = inputs[0][0];
  
      if (input) {
        const pcm = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          pcm[i] = Math.max(-1, Math.min(1, input[i])) * 0x7fff;
        }
        this.port.postMessage(pcm.buffer);
      }
  
      return true;
    }
  }
  
  registerProcessor("audio-processor", AudioProcessor);
  