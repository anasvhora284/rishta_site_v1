import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Profile } from '@/types/profile'
import type { BrowseFilterCriteria } from '@/utils/browseFilters'

interface FilterState {
  filteredData: Profile[]
  criteria: BrowseFilterCriteria | null
}

const initialState: FilterState = {
  filteredData: [],
  criteria: null,
}

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setFilteredData: (state, action: PayloadAction<Profile[]>) => {
      state.filteredData = action.payload
    },
    setBrowseFilters: (
      state,
      action: PayloadAction<{ criteria: BrowseFilterCriteria; results: Profile[] }>,
    ) => {
      state.criteria = action.payload.criteria
      state.filteredData = action.payload.results
    },
  },
})

export const { setFilteredData, setBrowseFilters } = filterSlice.actions
export default filterSlice.reducer
