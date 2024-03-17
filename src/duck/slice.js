import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    filteredData: [],
}

export const filterSlice = createSlice({
    name: 'filter',
    initialState,
    reducers: {
        setFilteredData: (state, action) => {
            state.filteredData = action.payload
        },
    },
})

// Action creators are generated for each case reducer function
export const { setFilteredData } = filterSlice.actions

export default filterSlice.reducer