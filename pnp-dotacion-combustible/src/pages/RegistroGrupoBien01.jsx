import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import useLazyFetch from "../hooks/useLazyFetch";
import useValidationFields from "../hooks/useValidationFields";
import CustomElement from "../components/CustomElement";

const RegistroGrupoBien01 = () => {
  const location = useLocation();
  const usuario = location.state?.value;
  const [datasets, setDatasets] = useState({});
  const elementosRef = useRef([]);
  const inputRef = useRef(null);
  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  const [tipoToast, setTipoToast] = useState("success");

  const { data, loading, error } = useFetch("/Home/TraerListaGrupoBien");
  const { runFetch } = useLazyFetch();

  const { handleClick, mensajeError, esValido, valoresCambiados } =
    useValidationFields(elementosRef);

  // INICIO DE CASOS ESPECIFICOS:
  // =============================================
  const [extraValue, setExtraValue] = useState("");
  // ==============================================

  useEffect(() => {
    const hidden100 = elementosRef.current.find(
      (el) => el?.type === "hidden" && el.dataset.value?.trim() !== "",
    );
    if (hidden100) {
      setIsEdit(true);
    }
  }, []);

  const handleBuscarClick = async () => {
    if (inputRef.current) {
      const valorParametro = inputRef.current.value;
      const result = await runFetch(
        `/Home/RecuperarRegGrupoBien?dato=${encodeURIComponent(valorParametro)}`,
        {
          method: "GET",
          headers: {
            Accept: "text/plain",
            "Content-Type": "text/plain",
          },
        },
      );

      const preData = result?.split("~") ?? [];
      const info = preData?.[0]?.split("|") ?? [];
      const infoMeta = preData?.[1]?.split("|") ?? [];

      if (
        !result ||
        result.trim() === "" ||
        !info.length ||
        info[0].trim() === ""
      ) {
        console.log("DATA RECUPERADA VACÍA");
        setDatasets({});
        setExtraValue("");
        elementosRef.current.forEach((el) => {
          if (!el) return;
          if (
            el.tagName === "INPUT" ||
            el.tagName === "TEXTAREA" ||
            el.tagName === "SELECT"
          ) {
            if (el.type === "checkbox" || el.type === "radio") {
              el.checked = false;
            } else {
              el.value = "";
            }
            el.dataset.value = "";
            el.dataset.valor = "";
          }
        });
        setIsEdit(false);
        return;
      }

      console.log("DATA RECUPAREDA:", result);

      const informacion = infoMeta.map((meta, idx) => ({
        data: info[idx] ?? "",
        metadata: (meta ?? "").split("*"),
      }));

      const campo100 = informacion.find((item) => item.metadata?.[5] === "100");
      if (campo100) {
        const campo = campo100.metadata[0];
        const valor = campo100.data;

        if (valor && valor.trim() !== "") {
          const hidden100 = elementosRef.current.find(
            (el) => el?.type === "hidden" && el.dataset.campo === campo,
          );
          if (hidden100) {
            hidden100.value = valor;
            hidden100.dataset.value = valor;
          }
          setIsEdit(true);
        }
      }

      informacion
        .filter((item) => item.metadata?.[5] !== "100")
        .forEach((item) => {
          const campo = item.metadata[0];
          const valor = item.data;

          if (campo === "3.6") {
            setExtraValue(valor ?? "");
            const el = elementosRef.current.find(
              (ref) => ref?.dataset?.campo === campo,
            );
            if (el) {
              el.value = valor;
              el.dataset.value = valor;
              el.dataset.valor = valor;
              el.dispatchEvent(new Event("input", { bubbles: true }));
            }
            setDatasets((prev) => ({
              ...prev,
              [campo]: { value: valor, valor: valor, item: item ?? "" },
            }));
            return;
          }

          const el = elementosRef.current.find(
            (ref) => ref?.dataset?.campo === campo,
          );

          if (el) {
            if (
              el.tagName === "INPUT" ||
              el.tagName === "TEXTAREA" ||
              el.tagName === "SELECT"
            ) {
              el.value = valor;
              el.dataset.value = valor;
              el.dataset.valor = valor;
              el.dispatchEvent(new Event("input", { bubbles: true }));

              setDatasets((prev) => ({
                ...prev,
                [campo]: { value: valor, valor: valor, item: item ?? "" },
              }));
            }
          }
        });
    }
  };

  const handleEnvio = useCallback(async () => {
    if (!valoresCambiados.data.length && !valoresCambiados.campos.length) {
      setMensajeToast("NO existen datos que enviar");
      setTipoToast("error");
      setTimeout(() => setMensajeToast(""), 2000);
      return;
    }

    const hidden100 = elementosRef.current.find(
      (el) => el?.type === "hidden" && el.dataset.campo,
    );
    if (hidden100) {
      valoresCambiados.campos.unshift(hidden100.dataset.campo);
      valoresCambiados.data.unshift(hidden100.dataset.value);
    }
    const dataEnviar =
      usuario.trim() +
      "~" +
      valoresCambiados.data.join("|") +
      "|" +
      valoresCambiados.campos.join("|");

    const formData = new FormData();
    formData.append("data", dataEnviar);

    console.log("Datos a Enviar Datos:", dataEnviar);

    setIsSubmitting(true);
    try {
      const result = await runFetch("/Home/GrabarDatosVarios", {
        method: "POST",
        body: formData,
      });

      console.log("Respuesta Grabacion Datos Datos:", result);
      if (result) {
        setMensajeToast("Datos Guardados Correctamente ...");
        setTipoToast("success");
        setIsEdit(true);

        if (hidden100 && result.trim() !== "") {
          hidden100.value = result.trim();
          hidden100.dataset.value = result.trim();
        }

        elementosRef.current.forEach((el) => {
          if (!el) return;
          el.dataset.valor = el.dataset.value ?? "";
        });
      }
    } catch (err) {
      console.error(err);
      setMensajeToast("Error al guardar la informacion ...");
      setTipoToast("error");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setMensajeToast("");
      }, 2000);
    }
  }, [valoresCambiados, usuario, runFetch]);

  useEffect(() => {
    if (esValido) {
      handleEnvio();
    }
  }, [esValido, handleEnvio]);

  const handleChange = (e) => {
    const { value, valor, campo, item, extra } = e.target.dataset;

    // INICIO DE CASO PUNTUAL
    // ======================
    if (extra) {
      setExtraValue(extra);
    }
    // ======================

    setDatasets((prev) => ({
      ...prev,
      [campo]: { value, valor, item },
    }));
  };

  const preData = data?.[0]?.split("~") ?? [];
  const info = preData?.[0]?.split("|") ?? [];
  const infoMeta = preData?.[1]?.split("|") ?? [];

  const informacion = (infoMeta ?? []).map((meta, idx) => ({
    data: (info ?? [])[idx] ?? "",
    metadata: (meta ?? "").split("*"),
  }));

  // OPCIONAL
  // ======================================================================
  useEffect(() => {
    const campo36 = informacion.find((item) => item.metadata[0] === "3.6");
    if (campo36 && extraValue === "") {
      setExtraValue(campo36.data ?? "");
    }
  }, [informacion, extraValue]);
  // ======================================================================

  const listasData = (data ?? []).slice(1);

  const mapaListas = (listasData ?? []).reduce((acc, entry) => {
    const [itemKey, ...opciones] = entry.split("~");
    acc[itemKey] = opciones;
    return acc;
  }, {});

  if (loading) {
    return <div>Cargando datos...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (!data) {
    return <div>No hay datos disponibles</div>;
  }

  // console.log("mapaListas keys:", Object.keys(mapaListas));
  // console.log("Listas catalogos:", mapaListas[11]);

  return (
    <>
      <div className="text-xl font-bold mb-4 text-green-800 flex items-center gap-2">
        {isEdit ? "EDITAR" : "NUEVO"}
        <input
          type="text"
          ref={inputRef}
          placeholder="Buscar..."
          className="px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
        <button
          type="button"
          onClick={handleBuscarClick}
          className="px-4 py-1 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md shadow-md transition-colors"
        >
          Buscar
        </button>
      </div>

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
              {...(typeCode === 103
                ? {
                    checked: (datasets[metadata[0]]?.value ?? data) === "1",
                  }
                : {})}
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
                  ? {
                      defaultValue: datos.data,
                      unaLinea: metadata?.[9],
                      offsetColumnas: metadata?.[10],
                      ancho: metadata?.[11],
                    }
                  : metadata[0] === "3.6"
                    ? {
                        value: extraValue,
                        valor: extraValue,
                        onChange: (e) => setExtraValue(e.target.value),
                      }
                    : {
                        defaultValue: datos.data,
                      })}
              dataAttrs={{
                value:
                  metadata[0] === "3.6"
                    ? extraValue
                    : (datasets[metadata[0]]?.value ?? data),
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
        <CustomElement
          typeCode={120}
          onClick={() => handleClick()}
          {...(isSubmitting ? { disabled: true } : {})}
        >
          {isSubmitting ? "Guardando..." : "GUARDAR"}
        </CustomElement>
        {mensajeError && (
          <div className="mt-3 p-3 text-sm text-white bg-red-400 rounded-md shadow-md animate-bounce">
            {mensajeError}
          </div>
        )}
        {mensajeToast && (
          <div
            className={`mt-3 p-3 text-sm rounded-md shadow-md ${
              tipoToast === "success"
                ? "bg-green-700 text-white animate-bounce"
                : "bg-red-400 text-white animate-bounce"
            }`}
          >
            {mensajeToast}
          </div>
        )}
      </div>
    </>
  );
};

export default RegistroGrupoBien01;
