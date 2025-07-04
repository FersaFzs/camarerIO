import { useState, useRef, useEffect } from 'react';

export default function AdvancedMenu({ options = [] }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="p-2 rounded-full hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-300"
        onClick={() => setOpen((v) => !v)}
        aria-label="Opciones avanzadas"
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="2" fill="#166534" />
          <circle cx="12" cy="12" r="2" fill="#166534" />
          <circle cx="19" cy="12" r="2" fill="#166534" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-green-100 rounded-xl shadow-lg z-50">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-green-700 text-sm bg-white rounded-xl">Sin opciones</div>
          ) : (
            options.map((opt, idx) => (
              <button
                key={idx}
                className="w-full text-left px-4 py-3 bg-white hover:bg-green-50 text-green-900 text-base font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-green-300 disabled:text-green-300 disabled:bg-white"
                onClick={() => { setOpen(false); opt.onClick && opt.onClick(); }}
                disabled={opt.disabled}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
} 