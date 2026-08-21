"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  BarChart3,
  Bell,
} from "lucide-react";

import { signOut, useSession } from "next-auth/react";
import { useSelector } from "react-redux";
import { selectUnreadCount } from "@/features/NotificationSlice";
import { logout as logoutBackend } from "@/services/AuthService";

const overviewItems = [
  {
    title: "Dashboard",
    icon: <LayoutDashboard size={22} />,
    path: "/",
  },
  {
    title: "Notifications",
    icon: <Bell size={22} />,
    path: "/notifications",
  },
  {
    title: "Analytics",
    icon: <BarChart3 size={22} />,
    path: "/analytics/sales", // Default to sales analytics
  }
];

const managementItems = [
  {
    title: "Companies",
    icon: <Users size={22} />,
    children: [
      { title: "All Companies", path: "/clients/list" },
      { title: "Add New Company", path: "/clients/new" },
    ],
  },
  {
    title: "Users",
    icon: <UserPlus size={22} />,
    children: [
      { title: "All Users", path: "/users/list" },
      { title: "Add New User", path: "/users/add-new-user" },
    ],
  },
  {
    title: "Categories",
    icon: <Tag size={22} />,
    children: [
      { title: "All Categories", path: "/categories/list" },
      { title: "Add New Category", path: "/categories/add-new-category" },
    ],
  },
  {
    title: "Reports",
    icon: <FileSpreadsheet size={22} />,
    path: "/reports",
  },
];

function SidebarItem({
  item,
  expanded,
  isActive,
  setOptimisticPath,
  toggleMenu,
  openMenus,
  handleHoverEnter,
  handleHoverLeave,
  unreadCount,
}) {
  return (
    <div
      key={item.title}
      onMouseEnter={(e) => handleHoverEnter(e, item)}
      onMouseLeave={handleHoverLeave}
      className="mb-2"
    >
      <div
        className={`flex items-center justify-between px-3 py-3 cursor-pointer transition-all border-l-[5px] ${isActive(item.path) ||
          (item.children &&
            item.children.some((child) => isActive(child.path)))
          ? "border-l-orange-500 bg-orange-100 text-orange-500 font-bold"
          : "border-l-transparent text-gray-700 hover:bg-orange-50 hover:text-orange-500"
          } ${!expanded ? "justify-center" : ""}`}
        onClick={() =>
          expanded && item.children && toggleMenu(item.title)
        }
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {item.path ? (
            <Link
              href={item.path}
              onClick={() => {
                if (!isActive(item.path)) {
                  setOptimisticPath(item.path);
                }
              }}
            >
              <span className="flex items-center gap-3 overflow-hidden">
                {item.icon}
                {expanded && <span>{item.title}</span>}
                {item.title === "Notifications" && unreadCount > 0 && (
                  <span
                    className={`flex items-center justify-center bg-red-500 text-white text-[10px] font-black rounded-full shadow-sm animate-in zoom-in duration-300 ${expanded
                      ? "ml-2 px-1.5 py-0.5 min-w-[1.25rem]"
                      : "absolute top-1 right-1 h-4 w-4 border-2 border-white"
                      }`}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
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
            className={`transition-transform ${openMenus.includes(item.title) ? "rotate-180" : "rotate-0"
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
              prefetch={true}
              className={`text-left px-3 py-2 text-sm rounded transition-colors border-l-4 ${isActive(child.path)
                ? "border-l-orange-500 bg-orange-50 text-orange-600 font-bold"
                : "border-l-transparent text-gray-500 hover:bg-orange-50 hover:text-orange-600"
                }`}
              onClick={() => {
                if (!isActive(child.path)) {
                  setOptimisticPath(child.path);
                }
              }}
            >
              {child.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SideBar({
  expanded: controlledExpanded,
  setExpanded: setControlledExpanded,
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const unreadCount = useSelector(selectUnreadCount);
  const isControlled =
    typeof controlledExpanded === "boolean" &&
    typeof setControlledExpanded === "function";

  const [expandedInternal, setExpandedInternal] = useState(false);
  const [openMenus, setOpenMenus] = useState([]);
  const [hoverMenu, setHoverMenu] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0 });
  const [hoverMenuOpen, setHoverMenuOpen] = useState(false);
  const [optimisticPath, setOptimisticPath] = useState(null);
  const pathname = usePathname();

  /* Clear optimistic path on actual navigation */
  useEffect(() => {
    if (pathname === optimisticPath) {
      setOptimisticPath(null);
    }
  }, [pathname, optimisticPath]);

  const isActive = useCallback(
    (path) => {
      const currentPath = optimisticPath || pathname;
      return currentPath === path || (path !== "/" && currentPath.startsWith(`${path}/`));
    },
    [pathname, optimisticPath]
  );

  useEffect(() => {
    if (!isControlled) {
      const saved = localStorage.getItem("sidebar-expanded");
      setExpandedInternal(saved === null ? false : saved === "true");
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
        className={`fixed top-0 left-0 z-30 h-screen flex flex-col bg-white border-r border-gray-200 transition-[width] duration-300 ease-in-out ${expanded ? "w-[280px]" : "w-[72px]"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 flex-shrink-0 h-16">
          <div className={`flex items-center transition-all duration-300 ease-in-out ${expanded ? "w-full justify-between" : "w-full justify-center"}`}>
            <div className="flex items-center gap-2 overflow-hidden shrink-0">
              <img
                src="/favicon.svg"
                alt="Logo"
                className={`h-10 w-10 object-contain transition-all duration-300 ${!expanded ? "h-10 w-10" : ""}`}
              />
            </div>
            {expanded && (
              <button
                aria-label="toggle sidebar"
                onClick={() => setExpanded(!expanded)}
                className="p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 active:scale-95 transition-all duration-200"
              >
                <Menu size={22} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 flex flex-col overflow-y-auto scrollbar-none mb-10 py-4 text-gray-900 transition-all duration-300 space-y-6 ${expanded ? "" : ""}`}>
          {/* OVERVIEW SECTION */}
          <div className={`px-4 mb-4 transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">OVERVIEW</h3>
          </div>
          {overviewItems.map((item) => (
            <SidebarItem
              key={item.title}
              item={item}
              expanded={expanded}
              isActive={isActive}
              setOptimisticPath={setOptimisticPath}
              toggleMenu={toggleMenu}
              openMenus={openMenus}
              handleHoverEnter={handleHoverEnter}
              handleHoverLeave={handleHoverLeave}
              unreadCount={unreadCount}
            />
          ))}

          {/* MANAGEMENT SECTION */}
          <div className={`px-4 mt-6 mb-4 transition-opacity duration-300 ${expanded ? "opacity-100" : "opacity-0 h-0 overflow-hidden"}`}>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">MANAGEMENT</h3>
          </div>
          {managementItems.map((item) => (
            <SidebarItem
              key={item.title}
              item={item}
              expanded={expanded}
              isActive={isActive}
              setOptimisticPath={setOptimisticPath}
              toggleMenu={toggleMenu}
              openMenus={openMenus}
              handleHoverEnter={handleHoverEnter}
              handleHoverLeave={handleHoverLeave}
              unreadCount={unreadCount}
            />
          ))}
        </nav>

        {/* Logout Button */}
        <div className={`border-t border-gray-200 py-3 flex-shrink-0 transition-all duration-300`}>
          <button
            className={`w-full flex items-center gap-3 px-3 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 border-l-[5px] border-l-transparent ${!expanded ? "justify-center" : "justify-start"}`}
            title={expanded ? "Logout" : "Logout"}
            onClick={async () => {
              try {
                // First, logout from backend if token exists
                if (session?.accessToken) {
                  await logoutBackend(session.accessToken);
                }
              } catch (error) {
                console.error("Backend logout error:", error);
              } finally {
                // Clear local cookies and redirect to login
                // This will also trigger the middleware to see the user as logged out
                await signOut({ callbackUrl: "/auth/login", redirect: true });
              }
            }}
          >
            <LogOut size={22} className="shrink-0" />
            {expanded && <span className="font-bold">Logout</span>}
          </button>
        </div>

        {/* Floating Toggle Button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="absolute bottom-20 right-0 translate-x-1/2 z-40 p-2 bg-white border border-gray-200 text-gray-600 rounded-full shadow-md hover:bg-gray-50 hover:text-orange-500 transition-all duration-300 group"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-0" : "rotate-180"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
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
            {[...overviewItems, ...managementItems]
              .find((n) => n.title === hoverMenu)
              ?.children?.map((child) => (
                <Link
                  key={child.title}
                  href={child.path}
                  prefetch={true}
                  className={`block px-3 py-2 text-sm transition-colors cursor-pointer ${isActive(child.path)
                    ? "bg-[#ff782d]/15 text-[#ff782d] font-semibold hover:bg-[#ff782d]/20"
                    : "text-gray-700 hover:bg-gray-100 hover:text-[#081422]"
                    }`}
                  onClick={() => {
                    setHoverMenu(null);
                    setHoverMenuOpen(false);
                    if (!isActive(child.path)) {
                      setOptimisticPath(child.path);
                    }
                  }}
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
