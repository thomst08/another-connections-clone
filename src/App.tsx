import './index.css';
import './app.scss';
import { Board } from './game/Board';

const year = new Date().getFullYear();
const month = new Date().getMonth() + 1;
const day = new Date().getDate();

function App() {
  return (
    <>
      <Board dateData={{ day, month, year }} />
    </>
  )
}

export default App
