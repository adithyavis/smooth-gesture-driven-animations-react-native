import Deck from './deck/Deck';
import { slides } from './slides';

export default function App() {
  return <Deck slides={slides} />;
}
