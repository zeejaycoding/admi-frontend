import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer, { registerApiClientAuthHandlers } from './slices/authSlice';
import userReducer from './slices/userSlice';
import campusReducer from './slices/campusSlice';
import bookReducer from './slices/bookSlice';
import courseReducer from './slices/courseSlice';
import courseProgressReducer from './slices/courseProgressSlice';
import orderReducer from './slices/orderSlice';
import paymentReducer from './slices/paymentSlice';
import dashboardReducer from './slices/dashboardSlice';
import formReducer from './slices/formSlice';
import formSubmissionReducer from './slices/formSubmissionSlice';
import eventReducer from './slices/eventSlice';
import travelFormReducer from './slices/travelFormSlice';
import childDedicationReducer from './slices/childDedicationSlice';
import marriageCertificateReducer from './slices/marriageCertificateSlice';
import reportReducer from './slices/reportSlice';
import menuPermissionsReducer from './slices/menuPermissionsSlice';

const persistConfig = (key, whitelist) => ({
  key,
  storage,
  whitelist,
});

const childDedicationPersist = persistReducer(
  persistConfig('childDedication', ['dedications', 'selectedDedication']),
  childDedicationReducer,
);
const marriageCertificatePersist = persistReducer(
  persistConfig('marriageCertificate', ['certificates', 'selectedCertificate']),
  marriageCertificateReducer,
);
const travelFormPersist = persistReducer(
  persistConfig('travelForm', ['travelForms', 'selectedTravelForm', 'stats']),
  travelFormReducer,
);
const formSubmissionPersist = persistReducer(
  persistConfig('formSubmission', ['submissions']),
  formSubmissionReducer,
);

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    campus: campusReducer,
    book: bookReducer,
    course: courseReducer,
    courseProgress: courseProgressReducer,
    order: orderReducer,
    payment: paymentReducer,
    dashboard: dashboardReducer,
    form: formReducer,
    formSubmission: formSubmissionPersist,
    event: eventReducer,
    travelForm: travelFormPersist,
    childDedication: childDedicationPersist,
    marriageCertificate: marriageCertificatePersist,
    report: reportReducer,
    menuPermissions: menuPermissionsReducer,
  },
  middleware: (getDefault) => getDefault({ serializableCheck: false }),
  // SECURITY: Disable Redux DevTools in production to prevent state inspection
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// Wire axios refresh handlers to Redux store
registerApiClientAuthHandlers(store);

export default store;


