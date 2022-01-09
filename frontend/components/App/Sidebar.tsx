import React from 'react';

type ButtonProps = {
  buttonText: string;
  svgSrc: string;
}

const SidebarButton: React.FC<ButtonProps> = ({ buttonText, svgSrc }) => {
  return (
    <a className="py-4 px-4 rounded hover:bg-slate-800 transition duration-200 flex">
      <img src={svgSrc} className="h-7 w-7"/>
      <button className="pl-4 text-left"> {buttonText} </button>
    </a>
  );
}

const Sidebar: React.FC = () => {

  return (
    <div className="bg-slate-900 text-slate-300 w-64 space-y-6 px-4 py-7">

        {/* Logo */}
        <a href="/" className="flex items-center space-x-2 px-4">
          <img src="/cake.svg" className="w-8 h-8" />
          <span className="text-2xl font-extrabold">
            Ligma
          </span>
        </a>

        {/* Navbar */}
        <nav>
          <SidebarButton 
            svgSrc='/document_plus.svg' 
            buttonText='New Split' 
          />
          <SidebarButton
            svgSrc='/document_search.svg'
            buttonText='View Open Splits' 
          />
          <SidebarButton 
            svgSrc='/signature.svg' 
            buttonText='Settle Split' 
          />
          <SidebarButton 
            svgSrc='/document_archived.svg' 
            buttonText='View Past Splits' 
          />
          <SidebarButton 
            svgSrc='/logout.svg' 
            buttonText='Log out' 
          />
        </nav>
      </div>
  )
};

export default Sidebar;