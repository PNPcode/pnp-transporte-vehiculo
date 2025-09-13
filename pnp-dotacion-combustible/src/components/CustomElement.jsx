import { forwardRef } from "react";

const CustomElement = forwardRef(
  (
    {
      typeCode,
      as: Tag = "div",
      children,
      dataAttrs = {},
      options: optionsProp = [],
      ...props
    },
    ref,
  ) => {
    const datasetProps = Object.entries(dataAttrs).reduce(
      (acc, [key, value]) => {
        acc[`data-${key}`] = value;
        return acc;
      },
      {},
    );

    if (typeCode) {
      switch (typeCode) {
        case 111:
          Tag = "select";
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
        case 120:
          Tag = "button";
          break;
        default:
          Tag = "div";
      }
    }

    if (Tag === "select") {
      return (
        <select ref={ref} {...datasetProps} {...props}>
          {children ??
            optionsProp.map(({ value, label }, idx) => (
              <option key={idx} value={value}>
                {label}
              </option>
            ))}
        </select>
      );
    }

    if (Tag === "button") {
      return (
        <button ref={ref} {...datasetProps} {...props}>
          {children}
        </button>
      );
    }

    return (
      <Tag ref={ref} {...datasetProps} {...props}>
        {children}
      </Tag>
    );
  },
);

export default CustomElement;
