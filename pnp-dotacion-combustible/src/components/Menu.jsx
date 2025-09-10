import { useState, Fragment } from "react";
import Box from "@mui/material/Box";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { useData } from "../context/DataProvider";
import { useNavigateTo } from "../utils/useNavigateTo";
import { Outlet } from "react-router-dom";

export default function Menu() {
  const [menuOpen, setMenuOpen] = useState(false);

  // manejar expansión de nivel 1 y nivel 2 separados
  const [openMenu, setOpenMenu] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [selectedCodigo, setSelectedCodigo] = useState(null);

  const [selectedNames, setSelectedNames] = useState({
    menu: "",
    sub: "",
    subsub: "",
  });

  const navigateTo = useNavigateTo();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleMenuItem = (codigo) =>
    setOpenMenu((prev) => (prev === codigo ? null : codigo));
  const toggleSubMenuItem = (codigo) =>
    setOpenSubMenu((prev) => (prev === codigo ? null : codigo));

  const { data } = useData();
  const [posId, ...newData] = data;

  const parsedData = newData.map((item) => {
    const [codigo, nombre] = item.split("|");
    return { codigo, nombre };
  });

  const listaMenuItems = parsedData.filter((item) =>
    item.codigo.endsWith("0000"),
  );

  const listaMenuSubItems = parsedData.filter(
    (item) => item.codigo.endsWith("00") && !item.codigo.endsWith("0000"),
  );

  const listaMenuSubSubItems = parsedData.filter(
    (item) => !item.codigo.endsWith("00"),
  );

  // mapear submenús
  const subItemsMap = listaMenuSubItems.reduce((acc, sub) => {
    const parentPrefix = sub.codigo.slice(0, 2);
    if (!acc[parentPrefix]) acc[parentPrefix] = [];
    acc[parentPrefix].push(sub);
    return acc;
  }, {});

  // mapear sub-submenús
  const subSubItemsMap = listaMenuSubSubItems.reduce((acc, subsub) => {
    const parentPrefix = subsub.codigo.slice(0, 4);
    if (!acc[parentPrefix]) acc[parentPrefix] = [];
    acc[parentPrefix].push(subsub);
    return acc;
  }, {});

  // 🔹 actualizado para soportar tercer nivel
  const handleSubItem = (codigo, nombre, menuNombre, subNombre = "") => {
    setSelectedNames({
      menu: menuNombre,
      sub: subNombre || nombre,
      subsub: subNombre ? nombre : "",
    });
    setSelectedCodigo(codigo);
    let child = `/menu/${codigo}-repo`;
    navigateTo(child, { state: { value: posId } });
    setMenuOpen(false); // cerrar drawer al seleccionar
  };

  const handleLogout = () => {
    navigateTo("/");
  };

  return (
    <div>
      {/* navbar */}
      <nav className="w-full h-12 bg-green-800 text-white px-4 py-2 flex items-center">
        <button
          onClick={toggleMenu}
          className="h-full rounded hover:bg-green-700 transition flex items-center justify-center"
        >
          <img
            src="/images/logoPNP.jpeg"
            alt="Menu"
            className="h-8 w-8 object-contain transition-transform duration-200 hover:scale-110 hover:opacity-90"
          />
        </button>
        <span className="mx-auto font-semibold">
          {selectedNames.menu}
          {selectedNames.sub && (
            <>
              <span className="font-bold text-yellow-400 mx-1">{">"}</span>
              {selectedNames.sub}
            </>
          )}
          {selectedNames.subsub && (
            <>
              <span className="font-bold text-yellow-400 mx-1">{">"}</span>
              {selectedNames.subsub}
            </>
          )}
        </span>
        <button
          onClick={handleLogout}
          className="ml-auto px-3 py-1 rounded bg-green-600 hover:bg-green-700 transition"
        >
          Cerrar sesión
        </button>
      </nav>

      <SwipeableDrawer
        anchor="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpen={toggleMenu}
        sx={{
          "& .MuiDrawer-paper": {
            top: "48px",
            backgroundColor: "#064e3b",
            color: "white",
            fontSize: "0.875rem",
          },
        }}
      >
        <Box sx={{ width: 300, pb: 5 }} role="presentation">
          <List>
            {listaMenuItems.map((menu) => {
              const prefix = menu.codigo.slice(0, 2);
              const subItems = subItemsMap[prefix] || [];

              return (
                <Fragment key={menu.codigo}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() =>
                        subItems.length > 0
                          ? toggleMenuItem(menu.codigo)
                          : setMenuOpen(false)
                      }
                    >
                      <ListItemIcon>
                        {subItems.length > 0 ? (
                          openMenu === menu.codigo ? (
                            <ChevronDownIcon className="h-5 w-5 text-gray-300" />
                          ) : (
                            <ChevronRightIcon className="h-5 w-5 text-gray-300" />
                          )
                        ) : (
                          <DocumentIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={menu.nombre} />
                    </ListItemButton>
                  </ListItem>

                  {/* submenús */}
                  {subItems.length > 0 && (
                    <Collapse
                      in={openMenu === menu.codigo}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List component="div" disablePadding>
                        {subItems.map((sub) => {
                          const subPrefix = sub.codigo.slice(0, 4);
                          const subSubItems = subSubItemsMap[subPrefix] || [];

                          return (
                            <Fragment key={sub.codigo}>
                              <ListItem disablePadding sx={{ pl: 6 }}>
                                <ListItemButton
                                  onClick={() => {
                                    if (subSubItems.length > 0) {
                                      if (openSubMenu !== sub.codigo) {
                                        toggleSubMenuItem(sub.codigo);
                                        setSelectedNames({
                                          menu: menu.nombre,
                                          sub: sub.nombre,
                                          subsub: "",
                                        });
                                      } else {
                                        toggleSubMenuItem(sub.codigo);
                                        setSelectedNames((prev) => ({
                                          ...prev,
                                          sub: "",
                                          subsub: "",
                                        }));
                                      }
                                    } else {
                                      handleSubItem(
                                        sub.codigo,
                                        sub.nombre,
                                        menu.nombre,
                                      );
                                    }
                                  }}
                                  sx={{
                                    bgcolor:
                                      selectedCodigo === sub.codigo
                                        ? "rgba(34,197,94,0.2)"
                                        : "transparent",
                                    "&:hover": {
                                      bgcolor: "rgba(34,197,94,0.3)",
                                    },
                                  }}
                                >
                                  <ListItemIcon>
                                    {subSubItems.length > 0 ? (
                                      openSubMenu === sub.codigo ? (
                                        <ChevronDownIcon className="h-5 w-5 text-gray-300" />
                                      ) : (
                                        <ChevronRightIcon className="h-5 w-5 text-gray-300" />
                                      )
                                    ) : (
                                      <DocumentIcon className="h-5 w-5 text-green-400" />
                                    )}
                                  </ListItemIcon>
                                  <ListItemText primary={sub.nombre} />
                                </ListItemButton>
                              </ListItem>

                              {/* sub-submenús */}
                              {subSubItems.length > 0 && (
                                <Collapse
                                  in={openSubMenu === sub.codigo}
                                  timeout="auto"
                                  unmountOnExit
                                >
                                  <List component="div" disablePadding>
                                    {subSubItems.map((subsub) => (
                                      <ListItem
                                        key={subsub.codigo}
                                        disablePadding
                                        sx={{ pl: 10 }}
                                      >
                                        <ListItemButton
                                          onClick={() =>
                                            handleSubItem(
                                              subsub.codigo,
                                              subsub.nombre,
                                              menu.nombre,
                                              sub.nombre,
                                            )
                                          }
                                          sx={{
                                            bgcolor:
                                              selectedCodigo === subsub.codigo
                                                ? "rgba(59,130,246,0.2)"
                                                : "transparent",
                                            "&:hover": {
                                              bgcolor: "rgba(59,130,246,0.3)",
                                            },
                                          }}
                                        >
                                          <ListItemIcon>
                                            <DocumentIcon className="h-5 w-5 text-blue-400" />
                                          </ListItemIcon>
                                          <ListItemText
                                            primary={subsub.nombre}
                                          />
                                        </ListItemButton>
                                      </ListItem>
                                    ))}
                                  </List>
                                </Collapse>
                              )}
                            </Fragment>
                          );
                        })}
                      </List>
                    </Collapse>
                  )}
                </Fragment>
              );
            })}
          </List>
        </Box>
      </SwipeableDrawer>

      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
}
