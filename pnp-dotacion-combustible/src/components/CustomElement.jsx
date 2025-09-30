import { useState } from "react";
import { forwardRef } from "react";
import { memoriaGlobal } from "./memoriaGlobal";

const CustomElement = forwardRef(
  ({ typeCode, dataAttrs = {}, options: optionsProp = [], ...props }, ref) => {
    const [showPopup, setShowPopup] = useState(false);

    const datasetProps = Object.entries(dataAttrs).reduce(
      (acc, [key, value]) => {
        acc[`data-${key}`] = value;
        return acc;
      },
      {},
    );

    let Tag = "div";
    if (typeCode) {
      switch (typeCode) {
        case 100:
          Tag = "memoriaGlobal";
          break;
        case 101:
          Tag = "input";
          props.type = "text";
          break;
        case 102:
          Tag = "input";
          props.type = "date";
          break;
        case 103:
          Tag = "input";
          props.type = "checkbox";
          break;
        case 104:
          Tag = "input";
          props.type = "radio";
          break;
        case 105:
          Tag = "input";
          props.type = "password";
          break;
        case 106:
          Tag = "input";
          props.type = "file";
          break;
        case 111:
          Tag = "select";
          break;
        case 112:
          Tag = "selectMulti";
          break;
        case 113:
          Tag = "textArea";
          break;
        case 120:
          Tag = "button";
          break;
        case 150:
          Tag = "customPopupInputText";
          break;
        case 151:
          Tag = "customPopupSelectMulti";
          break;
        default:
          Tag = "div";
      }
    }

    if (Tag === "memoriaGlobal") {
      const { value, campo } = props;
      memoriaGlobal.container.value = value;
      memoriaGlobal.container.campo = campo;
      return null;
    }

    if (Tag === "input") {
      const { etiqueta, onChange, tipoDato, ...restProps } = props;
      const handleChange = (e) => {
        let value = e.target.value;

        if (tipoDato === "entero") {
          e.target.value = e.target.value.replace(/\D/g, "");
        } else if (tipoDato === "decimal") {
          // Permitir solo números y un punto decimal
          value = value.replace(/[^0-9.]/g, "");
          const parts = value.split(".");
          if (parts.length > 2) {
            value = parts[0] + "." + parts.slice(1).join("");
          }
        } else if (props.type === "text") {
          value = value.toUpperCase();
        }

        if (props.type === "checkbox") {
          e.target.dataset.value = e.target.checked ? "1" : "0";
        } else if (props.type === "radio") {
          e.target.dataset.value = e.target.checked ? "1" : "0";
        } else {
          e.target.dataset.value = e.target.value;
        }

        e.target.value = value;
        if (onChange) onChange(e);
      };

      const handleKeyDown = (e) => {
        if (tipoDato === "entero") {
          const allowed = [
            "Backspace",
            "Delete",
            "ArrowLeft",
            "ArrowRight",
            "Tab",
          ];
          if (!/[0-9]/.test(e.key) && !allowed.includes(e.key)) {
            e.preventDefault();
          }
        } else if (tipoDato === "decimal") {
          const allowed = [
            "Backspace",
            "Delete",
            "ArrowLeft",
            "ArrowRight",
            "Tab",
          ];
          if (!/[0-9.]/.test(e.key) && !allowed.includes(e.key)) {
            e.preventDefault();
          }
          if (e.key === "." && e.currentTarget.value.includes(".")) {
            e.preventDefault();
          }
        }
      };

      if (props.type === "checkbox" || props.type === "radio") {
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              ref={ref}
              type={props.type}
              {...datasetProps}
              {...restProps}
              defaultChecked={datasetProps["data-value"] === "1"}
              onChange={handleChange}
              className={`h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${restProps.disabled ? "opacity-50 cursor-not-allowed bg-gray-200" : ""}`}
            />
            <div className="flex items-center gap-1 mb-1">
              <span className="text-sm font-bold text-green-900">
                {etiqueta}
              </span>
              {restProps.required && <span className="text-red-500"> *</span>}
            </div>
          </label>
        );
      }
      return (
        <label className="block w-full">
          <div className="flex items-center gap-1 mb-1">
            <span className="block text-sm font-bold text-green-900 mb-1">
              Ingrese {etiqueta}
            </span>
            {restProps.required && <span className="text-red-500"> *</span>}
          </div>
          <input
            ref={ref}
            type={props.type}
            {...datasetProps}
            {...restProps}
            defaultValue={restProps.defaultValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={`block w-full rounded-md border bg-gray-50 px-3 py-2 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 border-gray-300 ${restProps.disabled ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-500" : ""}`}
          />
        </label>
      );
    }

    if (Tag === "customPopupInputText") {
      const { etiqueta, popupContent, ...restProps } = props;
      return (
        <div className="block w-full">
          <label
            className="block w-3/4 mb-1 px-3 rounded-md border border-gray-400 bg-indigo-50 hover:bg-indigo-100 text-sm font-bold text-green-900 cursor-pointer shadow-sm transition"
            onClick={() => setShowPopup(true)}
          >
            <span className="text-sm font-bold text-green-900">
              {etiqueta} ( ... )
            </span>
            {restProps.required && <span className="text-red-500"> *</span>}
          </label>
          <input
            ref={ref}
            type="text"
            readOnly
            disabled
            {...datasetProps}
            {...restProps}
            defaultValue={restProps.defaultValue}
            className="block w-full rounded-md border px-3 py-2 shadow-sm text-gray-600 opacity-50 cursor-not-allowed bg-gray-200"
          />

          {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/0 backdrop-blur-sm z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                <h2 className="text-lg font-bold mb-4">Título del Popup</h2>
                <div className="mb-4">
                  {popupContent ?? <p>Aquí puedes mostrar más información.</p>}
                </div>
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (Tag === "customPopupSelectMulti") {
      const { etiqueta, onChange, popupContent, unaLinea, ...restProps } =
        props;

      const handleChange = (e) => {
        const selectedValues = Array.from(e.target.selectedOptions).map(
          (opt) => opt.value,
        );
        e.target.dataset.value = selectedValues.join(",");
        if (onChange) onChange(e);
      };

      const parsedOptions = optionsProp.map((opt) => {
        if (typeof opt === "string" && opt.includes("|")) {
          const [value, label] = opt.split("|");
          return { value, label };
        } else if (typeof opt === "object" && opt.value && opt.label) {
          return opt;
        } else {
          return { value: opt, label: opt };
        }
      });

      const selectedValue = datasetProps["data-value"];
      const matchedOption = parsedOptions.find(
        (opt) => opt.value === selectedValue,
      );

      const selectStyle =
        unaLinea === "1" ? { height: "2.5rem" } : { height: "10rem" };

      return (
        <div className="block w-full">
          <label
            className="block w-3/4 mb-1 px-3 rounded-md border border-gray-400 bg-indigo-50 hover:bg-indigo-100 text-sm font-bold text-green-900 cursor-pointer shadow-sm transition"
            onClick={() => setShowPopup(true)}
          >
            <span className="text-sm font-bold text-green-900">
              {etiqueta} ( ... )
            </span>
            {restProps.required && <span className="text-red-500"> *</span>}
          </label>
          <select
            ref={ref}
            multiple
            readOnly
            disabled
            {...datasetProps}
            {...restProps}
            onChange={handleChange}
            style={selectStyle}
            className="block w-full rounded-md border  px-3 py-2 shadow-sm opacity-50 cursor-not-allowed bg-gray-200 text-gray-500"
          >
            {matchedOption ? (
              <option
                value={matchedOption.value}
                style={{ fontWeight: "bold" }}
              >
                {matchedOption.label}
              </option>
            ) : null}
          </select>

          {showPopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-white/0 backdrop-blur-sm z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <h2 className="text-lg font-bold mb-4">Popup de selección</h2>
                <div className="mb-4">
                  {popupContent ?? <p>Aquí puedes mostrar más información.</p>}
                </div>
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (Tag === "select") {
      const { etiqueta, onChange, children, ...restProps } = props;
      const handleChange = (e) => {
        const value = e.target.value;
        e.target.dataset.value = value;
        if (onChange) onChange(e);
      };

      return (
        <label className="block w-full">
          {etiqueta && (
            <div className="flex items-center gap-1 mb-1">
              <span className="block text-sm font-bold text-green-900 mb-1">
                seleccione {etiqueta}
              </span>
              {restProps.required && <span className="text-red-500"> *</span>}
            </div>
          )}
          <select
            ref={ref}
            {...datasetProps}
            {...restProps}
            defaultValue={datasetProps["data-value"] ?? ""}
            onChange={handleChange}
            className={`block w-full rounded-md border bg-gray-50 px-3 py-2 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 border-gray-300 ${restProps.disabled ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-500" : ""}`}
          >
            <option value="" disabled>
              Seleccione --
            </option>
            {children ??
              optionsProp.map((datos, idx) => {
                const [value, label] = datos.split("|");
                return (
                  <option key={idx} value={value}>
                    {label}
                  </option>
                );
              })}
          </select>
        </label>
      );
    }

    if (Tag === "selectMulti") {
      const { etiqueta, onChange, children, ...restProps } = props;
      const handleChange = (e) => {
        const selectedValues = Array.from(e.target.selectedOptions).map(
          (opt) => opt.value,
        );
        e.target.dataset.value = selectedValues.join(",");
        if (onChange) onChange(e);
      };

      return (
        <label className="block w-full">
          {etiqueta && (
            <div className="flex items-center gap-1 mb-1">
              <span className="block text-sm font-bold text-green-900 mb-1">
                seleccione {etiqueta}
              </span>
              {restProps.required && <span className="text-red-500"> *</span>}
            </div>
          )}
          <select
            ref={ref}
            multiple
            {...datasetProps}
            {...restProps}
            onChange={handleChange}
            className={`block w-full rounded-md border bg-gray-50 px-3 py-2 shadow-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 border-gray-300 ${restProps.disabled ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-500" : ""}`}
          >
            {children ??
              optionsProp.map(({ value, label }, idx) => (
                <option key={idx} value={value}>
                  {label}
                </option>
              ))}
          </select>
        </label>
      );
    }

    if (Tag === "textArea") {
      const { etiqueta, onChange, ...restProps } = props;
      const handleChange = (e) => {
        e.target.dataset.value = e.target.value;
        if (onChange) onChange(e);
      };

      return (
        <label className="block w-full">
          {etiqueta && (
            <div className="flex items-center gap-1 mb-1">
              <span className="block text-sm font-bold text-green-900 mb-1">
                {etiqueta}
              </span>
              {restProps.required && <span className="text-red-500"> *</span>}
            </div>
          )}
          <textarea
            ref={ref}
            {...datasetProps}
            {...restProps}
            onChange={handleChange}
            defaultValue={restProps.defaultValue}
            className={`block w-full rounded-md border bg-gray-50 px-3 py-2 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 border-gray-300 ${restProps.disabled ? "opacity-50 cursor-not-allowed bg-gray-200 text-gray-500" : ""}`}
          />
        </label>
      );
    }

    if (Tag === "button") {
      const { etiqueta, children, onClick, ...restProps } = props;
      return (
        <div className="block w-full">
          {etiqueta && (
            <span className="block text-sm font-bold text-green-900 mb-1">
              {etiqueta}
            </span>
          )}
          <button
            ref={ref}
            {...datasetProps}
            {...restProps}
            onClick={onClick}
            className={`px-4 py-2 rounded-md bg-indigo-500 text-white shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-400 ${restProps.disabled ? "opacity-50 cursor-not-allowed bg-gray-300 hover:bg-gray-300" : ""}`}
          >
            {children}
          </button>
        </div>
      );
    }
  },
);

export default CustomElement;
