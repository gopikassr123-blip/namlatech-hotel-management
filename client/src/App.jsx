
import {
  BrowserRouter,
  Routes,
  Route
} from 'react-router-dom';

import HotelList from './pages/HotelList';
import HotelEdit from './pages/HotelEdit';
import HotelDetails from './pages/HotelDetails';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Hotel Listing Page */}
        <Route
          path="/"
          element={<HotelList />}
        />

        {/* Hotel Detail Page */}
        <Route
          path="/hotels/:id"
          element={<HotelDetails />}
        />

        {/* Hotel Edit Page */}
        <Route
          path="/hotels/:id/edit"
          element={<HotelEdit />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
