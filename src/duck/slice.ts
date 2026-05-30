import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Profile } from '@/types/profile'

interface FilterState {
  filteredData: Profile[]
}

const initialState: FilterState = {
  filteredData: [],
}

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setFilteredData: (state, action: PayloadAction<Profile[]>) => {
      state.filteredData = action.payload
    },
  },
})

export const { setFilteredData } = filterSlice.actions
export default filterSlice.reducer
