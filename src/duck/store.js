import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './slice'

export const store = configureStore({
    reducer: {
        filter: filterReducer,
    },
})