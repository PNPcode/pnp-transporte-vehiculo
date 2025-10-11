import { useState, useEffect, useCallback, useRef } from "react";
import CustomElement from "./CustomElement";
import useValidationFields from "../hooks/useValidationFields";
import useLazyFetch from "../hooks/useLazyFetch";

const PopupBusqueda = ({
  onClose,
  etiqueta,
  ancho,
  extraProps,
  listaDatos,
}) => {
  const elementosRef = useRef([]);
  const [datasets, setDatasets] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mensajeToast, setMensajeToast] = useState("");
  const [tipoToast, setTipoToast] = useState("success");
  const { runFetch } = useLazyFetch();

  const { handleClick, mensajeError, esValido, valoresCambiados } =
    useValidationFields(elementosRef);

  const preData = listaDatos[0] ?? [];
  const info = [];
  const infoMeta = preData?.split("|") ?? [];

  const informacion = infoMeta.map((meta, idx) => ({
    data: info[idx] ?? "",
    metadata: (meta ?? "").split("*"),
  }));

  const listasData = (listaDatos ?? []).slice(1);
  const mapaListas = {
    default: listasData,
  };

  const handleEnvio = useCallback(async () => {
    if (!valoresCambiados.data.length && !valoresCambiados.campos.length) {
      setMensajeToast("NO existen datos que enviar");
      setTipoToast("error");
      setTimeout(() => setMensajeToast(""), 2000);
      return;
    }

    const dataEnviar =
      valoresCambiados.data.join("|") + "|" + valoresCambiados.campos.join("|");

    const formData = new FormData();
    formData.append("data", dataEnviar);

    console.log("Datos a Enviar Datos:", dataEnviar);

    setIsSubmitting(true);
    try {
      const result = await runFetch("/Home/GrabarDatosVarios22", {
        method: "POST",
        body: formData,
      });

      console.log("Respuesta Grabacion Datos Datos:", result);
      if (result) {
        setMensajeToast("Datos Guardados Correctamente ...");
        setTipoToast("success");

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
  }, [valoresCambiados, runFetch]);

  useEffect(() => {
    if (esValido) {
      handleEnvio();
    }
  }, [esValido, handleEnvio]);

  const handleChange = () => {
    console.log("haciendo click...");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className="bg-white p-6 rounded-lg shadow-lg"
        style={{ width: ancho ? `${ancho}px` : "80vw" }}
      >
        <h2 className="text-lg font-bold mb-4">
          Busqueda de Documento Grupo Bien:
        </h2>

        <div className="flex flex-nowrap items-end gap-4 mb-6 overflow-x-auto pb-2">
          {informacion.map((datos, idx) => {
            const { data, metadata } = datos;
            const typeCode = Number(metadata?.[5] ?? 0);
            let maxLength = metadata?.[3] ? Number(metadata[3]) : 0;
            const isRequired = metadata?.[1] === "0";
            const isDisabled = metadata?.[8] === "1";
            const hideElement = metadata?.[12] === "1";
            maxLength = metadata?.[4] === "" ? maxLength : Number(metadata[4]);

            return (
              <div key={idx} className="flex-shrink-0 w-auto">
                <CustomElement
                  key={idx}
                  ref={(el) => (elementosRef.current[idx] = el)}
                  typeCode={typeCode}
                  etiqueta={metadata[7] ?? ""}
                  placeholder={metadata[7] ?? ""}
                  popupTipo={metadata[6] ?? ""}
                  style={
                    hideElement
                      ? {
                          visibility: "hidden",
                          position: "absolute",
                          width: 0,
                          height: 0,
                          overflow: "hidden",
                        }
                      : {}
                  }
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
                        ...(metadata?.[9] === "1" ? { isDefault: 1 } : {}),
                        options: mapaListas.default,
                      }
                    : typeCode === 151
                      ? {
                          defaultValue: datos.data,
                          unaLinea: metadata?.[9],
                          offsetColumnas: metadata?.[10],
                          ancho: metadata?.[11],
                        }
                      : {
                          defaultValue: datos.data,
                        })}
                  dataAttrs={{
                    value: datasets[metadata[0]]?.value ?? data,
                    valor: data,
                    campo: metadata[0],
                    item: metadata[6],
                  }}
                  onChange={handleChange}
                />
              </div>
            );
          })}
          <div className="flex-shrink-0">
            <CustomElement
              typeCode={120}
              onClick={() => handleClick()}
              {...(isSubmitting ? { disabled: true } : {})}
            >
              {isSubmitting ? "BUSCANDO..." : "BUSCAR"}
            </CustomElement>
          </div>
        </div>
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

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupBusqueda;
