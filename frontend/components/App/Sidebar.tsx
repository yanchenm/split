import React, { useState } from 'react';

const Sidebar: React.FC = () => {

  const [viewEdit, setViewEdit] = useState(false);

  const setView = () => {
    setViewEdit(true);
  }

  const unsetView = () => {
    setViewEdit(false);
  }


  return (
    <div className="bg-slate-900 text-slate-300 w-64 space-y-6 px-4 py-7">

        {/* Logo */}
        <a href="/" className="flex items-center space-x-2 px-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
          </svg>
          <span className="text-2xl font-extrabold">
            Ligma
          </span>
        </a>

        {/* Navbar */}
        <nav>
          <a className="py-4 px-4 rounded hover:bg-slate-800 transition duration-200 flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-file-plus h-7 w-7" width="44" height="44" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#94A3B8" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
            <button className="pl-4" onClick={setView}>
              New Split
            </button>
          </a>
          <a className="py-4 px-4 rounded hover:bg-slate-800 transition duration-200 flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-files h-7 w-7" width="44" height="44" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#94A3B8" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M15 3v4a1 1 0 0 0 1 1h4" />
              <path d="M18 17h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h4l5 5v7a2 2 0 0 1 -2 2z" />
              <path d="M16 17v2a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2" />
            </svg>
            <button className="pl-4">
            View Open Splits
            </button>
          </a>
          <a className="py-4 px-4 rounded hover:bg-slate-800 transition duration-200 flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-writing-sign h-7 w-7" width="44" height="44" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#94A3B8" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M3 19c3.333 -2 5 -4 5 -6c0 -3 -1 -3 -2 -3s-2.032 1.085 -2 3c.034 2.048 1.658 2.877 2.5 4c1.5 2 2.5 2.5 3.5 1c.667 -1 1.167 -1.833 1.5 -2.5c1 2.333 2.333 3.5 4 3.5h2.5" />
              <path d="M20 17v-12c0 -1.121 -.879 -2 -2 -2s-2 .879 -2 2v12l2 2l2 -2z" />
              <path d="M16 7h4" />
            </svg>
            <button className="pl-4">
              Settle Split
            </button>
          </a>
          <a className="py-4 px-4 rounded hover:bg-slate-800 transition duration-200 flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-file-zip h-7 w-7" width="44" height="44" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#94A3B8" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M6 20.735a2 2 0 0 1 -1 -1.735v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2h-1" />
              <path d="M11 17a2 2 0 0 1 2 2v2a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-2a2 2 0 0 1 2 -2z" />
              <line x1="11" y1="5" x2="10" y2="5" />
              <line x1="13" y1="7" x2="12" y2="7" />
              <line x1="11" y1="9" x2="10" y2="9" />
              <line x1="13" y1="11" x2="12" y2="11" />
              <line x1="11" y1="13" x2="10" y2="13" />
              <line x1="13" y1="15" x2="12" y2="15" />
            </svg>
            <button className="pl-4">
              View Past Splits
            </button>
          </a>
          <a className="py-4 px-4 rounded hover:bg-slate-800 transition duration-200 flex">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-logout h-7 w-7" width="44" height="44" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#94A3B8" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
              <path d="M7 12h14l-3 -3m0 6l3 -3" />
            </svg>
            <button className="pl-4">
              Log out
            </button>
          </a>

        </nav>
      </div>
  )
};

export default Sidebar;