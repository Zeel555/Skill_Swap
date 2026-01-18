import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from './App.jsx';
import AppProviders from "./app/AppProviders";
import { store } from "./app/store";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Provider store={store}>
        <AppProviders>
          <App />
        </AppProviders>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>,
)
