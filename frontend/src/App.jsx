import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import AdmissionForm from './components/AdmissionForm';
import AcademicQualificationForm from './components/AcademicQualificationForm';
import PrintApplication from './components/PrintApplication';
import PDFMerger from './components/PDFMerger';
import NavigationBar from './components/NavigationBar';
import FormNavigation from './components/FormNavigation';
import Header from './components/Header';
import Payment from './components/Payment';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import EnclosuresForm from "./components/EnclosuresForm.jsx";

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {isAuthenticated && (
        <>
          <NavigationBar />
          <FormNavigation />
        </>
      )}
      <main className="py-6">
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={!isAuthenticated ? <Login /> : <Navigate to="/admission-form" />}
            />
            <Route
              path="/signup"
              element={!isAuthenticated ? <Signup /> : <Navigate to="/admission-form" />}
            />
            <Route
              path="/pdf-merger"
              element={<PDFMerger />}
            />

            {/* Protected Routes */}
            <Route
              path="/admission-form"
              element={isAuthenticated ? <AdmissionForm /> : <Navigate to="/login" />}
            />
            <Route
              path="/academic-details"
              element={isAuthenticated ? <AcademicQualificationForm /> : <Navigate to="/login" />}
            />
            <Route
              path="/payment"
              element={isAuthenticated ? <Payment /> : <Navigate to="/login" />}
            />
            <Route
              path="/print-application"
              element={isAuthenticated ? <PrintApplication /> : <Navigate to="/login" />}
            />
            <Route
              path="/enclosures"
              element={isAuthenticated ? <EnclosuresForm /> : <Navigate to="/login" />}
            />

            {/* Default Route */}
            <Route
              path="/"
              element={<Navigate to={isAuthenticated ? "/admission-form" : "/login"} />}
            />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App; 