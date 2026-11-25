
import { configureStore } from '@reduxjs/toolkit';
import hotelsReducer from '../features/hotels/hotelsSlice';

const store = configureStore({
  reducer: {
    hotels: hotelsReducer
  }
});

export default store;
