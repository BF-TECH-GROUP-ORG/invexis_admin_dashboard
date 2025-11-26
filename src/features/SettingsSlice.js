import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tables: {
    // example structure:
    // companies: { page: 0, rowsPerPage: 5, filters: {} }
  },
  // other global settings can go here
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setTablePagination(state, action) {
      const { tableId, page, rowsPerPage } = action.payload;
      state.tables[tableId] = state.tables[tableId] || {};
      if (page !== undefined) state.tables[tableId].page = page;
      if (rowsPerPage !== undefined)
        state.tables[tableId].rowsPerPage = rowsPerPage;
    },
    setTableFilters(state, action) {
      const { tableId, filters } = action.payload;
      state.tables[tableId] = state.tables[tableId] || {};
      state.tables[tableId].filters = filters;
    },
    resetTable(state, action) {
      const { tableId } = action.payload;
      if (state.tables[tableId]) delete state.tables[tableId];
    },
  },
});

export const { setTablePagination, setTableFilters, resetTable } =
  settingsSlice.actions;
export default settingsSlice.reducer;
