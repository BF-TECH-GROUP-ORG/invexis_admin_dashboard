"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  Menu,
  ChevronDown,
  Upload,
  Unlock,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard size={22} />,
    path: "/admin/dashboard",
  },

  {
    title: "Clients",
    icon: <Users size={22} />,
    children: [
      { title: "All Clients", path: "/admin/clients" },
      { title: "Add New", path: "/admin/clients/new" },
      { title: "Bulk Import", path: "/admin/clients/bulk" },
      { title: "Unlock Accounts", path: "/admin/clients/unlock" },
    ],
  },

  {
    title: "Consents & Compliance",
    icon: <ShieldCheck size={22} />,
    path: "/admin/consents",
  },

  {
    title: "Reports",
    icon: <FileSpreadsheet size={22} />,
    path: "/admin/reports",
  },

  {
    title: "Settings",
    icon: <Settings size={22} />,
    path: "/admin/settings",
  },
];

export default function SideBar({
  expanded: controlledExpanded,
  setExpanded: setControlledExpanded,
}) {
  const isControlled =
    typeof controlledExpanded === "boolean" &&
    typeof setControlledExpanded === "function";

  const [expandedInternal, setExpandedInternal] = useState(true);
  const [openMenus, setOpenMenus] = useState([]);
  const [hoverMenu, setHoverMenu] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0 });
  const pathname = usePathname();

  useEffect(() => {
    if (!isControlled) {
      const saved = localStorage.getItem("sidebar-expanded");
      setExpandedInternal(saved === null ? true : saved === "true");
    }
  }, [isControlled]);

  const expanded = isControlled ? controlledExpanded : expandedInternal;
  const setExpanded = (val) => {
    if (isControlled) setControlledExpanded(val);
    else {
      setExpandedInternal(val);
      localStorage.setItem("sidebar-expanded", String(val));
    }
  };

  const toggleMenu = (title) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleHoverEnter = (e, item) => {
    if (!expanded && item.children) {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoverMenu(item.title);
      setHoverPosition({ top: rect.top });
    }
  };

  const handleHoverLeave = () => {
    if (!expanded) setHoverMenu(null);
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-30 h-screen flex flex-col bg-white border-r border-gray-200 transition-[width] duration-300 ease-in-out ${
          expanded ? "w-64" : "w-16"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3 overflow-hidden">
            <button
              aria-label="toggle sidebar"
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded text-gray-900 hover:bg-gray-100 active:scale-95 transition-transform duration-200"
            >
              <Menu size={22} />
            </button>
            {expanded && (
              <span className="font-bold text-lg text-gray-950 whitespace-nowrap">
                INVEX<span className="text-orange-500 font-extrabold">iS</span>
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-none px-2 py-3 text-gray-900">
          <h3
            className={`text-xs font-semibold text-gray-400 px-3 mb-2 transition-opacity duration-300 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            OVERVIEW
          </h3>

          {navItems.map((item) => (
            <div
              key={item.title}
              onMouseEnter={(e) => handleHoverEnter(e, item)}
              onMouseLeave={handleHoverLeave}
            >
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[#081422]/10 cursor-pointer transition-all ${
                  pathname === item.path
                    ? "bg-[#081422] text-white font-semibold"
                    : "text-gray-700"
                }`}
                onClick={() =>
                  expanded && item.children && toggleMenu(item.title)
                }
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {item.icon}
                  {expanded && <span>{item.title}</span>}
                </div>

                {item.children && expanded && (
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${
                      openMenus.includes(item.title) ? "rotate-180" : "rotate-0"
                    }`}
                  />
                )}
              </div>

              {/* Nested menu */}
              {item.children && openMenus.includes(item.title) && expanded && (
                <div className="ml-8 mt-1 flex flex-col">
                  {item.children.map((child) => (
                    <Link
                      key={child.title}
                      href={child.path}
                      className={`text-left px-3 py-1 text-sm rounded transition-colors ${
                        pathname === child.path
                          ? "bg-[#081422]/10 text-[#081422] font-semibold"
                          : "text-gray-500 hover:bg-[#081422]/5 hover:text-[#081422]"
                      }`}
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Hover menu for collapsed sidebar */}
      {hoverMenu &&
        !expanded &&
        createPortal(
          <div
            style={{ position: "fixed", top: hoverPosition.top, left: "80px" }}
            className="w-48 bg-white border rounded-lg py-2 z-50 shadow-md"
          >
            <div className="px-3 pb-2 border-b text-sm font-bold text-gray-700">
              {hoverMenu}
            </div>
            {navItems
              .find((n) => n.title === hoverMenu)
              ?.children?.map((child) => (
                <Link
                  key={child.title}
                  href={child.path}
                  className={`block px-3 py-2 text-sm hover:bg-gray-100 ${
                    pathname === child.path
                      ? "bg-[#081422]/10 text-[#081422] font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {child.title}
                </Link>
              ))}
          </div>,
          document.body
        )}
    </>
  );
}
