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
  Tag,
  LogOut,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard size={22} />,
    path: "/",
  },

  {
    title: "Companies",
    icon: <Users size={22} />,
    children: [
      { title: "All Companies", path: "/clients/list" },
      { title: "Add New Company", path: "/clients/new" },
      { title: "Bulk Import", path: "/clients/bulk" },
      { title: "Unlock Accounts", path: "/clients/unlock" },
    ],
  },

  {
    title: "Users",
    icon: <UserPlus size={22} />,
    children: [
      { title: "All Users", path: "/users/list" },
      { title: "Add New User", path: "/users/new" },
      { title: "User Activations", path: "/users/activations" },
      { title: "User Locking", path: "/users/locking" },
    ],
  },

  {
    title: "Categories",
    icon: <Tag size={22} />,
    children: [
      { title: "All Categories", path: "/categories/list" },
      { title: "Add New Categories", path: "/categories/new" },
    ],
  },

  {
    title: "Reports",
    icon: <FileSpreadsheet size={22} />,
    path: "/reports",
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
  const [hoverMenuOpen, setHoverMenuOpen] = useState(false);
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
      setHoverMenuOpen(true);
    }
  };

  const handleHoverLeave = () => {
    if (!expanded) {
      setHoverMenuOpen(false);
      // Don't immediately clear hoverMenu - let it stay until menu mouse leaves
    }
  };

  const handleMenuMouseEnter = () => {
    setHoverMenuOpen(true);
  };

  const handleMenuMouseLeave = () => {
    setHoverMenuOpen(false);
    setHoverMenu(null);
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-30 h-screen flex flex-col bg-white border-r border-gray-200 transition-[width] duration-300 ease-in-out ${
          expanded ? "w-64" : "w-16"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-gray-200 flex-shrink-0">
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

        {/* Navigation - Centered */}
        <nav className="flex-1 flex flex-col overflow-y-auto scrollbar-none mb-10 px-2 py-3 text-gray-900">
          {navItems.map((item) => (
            <div
              key={item.title}
              onMouseEnter={(e) => handleHoverEnter(e, item)}
              onMouseLeave={handleHoverLeave}
              className="mb-2"
            >
              <div
                className={`flex items-center justify-between px-3 py-2 rounded-r-lg hover:bg-[#ff782d]/10 cursor-pointer transition-all border-l-4 ${
                  pathname === item.path ||
                  (item.children &&
                    item.children.some((child) => pathname === child.path))
                    ? "border-l-[#ff782d] bg-[#ff782d]/5 text-[#ff782d] font-semibold"
                    : "border-l-transparent text-gray-700 hover:text-[#ff782d]"
                }`}
                onClick={() =>
                  expanded && item.children && toggleMenu(item.title)
                }
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {item.path ? (
                    <Link href={item.path}>
                      <span className="flex items-center gap-3 overflow-hidden">
                        {item.icon}
                        {expanded && <span>{item.title}</span>}
                      </span>
                    </Link>
                  ) : (
                    <span className="flex items-center gap-3 overflow-hidden">
                      {item.icon}
                      {expanded && <span>{item.title}</span>}
                    </span>
                  )}
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
                      className={`text-left px-3 py-2 text-sm rounded transition-colors border-l-4 ${
                        pathname === child.path
                          ? "border-l-[#ff782d] bg-[#ff782d]/5 text-[#ff782d] font-semibold"
                          : "border-l-transparent text-gray-500 hover:bg-[#ff782d]/5 hover:text-[#ff782d]"
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

        {/* Logout Button */}
        <div className="border-t border-gray-200 px-2 py-3 flex-shrink-0">
          <button
            className="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
            title={expanded ? "Logout" : "Logout"}
          >
            <LogOut size={22} />
            {expanded && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Hover menu for collapsed sidebar */}
      {hoverMenu &&
        !expanded &&
        (hoverMenuOpen || hoverMenu) &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: hoverPosition.top,
              left: "80px",
              zIndex: 40,
            }}
            className="w-48 bg-white border border-gray-200 rounded-lg py-2 shadow-lg"
            onMouseEnter={handleMenuMouseEnter}
            onMouseLeave={handleMenuMouseLeave}
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
                  className={`block px-3 py-2 text-sm transition-colors cursor-pointer ${
                    pathname === child.path
                      ? "bg-[#ff782d]/15 text-[#ff782d] font-semibold hover:bg-[#ff782d]/20"
                      : "text-gray-700 hover:bg-gray-100 hover:text-[#081422]"
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
