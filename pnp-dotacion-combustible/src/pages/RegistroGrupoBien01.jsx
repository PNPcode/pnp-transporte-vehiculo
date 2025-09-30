import { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import CustomElement from "../components/CustomElement";

const RegistroGrupoBien01 = () => {
  const location = useLocation();
  const usuario = location.state?.value;

  const { data, loading, error } = useFetch("/Home/TraerListaGrupoBien");
  const [datasets, setDatasets] = useState({});
  const elementosRef = useRef([]);

  if (loading) {
    return <div>Cargando datos...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (!data) {
    return <div>No hay datos disponibles</div>;
  }

  const handleChange = (e) => {
    const { value, valor, campo, item } = e.target.dataset;
    setDatasets((prev) => ({
      ...prev,
      [campo]: { value, valor, item },
    }));
  };

  const handleClick = () => {
    let hayErrores = false;
    elementosRef.current.forEach((wrapper) => {
      if (!wrapper) return;
      const input = wrapper.querySelector("input, select, textarea") || wrapper;
      if (!input) return;
      const isRequired = input?.dataset.required === "true" || input?.required;
      if (!isRequired) return;
      let value = input?.dataset.value ?? "";
      if (input.type === "checkbox" || input.type === "radio") {
        value = input.checked ? "1" : "";
      }
      if (input.multiple && typeof value === "string") {
        value = value
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v)
          .join(",");
      }
      const tieneError = !value || value.toString().trim() === "";
      if (tieneError) {
        hayErrores = true;
        wrapper.classList.add("border-2", "border-red-500", "rounded-md");
      } else {
        wrapper.classList.remove("border-2", "border-red-500", "rounded-md");
      }
    });
    if (hayErrores) {
      alert("Hay campos requeridos sin completar.");
    } else {
      alert("Todos los campos requeridos completos!");
    }
  };

  const preData = data?.[0]?.split("~") ?? [];
  const info = preData?.[0]?.split("|") ?? [];
  const infoMeta = preData?.[1]?.split("|") ?? [];

  const informacion = info.map((valor, idx) => ({
    data: valor,
    metadata: infoMeta[idx].split("*"),
  }));

  const listasData = data.slice(1);
  const mapaListas = listasData.reduce((acc, entry) => {
    const [itemKey, ...opciones] = entry.split("~");
    acc[itemKey] = opciones;
    return acc;
  }, {});

  // console.log("listasData151", metadata[9]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {informacion.map((datos, idx) => {
          const { data, metadata } = datos;
          const typeCode = Number(metadata?.[5] ?? 0);
          let maxLength = metadata?.[3] ? Number(metadata[3]) : 0;
          const isRequired = metadata?.[1] === "0";
          const isDisabled = metadata?.[8] === "1";
          maxLength = metadata?.[4] === "" ? maxLength : Number(metadata[4]);

          return (
            <CustomElement
              key={idx}
              ref={(el) => (elementosRef.current[idx] = el)}
              typeCode={typeCode}
              etiqueta={metadata[7] ?? ""}
              placeholder={metadata[7] ?? ""}
              {...(maxLength > 0 ? { maxLength } : {})}
              {...(isDisabled ? { disabled: true } : {})}
              {...(isRequired ? { required: true } : {})}
              {...(metadata?.[2] === "1" && typeCode === 101
                ? { tipoDato: "entero" }
                : {})}
              {...(metadata?.[2] === "2" && typeCode === 101
                ? { tipoDato: "decimal" }
                : {})}
              {...(typeCode === 111
                ? {
                    defaultValue:
                      mapaListas[metadata[6]]?.length > 0
                        ? datos.metadata[0]
                        : "",
                  }
                : typeCode === 151
                  ? { defaultValue: [], unaLinea: metadata[9] }
                  : { defaultValue: datos.data })}
              dataAttrs={{
                value: data,
                valor: data,
                campo: metadata[0],
                item: metadata[6],
              }}
              onChange={handleChange}
              {...(mapaListas[metadata[6]]
                ? { options: mapaListas[metadata[6]] }
                : {})}
            />
          );
        })}
      </div>
      <div className="mt-8 mb-2">
        <CustomElement typeCode={120} onClick={handleClick}>
          GUARDAR
        </CustomElement>
      </div>
    </>
  );
};

export default RegistroGrupoBien01;
