import { useState, useEffect, useCallback } from "react";
import Loader from "./Loader";
import { useTablaVirtualizada } from "../hooks/useTablaVirtualizada";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

export const BaseTabla = ({ configTable }) => {
  const { title, isPaginar, listaDatos, offsetColumnas } = configTable;

  const rowsOriginal = listaDatos;

  const dataRows =
    listaDatos && listaDatos.length > 2 ? listaDatos.slice(2) : [];

  // .... inicio de paginacion ....
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;
  const [containerWidth, setContainerWidth] = useState(null);

  useEffect(() => {
    setPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(dataRows.length / rowsPerPage));
  useEffect(() => {
    if (isPaginar && page > totalPages) {
      setPage(totalPages);
    }
  }, [isPaginar, page, totalPages]);

  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedRows = dataRows.slice(start, end);

  const handlePageChange = (event, newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };
  // ........ fin paginacion ....

  const datosTabla = isPaginar ? paginatedRows : listaDatos;
  const {
    totalRegistros,
    cabeceraFiltrada,
    totalWidth,
    rowVirtualizer,
    scrollBarRef,
    tableContainerRef,
    syncScroll,
  } = useTablaVirtualizada(datosTabla, rowsOriginal, offsetColumnas);

  // --- NUEVO: calcular ancho dinámico del contenedor ---
  useEffect(() => {
    if (!tableContainerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(tableContainerRef.current);
    return () => observer.disconnect();
  }, [tableContainerRef]);
  // ------------------------------------------------------

  // NOTA: PARA RESALTADO DE LA FILA SELECCIONADA
  const [selectedIndex, setSelectedIndex] = useState(null);
  const handleKeyDown = useCallback(
    (e) => {
      if (rowVirtualizer.getTotalSize() === 0) return;
      if (e.key === "ArrowDown") {
        setSelectedIndex((prev) => {
          const next =
            prev === null
              ? 0
              : Math.min(prev + 1, rowVirtualizer.getTotalSize() - 1);
          rowVirtualizer.scrollToIndex(next, { align: "center" });
          return next;
        });
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        setSelectedIndex((prev) => {
          const next = prev === null ? 0 : Math.max(prev - 1, 0);
          rowVirtualizer.scrollToIndex(next, { align: "center" });
          return next;
        });
        e.preventDefault();
      }
    },
    [rowVirtualizer],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (selectedIndex != null) {
      rowVirtualizer.scrollToIndex(selectedIndex, { align: "center" });
      const align =
        selectedIndex === 0
          ? "start"
          : selectedIndex === rowVirtualizer.options.count - 1
            ? "end"
            : "center";
      rowVirtualizer.scrollToIndex(selectedIndex, { align });
      const rowEl = tableContainerRef.current?.querySelector(
        `[data-row-index="${selectedIndex}"]`,
      );
      if (rowEl) {
        rowEl.scrollIntoView({
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  }, [selectedIndex, rowVirtualizer, tableContainerRef]);

  if (!listaDatos || listaDatos.length <= 1) {
    return <Loader />;
  }

  const effectiveWidth =
    containerWidth != null ? containerWidth - 32 : totalWidth;

  return (
    <>
      <div
        ref={tableContainerRef}
        className="relative overflow-y-auto  min-h-0 bg-white shadow-lg rounded-lg border border-gray-200 outline-none"
        onScroll={() => syncScroll("table")}
        tabIndex={0}
      >
        {/* Título */}
        <div className="sticky top-0 left-0 z-30 bg-white shadow-md">
          <h2 className="text-left text-xl font-bold text-gray-800 py-2 px-4">
            {title}{" "}
            <span className="ml-2 text-sm font-medium text-gray-500">
              {isPaginar
                ? `(${listaDatos.length - 2} Reg.)`
                : `(${totalRegistros} Reg.)`}
            </span>
          </h2>
        </div>

        {/* Cabecera fija */}
        <div
          className="sticky top-10 z-20 flex border-b border-gray-300 bg-gray-100"
          style={{ width: `${effectiveWidth}px` }}
        >
          {cabeceraFiltrada.map((col, id) => (
            <div
              key={id}
              className="px-2 py-2 font-semibold text-left"
              style={{
                width: `${col[1]}px`,
                minWidth: `${col[1]}px`,
                maxWidth: `${col[1]}px`,
                flexShrink: 0,
              }}
            >
              {col[0]}
            </div>
          ))}
        </div>

        {/* Body virtualizado */}
        <div
          className="relative"
          style={{
            height: isPaginar
              ? `${rowVirtualizer.getVirtualItems().length * 35}px`
              : `${rowVirtualizer.getTotalSize()}px`,
            width: `${effectiveWidth}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const base = isPaginar ? 0 : 2;
            const fila = datosTabla[virtualRow.index + base];
            if (!fila) return null;
            const oneRow = fila.split("|");
            const filaFiltrada = oneRow.slice(offsetColumnas);
            const isEven = virtualRow.index % 2 === 0;

            const isSelected = virtualRow.index === selectedIndex;

            return (
              <div
                key={virtualRow.index}
                data-row-index={virtualRow.index}
                onClick={() => {
                  setSelectedIndex(virtualRow.index);
                  rowVirtualizer.scrollToIndex(virtualRow.index, {
                    align: "center",
                  });
                }}
                className={`absolute left-0 flex border-b border-gray-200 cursor-pointe transition-colors duration-150 ${isSelected ? "bg-indigo-200" : isEven ? "bg-white" : "bg-gray-50"} hover:bg-indigo-100 active:bg-indigo-300`}
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                  width: `${effectiveWidth}px`,
                }}
              >
                {filaFiltrada.map((val, j) => (
                  <div
                    key={j}
                    className="px-2 py-2 text-left truncate"
                    style={{
                      width: `${cabeceraFiltrada[j][1]}px`,
                      minWidth: `${cabeceraFiltrada[j][1]}px`,
                      maxWidth: `${cabeceraFiltrada[j][1]}px`,
                      flexShrink: 0,
                    }}
                  >
                    {val}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Barra de scroll sincronizada */}
      <div
        ref={scrollBarRef}
        className="fixed bottom-0 left-0 w-full h-5 overflow-x-auto bg-gray-100"
        onScroll={() => syncScroll("bar")}
      >
        <div className="h-1" style={{ width: `${effectiveWidth}px` }}></div>
      </div>

      {isPaginar && (
        <Stack spacing={2} className="mt-4 flex justify-center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            shape="rounded"
            color="primary"
          />
        </Stack>
      )}
    </>
  );
};
