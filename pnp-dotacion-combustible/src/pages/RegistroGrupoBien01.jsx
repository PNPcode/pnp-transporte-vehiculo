import { useState } from "react";
import { useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import CustomElement from "../components/CustomElement";

const RegistroGrupoBien01 = () => {
  const location = useLocation();
  const usuario = location.state?.value;

  const { data, loading, error } = useFetch("/Home/TraerListaGrupoBien");
  const [datasets, setDatasets] = useState({});

  const handleChange = (e) => {
    const { value, valor, campo } = e.target.dataset;
    setDatasets((prev) => ({
      ...prev,
      [campo]: { value, valor },
    }));
  };

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {informacion.map((datos, idx) => {
        const { data, metadata } = datos;
        const typeCode = Number(metadata?.[5] ?? 0);
        let maxLength = metadata?.[3] ? Number(metadata[3]) : 0;
        const isRequired = metadata?.[1] === "0";
        const isDisabled = metadata?.[8] === "1";
        maxLength = metadata?.[4] === "" ? maxLength : Number(metadata[4]);

        console.log("etiqueta: ", metadata[7], "tipo dato:", metadata[2]);

        return (
          <CustomElement
            key={idx}
            typeCode={typeCode}
            etiqueta={metadata[7] ?? ""}
            placeholder={metadata[7] ?? ""}
            {...(maxLength > 0 ? { maxLength } : {})}
            {...(isDisabled ? { disabled: true } : {})}
            {...(isRequired ? { required: true } : {})}
            {...(metadata?.[2] === "1" ? { tipoDato: "entero" } : {})}
            {...(metadata?.[2] === "2" ? { tipoDato: "decimal" } : {})}
            defaultValue={data}
            dataAttrs={{ value: data, valor: data, campo: metadata[0] }}
            onChange={handleChange}
          />
        );
      })}
    </div>
  );
};

export default RegistroGrupoBien01;
