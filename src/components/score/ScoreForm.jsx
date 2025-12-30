// src/components/score/ScoreForm.jsx

import React, { useState, useEffect, useRef } from "react";
import { formatPlayerName } from "../../utils/playerUtils";
import { ChevronDown, Search, X } from "lucide-react";

// --- SearchableSelect ---
const normalizeForSearch = (text) => {
  if (!text) return "";
  return text
    .replace(/Ğ/g, "g").replace(/ğ/g, "g")
    .replace(/Ü/g, "u").replace(/ü/g, "u")
    .replace(/Ş/g, "s").replace(/ş/g, "s")
    .replace(/I/g, "i").replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/Ö/g, "o").replace(/ö/g, "o")
    .replace(/Ç/g, "c").replace(/ç/g, "c")
    .toLowerCase();
};

const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder,
  required,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.username === value);
  const displayValue = selectedOption
    ? formatPlayerName(selectedOption, options)
    : "";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) => {
    const name = formatPlayerName(opt, options);
    const cleanName = normalizeForSearch(name);
    const cleanSearch = normalizeForSearch(searchTerm);
    return cleanName.includes(cleanSearch);
  });

  const handleSelect = (username) => {
    onChange(username);
    setIsOpen(false);
    setSearchTerm("");
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* SELECT BOX - White on Gray */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full rounded px-2 sm:px-3 py-1 sm:py-2 cursor-pointer flex items-center justify-between h-8 sm:h-10
          transition-all border font-semibold text-sm shadow-sm
          ${isOpen
            ? "bg-white border-blue-500 text-blue-900 ring-1 ring-blue-500"
            : "bg-white border-slate-300 text-slate-700 hover:border-blue-400"
          }
        `}
      >
        <span className={`truncate ${!displayValue ? "text-slate-400" : ""}`}>
          {displayValue || placeholder}
        </span>

        <div className="flex items-center gap-1">
          {value && (
            <div
              onClick={clearSelection}
              className="p-0.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition"
            >
              <X size={14} />
            </div>
          )}
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${isOpen ? "rotate-180 text-blue-600" : ""}`}
          />
        </div>
      </div>

      {/* DROPDOWN */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Oyuncu Ara..."
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.username}
                  onClick={() => handleSelect(opt.username)}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors border-b border-slate-50 last:border-0 font-bold ${value === opt.username ? "bg-blue-100 text-blue-900" : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                    }`}
                >
                  {formatPlayerName(opt, options)}
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-slate-400">"{searchTerm}" yok.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN ScoreForm ---
function ScoreForm({
  player1, setPlayer1, score1, setScore1,
  player2, setPlayer2, score2, setScore2,
  shots, setShots, eys1, setEYS1, eys2, setEYS2,
  players, error, loading, onSubmit,
}) {
  const playersList = players || [];
  const availablePlayer2Options = playersList.filter(p => p.username !== player1);
  const [isPenalty, setIsPenalty] = useState(false);
  const [penaltyWinner, setPenaltyWinner] = useState(null);

  // --- GRAY TONED STYLES ---
  // Container: Light Gray to kill the white glare
  const containerStyle = "bg-slate-50 border text-white rounded-lg overflow-hidden border-slate-300 shadow-md";
  const headerStyle = "bg-slate-900 px-4 py-3 flex justify-between items-center";
  const headerTitleTheme = "text-white font-bold text-xs uppercase tracking-wider";

  // Box: No background needed if container is gray, but let's keep it transparent or slightly distinct
  const boxStyle = "border border-slate-300 rounded p-2 sm:p-3 relative mt-1 sm:mt-2";

  // Label: Must match container background (slate-50) to mask the border cleanly
  const labelStyle = "absolute -top-2.5 left-2 bg-slate-50 px-1 text-[10px] font-bold text-blue-600 uppercase tracking-tight flex items-center gap-0.5";

  // Input: White background to POP against the Slate-50 container
  const inputBase = "w-full bg-white border border-slate-300 rounded h-8 sm:h-10 text-center font-bold text-base sm:text-lg text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-slate-300 shadow-sm";

  const handleSubmit = (e) => onSubmit(e, { isDraw: false, isPenalty, penaltyWinner });

  return (
    <div className={containerStyle}>

      {/* HEADER STRIP */}
      <div className={headerStyle}>
        <span className={headerTitleTheme}>MAÇ SKORU</span>
        <div className="bg-red-900/40 border border-red-500/50 rounded px-2 py-0.5">
          <span className="text-[9px] text-red-200 font-bold uppercase flex items-center gap-1">
            <span className="text-red-500">*</span> Zorunlu
          </span>
        </div>
      </div>

      <div className="p-2 sm:p-4 bg-slate-50 text-slate-800">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          {['p1', 'p2'].map((pKey, idx) => (
            <div key={pKey} className={boxStyle}>
              {/* FLOATING LABEL - Matches Gray BG */}
              <div className={labelStyle}>
                {idx === 0 ? "OYUNCU 1" : "OYUNCU 2"}
                <span className="text-red-500">*</span>
              </div>

              <div className="mt-1 mb-4">
                <SearchableSelect
                  value={idx === 0 ? player1 : player2}
                  onChange={idx === 0 ? setPlayer1 : setPlayer2}
                  options={idx === 0 ? playersList : availablePlayer2Options}
                  placeholder="Oyuncu Seçiniz..."
                  required
                />
              </div>

              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <label className="text-[9px] font-bold text-blue-600 uppercase mb-1 block flex items-center gap-0.5 pl-1">
                    SAYI <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={idx === 0 ? score1 : score2}
                    onChange={(e) => idx === 0 ? setScore1(e.target.value) : setScore2(e.target.value)}
                    min={0}
                    placeholder="0"
                    className={inputBase}
                  />
                </div>
                <div className="w-1/3 relative">
                  <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block text-center">
                    EYS
                  </label>
                  <input
                    type="number"
                    value={idx === 0 ? eys1 : eys2}
                    onChange={(e) => idx === 0 ? setEYS1(e.target.value) : setEYS2(e.target.value)}
                    min={0}
                    placeholder="-"
                    className={`${inputBase} text-sm text-slate-500`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ISTAKA ROW */}
        <div className={`mt-3 flex gap-3 ${boxStyle} !mt-4 !pt-5`}>
          <div className={labelStyle}>
            İSTAKA <span className="text-red-500">*</span>
          </div>

          <input
            type="number"
            value={shots}
            onChange={(e) => setShots(e.target.value)}
            min={1}
            className={`${inputBase} flex-1`}
            placeholder="0"
          />

          {/* PENALTY TOGGLE */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <span className="text-[10px] font-bold text-slate-500">PENALTI</span>
            <div
              onClick={() => { setIsPenalty(!isPenalty); if (isPenalty) setPenaltyWinner(null); }}
              className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${isPenalty ? "bg-blue-600" : "bg-slate-300"}`}
            >
              <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${isPenalty ? "left-6" : "left-1"}`}></div>
            </div>
          </div>
        </div>

        {/* PENALTY WINNER SELECTION */}
        {isPenalty && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded animate-in fade-in shadow-inner">
            <div className="flex gap-2">
              {[
                { key: 'p1', label: player1 ? formatPlayerName(playersList.find(p => p.username === player1), playersList) : "1. OYUNCU" },
                { key: 'p2', label: player2 ? formatPlayerName(playersList.find(p => p.username === player2), playersList) : "2. OYUNCU" }
              ].map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPenaltyWinner(p.key)}
                  className={`flex-1 py-2 text-xs font-bold rounded border transition-all ${penaltyWinner === p.key
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-300 hover:border-blue-400"
                    }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-3 bg-red-50 text-red-600 text-xs font-bold p-2.5 rounded text-center border border-red-200 shadow-sm">
            {error}
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 sm:py-3.5 rounded font-bold text-sm uppercase tracking-wide shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span>✓</span>
          {loading ? "KAYDEDİLİYOR..." : "KAYDET"}
        </button>

      </div>
    </div>
  );
}

export default ScoreForm;
