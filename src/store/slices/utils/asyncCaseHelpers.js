import { createAsyncThunk } from '@reduxjs/toolkit';

/**
 * De-duplication helpers for the async-thunk boilerplate shared across slices.
 *
 * These helpers ONLY factor out the copy-pasted try/catch/rejectWithValue
 * wrapper and the mechanical wiring of pending/fulfilled/rejected cases.
 * They do NOT impose any state shape or error convention — every behavioural
 * decision (what value the thunk resolves to, which state fields a handler
 * mutates, whether `error` stores `action.payload` vs `action.payload?.message`)
 * stays in the calling slice.
 */

/**
 * Create an async thunk that reproduces the standard slice body:
 *
 *   try {
 *     return await serviceCall(arg, thunkAPI);
 *   } catch (error) {
 *     return rejectWithValue(error.response?.data || { message: fallbackMessage });
 *   }
 *
 * `serviceCall` receives the thunk argument and the full thunkAPI, and is
 * responsible for returning the exact value the original inline thunk returned
 * (e.g. `response.data`, or `{ id, ...response.data }`). This keeps the resolved
 * payload identical to the hand-written version.
 *
 * @param {string} typePrefix - The action type prefix (unchanged per slice).
 * @param {(arg: any, thunkAPI: object) => Promise<any>} serviceCall - Returns the resolved value.
 * @param {string} fallbackMessage - Message used when the error has no response body.
 * @returns {import('@reduxjs/toolkit').AsyncThunk}
 */
export const makeAsyncThunk = (typePrefix, serviceCall, fallbackMessage) =>
  createAsyncThunk(typePrefix, async (arg, thunkAPI) => {
    try {
      return await serviceCall(arg, thunkAPI);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: fallbackMessage }
      );
    }
  });

/**
 * Attach pending/fulfilled/rejected cases for a thunk to an extraReducers builder.
 *
 * Each handler is optional and, when provided, is passed straight through to
 * `builder.addCase` untouched — so the exact reducer behaviour (which fields are
 * set, and to what) is defined entirely by the caller. Returns the builder to
 * allow chaining, matching the native `builder.addCase(...).addCase(...)` style.
 *
 * @param {import('@reduxjs/toolkit').ActionReducerMapBuilder} builder
 * @param {import('@reduxjs/toolkit').AsyncThunk} thunk
 * @param {{ onPending?: Function, onFulfilled?: Function, onRejected?: Function }} handlers
 * @returns {import('@reduxjs/toolkit').ActionReducerMapBuilder} the same builder
 */
export const applyAsyncCases = (builder, thunk, { onPending, onFulfilled, onRejected } = {}) => {
  if (onPending) builder.addCase(thunk.pending, onPending);
  if (onFulfilled) builder.addCase(thunk.fulfilled, onFulfilled);
  if (onRejected) builder.addCase(thunk.rejected, onRejected);
  return builder;
};

/**
 * Convenience factories for the two most common pending/rejected handlers, so
 * slices don't repeat the identical `state.isLoading = true; state.error = null`
 * bodies. These are opt-in — slices whose handlers differ keep their own inline
 * functions.
 */

/** Standard pending: set loading true, clear error. */
export const setPending = (state) => {
  state.isLoading = true;
  state.error = null;
};

/** Standard pending that also clears a `success` flag. */
export const setPendingWithSuccess = (state) => {
  state.isLoading = true;
  state.error = null;
  state.success = false;
};

/**
 * Rejected handler storing the raw `action.payload` in `state.error`.
 * (Matches slices like bookSlice / campusSlice / formSlice.)
 */
export const setRejectedPayload = (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
};

/**
 * Rejected handler storing `action.payload?.message`, with a fallback string.
 * (Matches slices like eventSlice / courseSlice.)
 */
export const makeSetRejectedMessage = (fallbackMessage) => (state, action) => {
  state.isLoading = false;
  state.error = action.payload?.message || fallbackMessage;
};
