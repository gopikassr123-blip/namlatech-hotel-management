
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/hotels';

// Fetch all hotels
export const fetchHotels = createAsyncThunk(
  'hotels/fetchHotels',
  async () => {
    const response = await axios.get(API_URL);
    return response.data.hotels;
  }
);

// Add a hotel
export const addHotel = createAsyncThunk(
  'hotels/addHotel',
  async (formData) => {
    const response = await axios.post(API_URL, formData);
    return response.data.hotel;
  }
);

// Update a hotel
export const updateHotel = createAsyncThunk(
  'hotels/updateHotel',
  async ({ id, formData }) => {
    const response = await axios.put(`${API_URL}/${id}`, formData);
    return response.data.hotel;
  }
);

// Delete a hotel
export const deleteHotel = createAsyncThunk(
  'hotels/deleteHotel',
  async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  }
);

const hotelsSlice = createSlice({
  name: 'hotels',
  initialState: {
    hotels: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addHotel.fulfilled, (state, action) => {
        state.hotels.unshift(action.payload);
      })
      .addCase(updateHotel.fulfilled, (state, action) => {
        const index = state.hotels.findIndex(
          (hotel) => hotel.id === action.payload.id
        );
        if (index !== -1) {
          state.hotels[index] = action.payload;
        }
      })
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.hotels = state.hotels.filter(
          (hotel) => hotel.id !== action.payload
        );
      });
  }
});

export default hotelsSlice.reducer;
