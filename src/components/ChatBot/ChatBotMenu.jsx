import { useState } from 'react';

import {
  Webchat,
  WebchatProvider,
  Fab,
  getClient,
} from '@botpress/webchat';

const clientId = "e12ff3c5-50f0-4a6f-977b-32b78989e9a1";

const configuration = {
  color: '#000',
};

export default function App() {
  const client = getClient({
    clientId,
  });

  const [isWebchatOpen, setIsWebchatOpen] = useState(false);

  const toggleWebchat = () => {
    setIsWebchatOpen((prevState) => !prevState);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <WebchatProvider client={client} configuration={configuration}>
        <Fab onClick={toggleWebchat} />
        <div
          style={{
            display: isWebchatOpen ? 'block' : 'none',
          }}
        >
          <Webchat />
        </div>
      </WebchatProvider>
    </div>
  );
}
