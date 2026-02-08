import { Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { IAuthAPI } from "./api/auth/IAuthAPI";
import { AuthAPI } from "./api/auth/AuthAPI";
import { UserAPI } from "./api/users/UserAPI";
import { IUserAPI } from "./api/users/IUserAPI";
import { ProtectedRoute } from "./components/protected_route/ProtectedRoute";
import { PlantAPI } from "./api/plants/PlantAPI";
import { IPlantAPI } from "./api/plants/IPlantAPI";
import { ProcessingAPI } from "./api/processing/ProcessingAPI";
import { IProcessingAPI } from "./api/processing/IProcessingAPI";
import { StorageAPI } from "./api/storage/StorageAPI";
import { IStorageAPI } from "./api/storage/IStorageAPI";

const auth_api: IAuthAPI = new AuthAPI();
const user_api: IUserAPI = new UserAPI();
const plant_api: IPlantAPI = new PlantAPI();
const processing_api: IProcessingAPI = new ProcessingAPI();
const storage_api: IStorageAPI = new StorageAPI();

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="admin,seller">
              <DashboardPage userAPI={user_api} plantAPI={plant_api} processingAPI={processing_api} storageAPI={storage_api} />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<AuthPage authAPI={auth_api} />} />
      </Routes>
    </>
  );
}

export default App;
