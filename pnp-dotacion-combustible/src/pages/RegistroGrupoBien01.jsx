import { useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import CustomElement from "../components/CustomElement";

const RegistroGrupoBien01 = () => {
  const location = useLocation();
  const usuario = location.state?.value;

  const { data, loading, error } = useFetch("/Home/TraerListaGrupoBien");

  if (loading) {
    return <div>Cargando datos...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (!data) {
    return <div>No hay datos disponibles</div>;
  }

  const preData = data?.[0]?.split("~") ?? [];
  const info = preData?.[0]?.split("|") ?? [];
  const infoMeta = preData?.[1]?.split("|") ?? [];

  const informacion = info.map((valor, idx) => ({
    data: valor,
    metadata: infoMeta[idx].split("*"),
  }));

  console.log("fusion:", informacion);

  console.log("posicion1:", informacion[15].data);
  console.log("posicion2:", informacion[15].metadata[3]);

  // console.log("USUARIO:", usuario);
  // console.log("info:", info);
  // console.log("infoMeta:", infoMeta);

  return (
    <label className="flex flex-col gap-2 mb-4">
      <span className="font-normal">REGISTRO GRUPO BIEN 01 DATOS </span>
      <input
        className="w-full py-3 px-2 rounded-lg bg-slate-400"
        type="text"
        placeholder="saludo de datos ..."
      />
      <CustomElement typeCode={101} placeholder="Escribe algo..." />
    </label>
  );
};

export default RegistroGrupoBien01;
