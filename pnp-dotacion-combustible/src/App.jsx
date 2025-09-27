import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Menu from "./components/Menu";
import RegistroGrupoBien01 from "./pages/RegistroGrupoBien01";
import CargaMasivaPolicial02 from "./pages/CargaMasivaPolicial02";
import CargaMasivaSeguridad02 from "./pages/CargaMasivaSeguridad02";
import CrudVehiculoPolicial03 from "./pages/CrudVehiculoPolicial03";
import CrudVehiculoSeguridad03 from "./pages/CrudVehiculoSeguridad03";
import PrivateRoute from "./context/PrivateRoute";
import { useData } from "./context/DataProvider";

export default function App() {
  const { data } = useData();

  const componentsMap = {
    RegistroGrupoBien01,
    CargaMasivaPolicial02,
    CargaMasivaSeguridad02,
    CrudVehiculoPolicial03,
    CrudVehiculoSeguridad03,
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/menu/*"
          element={
            <PrivateRoute>
              <Menu />
            </PrivateRoute>
          }
        >
          {data
            .filter((val) => val.split("|")[2] != "")
            .map((row) => {
              const [path, _, componentName] = row.split("|");
              const Component = componentsMap[componentName];
              return (
                <Route
                  key={path}
                  path={`${path}-repo`}
                  element={<Component />}
                />
              );
            })}
        </Route>
        <Route />
      </Routes>
    </Router>
  );
}
