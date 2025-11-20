// "use client";
// import React, { useState, useEffect } from 'react';

// // Interface untuk tipe menu item
// interface MenuItem {
//   id: string;
//   label: string;
//   icon: string;
//   path: string;
// }

// // Props untuk komponen Sidebar - UPDATE SESUAI PAGE.TSX
// interface SidebarProps {
//   userName?: string;
//   userAvatar?: string;
//   currentPath?: string;
//   onNavigate?: (path: string) => void;
//   onLogout?: () => void;
// }

// const Sidebar: React.FC<SidebarProps> = ({
//   userName = 'Aqsa Kel',
//   userAvatar,
//   currentPath = '/streak',
//   onNavigate,
//   onLogout
// }) => {
//   const [showAnimation, setShowAnimation] = useState(false);

//   // Menu items dengan path icon sesuai gambar
//   const menuItems: MenuItem[] = [
//     { id: 'streak', label: 'Streak', icon: '/img/sidebar/streak_icon.png', path: '/streak' },
//     { id: 'todo', label: 'To-do', icon: '/img/sidebar/todo_icon.png', path: '/todo' },
//     { id: 'coach-ai', label: 'Coach AI', icon: '/img/sidebar/ai_icon.png', path: '/coach-ai' },
//     { id: 'calendar', label: 'Calendar', icon: '/img/sidebar/calendar_icon.png', path: '/calendar' }
//   ];

//   useEffect(() => {
//     // Cek apakah ini first load dari sessionStorage
//     const hasAnimated = sessionStorage.getItem('sidebarAnimated');

//     if (!hasAnimated) {
//       setShowAnimation(true);
//       sessionStorage.setItem('sidebarAnimated', 'true');
//     }
//   }, []);

//   const handleMenuClick = (path: string) => {
//     if (onNavigate) {
//       onNavigate(path);
//     }
//   };

//   const handleLogout = () => {
//     // Clear animation flag saat logout
//     sessionStorage.removeItem('sidebarAnimated');
//     if (onLogout) {
//       onLogout();
//     }
//   };

//   return (
//     <div
//       className={`
//         w-[225px] bg-[#F4F6F9] rounded-md shadow-sm border border-gray-200
//         flex flex-col justify-between
//         my-4 ml-4 p-2
//         ${showAnimation ? 'animate-slideDown' : ''}
//       `}
//       style={{ height: 'calc(100vh - 300px)' }}
//     >
//       {/* Header dengan Logo */}
//       <div className="p-4">
//         {/* Logo */}
//         <div className="gap-2 py-5 border-b border-gray-200">
//           <img src="/img/logo/logo_dark.png" alt="logo" className="w-[110px] h-[30px]" />
//         </div>

//         {/* Menu Items */}
//         <nav className="space-y-1 mt-4">
//           {menuItems.map((item) => (
//             <button
//               key={item.id}
//               onClick={() => handleMenuClick(item.path)}
//               className={`
//                 w-full flex items-center gap-3 px-3 py-2.5 rounded-md
//                 text-sm font-normal transition-colors duration-150
//                 ${currentPath === item.path
//                   ? 'bg-white text-gray-900 shadow-sm'
//                   : 'text-gray-700 hover:bg-gray-100'
//                 }
//               `}
//             >
//               <img
//                 src={item.icon}
//                 alt={item.label}
//                 className="w-4 h-4 object-contain"
//               />
//               <span>{item.label}</span>
//             </button>
//           ))}
//         </nav>
//       </div>

//       {/* Footer dengan Logout */}
//       <div className="p-4 border-t border-gray-200">
//         <button
//           onClick={handleLogout}
//           className="
//             w-full flex items-center gap-3 px-3 py-2.5 rounded-md
//             text-sm font-normal text-red-600 hover:bg-red-50
//             transition-colors duration-150
//           "
//         >
//           <img
//             src="/img/sidebar/log-out_icon.png"
//             alt="Log out"
//             className="w-4 h-4 object-contain"
//           />
//           <span>Log out</span>
//         </button>
//       </div>

//       {/* Custom CSS untuk animasi */}
//       <style>{`
//         @keyframes slideDown {
//           from {
//             transform: translateY(-100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateY(0);
//             opacity: 1;
//           }
//         }

//         .animate-slideDown {
//           animation: slideDown 0.5s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// // PENTING: Export Sidebar, BUKAN SidebarDemo!
// export default Sidebar;

"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

// Interface untuk tipe menu item
interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

// Props untuk komponen Sidebar
interface SidebarProps {
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    // Animation check
    const hasAnimated = sessionStorage.getItem("sidebarAnimated");
    if (!hasAnimated) {
      setShowAnimation(true);
      sessionStorage.setItem("sidebarAnimated", "true");
    }
  }, []);

  // Menu items dengan path icon sesuai gambar
  const menuItems: MenuItem[] = [
    {
      id: "streak",
      label: "Streak",
      icon: "/img/sidebar/streak_icon.png",
      path: "/streak",
    },
    {
      id: "todo",
      label: "To-do",
      icon: "/img/sidebar/todo_icon.png",
      path: "/todo",
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: "/img/sidebar/calendar_icon.png",
      path: "/calendar",
    },
    {
      id: "coach-ai",
      label: "Coach AI",
      icon: "/img/sidebar/ai_icon.png",
      path: "/coach-ai",
    },
  ];

  const handleMenuClick = (path: string) => {
    router.push(path);
  };

  const handleLogout = () => {
    // Clear animation flag saat logout
    sessionStorage.removeItem("sidebarAnimated");
    if (onLogout) {
      onLogout();
    }
  };

  // Determine active page
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <>
        {/* Desktop Sidebar Skeleton */}
        <div
          className="hidden lg:flex w-[280px] bg-white rounded-lg shadow-sm border border-gray-100 flex-col justify-between my-6 ml-6 p-6 shrink-0"
          style={{ height: "calc(100vh - 48px)" }}
        >
          <div />
        </div>
        {/* Mobile Header Skeleton */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-40 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="w-20 h-6 bg-gray-200 rounded" />
            <div className="w-10 h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* DESKTOP SIDEBAR (≥ 1024px) */}
      <div
        className={`hidden lg:flex w-[280px] bg-white rounded-lg shadow-sm border border-gray-100 flex-col justify-between my-6 ml-6 p-6 shrink-0 ${
          showAnimation ? "animate-slideDown" : ""
        }`}
        style={{ height: "calc(100vh - 48px)" }}
      >
        {/* Header dengan Logo */}
        <div>
          {/* Logo */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <img
              src="/img/logo/logo_dark.png"
              alt="KINOTE"
              className="h-8 object-contain transition-all duration-200"
            />
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.path)}
                  className={`w-full flex items-center py-3 rounded-lg text-sm font-medium transition-all duration-200 relative group ${
                    active
                      ? "bg-[#161D36] text-white shadow-md"
                      : "text-gray-700 hover:bg-[#161D36] hover:bg-opacity-10 hover:text-white"
                  }`}
                >
                  {/* White vertical line on the left when active */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r"></div>
                  )}

                  {/* Icon with padding */}
                  <div
                    className={`shrink-0 transition-all duration-200 ${
                      active ? "ml-5 mr-4" : "ml-4 mr-4"
                    }`}
                  >
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="w-5 h-5 object-contain transition-all duration-200 group-hover:brightness-0 group-hover:invert"
                      style={
                        active ? { filter: "brightness(0) invert(1)" } : {}
                      }
                    />
                  </div>

                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer dengan Logout */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 border border-[#161D36] border-opacity-10"
          >
            <img
              src="/img/sidebar/log-out_icon.png"
              alt="Log out"
              className="w-5 h-5 object-contain"
            />
            <span>Log out</span>
          </button>
        </div>

        {/* Custom CSS untuk animasi */}
        <style>{`
          @keyframes slideDown {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          .animate-slideDown {
            animation: slideDown 0.5s ease-out;
          }
        `}</style>
      </div>

      {/* MOBILE HEADER & SIDEBAR (< 1024px) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-40">
        <div className="flex items-center justify-between px-4 py-4">
          {/* Logo */}
          <img
            src="/img/logo/logo_dark.png"
            alt="KINOTE"
            className="h-6 object-contain"
          />

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`h-0.5 w-6 bg-[#161D36] transition-all duration-300 ${
                  isOpen ? "rotate-45 translate-y-2.5" : ""
                }`}
              ></span>
              <span
                className={`h-0.5 w-6 bg-[#161D36] transition-all duration-300 ${
                  isOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`h-0.5 w-6 bg-[#161D36] transition-all duration-300 ${
                  isOpen ? "-rotate-45 -translate-y-2.5" : ""
                }`}
              ></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          <nav className="px-4 py-3 space-y-1 border-t border-gray-100">
            {menuItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleMenuClick(item.path);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-[#161D36] text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="w-5 h-5 object-contain"
                    style={active ? { filter: "brightness(0) invert(1)" } : {}}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Logout */}
          <div className="px-4 py-3 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <img
                src="/img/sidebar/log-out_icon.png"
                alt="Log out"
                className="w-5 h-5 object-contain"
              />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/10 z-30 top-20"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Padding untuk mobile agar konten tidak tertutup header */}
      <div className="lg:hidden h-20" />
    </>
  );
};

export default Sidebar;
