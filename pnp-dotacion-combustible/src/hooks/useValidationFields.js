import { useState } from "react";

const useValidationFields = (elementosRef) => {
  const [mensajeError, setMensajeError] = useState("");
  const [esValido, setEsValido] = useState(false);

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
      setEsValido(false);
      setMensajeError("Existen campos obligatorios");
      setTimeout(() => {
        setMensajeError("");
      }, 2000);
    } else {
      setEsValido(true);
      setMensajeError("");
    }
  };
  return { handleClick, mensajeError, esValido };
};

export default useValidationFields;
