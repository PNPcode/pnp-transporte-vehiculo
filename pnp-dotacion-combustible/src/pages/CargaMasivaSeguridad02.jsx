import { useLocation } from "react-router-dom";

const CargaMasivaSeguridad02 = () => {
  const location = useLocation();
  const cabecera = location.state?.value;

  return (
    <label className="flex flex-col gap-2 mb-4">
      <span className="font-normal">CARGA MASIVA SEGURIDAD 02 </span>
      <input
        className="w-full py-3 px-2 rounded-lg bg-slate-400"
        type="text"
        placeholder="saludo de datos ..."
      />
    </label>
  );
};

export default CargaMasivaSeguridad02;
