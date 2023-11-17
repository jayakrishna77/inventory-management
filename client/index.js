import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './src/App/App';

const Main = () => {
    return (
       <App />
    )
}

const reactElement = document.getElementById('root');
const root = ReactDOM.createRoot(reactElement);

root.render(<Main />);