import { useState, useRef, useEffect } from "react";

export default function MultiSelect({ label, options = [], selected = [], onChange, placeholder = "All" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const toggleOption = (v) => {
    if (selected.includes(v)) onChange(selected.filter(x => x !== v));
    else onChange([...selected, v]);
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  const labelText = selected.length === 0 ? placeholder : (selected.length === 1 ? `${selected[0]}` : `${selected.length} selected`);

  return (
    <div className="relative" ref={ref}>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="w-full text-left border rounded p-2 bg-white hover:border-gray-400 flex justify-between items-center"
      >
        <span className="text-sm text-gray-700">{labelText}</span>
        <div className="flex items-center gap-2">
          {selected.length > 0 && <button onClick={clearAll} className="text-xs text-red-500 px-2">Clear</button>}
          <svg className={`w-4 h-4 transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd"/></svg>
        </div>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-auto p-2">
          {options.map(opt => {
            const val = typeof opt === "object" ? opt.id : opt;
            const label = typeof opt === "object" ? opt.name : String(opt);
            const checked = selected.includes(val);
            return (
              <label key={val} className="flex items-center gap-2 p-1 rounded hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" checked={checked} onChange={() => toggleOption(val)} />
                <span className="text-sm">{label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
