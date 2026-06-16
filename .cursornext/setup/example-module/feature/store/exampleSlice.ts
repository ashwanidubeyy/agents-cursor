import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { exampleService } from "@/features/example/services/example.service";
import type {
  ExampleFormValues,
  ExampleItem,
  ExampleState,
} from "@/features/example/types/example.types";

/**
 * Optional Redux Toolkit slice for the example feature.
 *
 * The generated `useExample` hook uses local state + the service so the page
 * works without Redux. To use this slice instead, register it in `@/store`:
 *
 *   import exampleReducer from "@/features/example/store/exampleSlice";
 *   reducer: { example: exampleReducer }
 *
 * then read it with the typed `useAppSelector((s) => s.example)`.
 */

const initialState: ExampleState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchExamples = createAsyncThunk("example/fetch", () =>
  exampleService.list()
);

export const createExample = createAsyncThunk(
  "example/create",
  (values: ExampleFormValues) => exampleService.create(values)
);

const exampleSlice = createSlice({
  name: "example",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExamples.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExamples.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchExamples.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message ?? "Failed to load";
      })
      .addCase(createExample.fulfilled, (state, action) => {
        state.items = [action.payload as ExampleItem, ...state.items];
      });
  },
});

export default exampleSlice.reducer;
