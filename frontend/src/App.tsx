import './styles/global.css'
import Login from './components/Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Mensagem from './components/Mensagem';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/mensagem" element={<Mensagem/>} />
      </Routes>
  </Router>
  );
}

export default App
