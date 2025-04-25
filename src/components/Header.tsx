
import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Doctor } from "@/types/doctor";
import { useNavigate, useLocation } from "react-router-dom";

interface HeaderProps {
  doctors: Doctor[];
  onSearch: (query: string) => void;
}

export default function Header({ doctors, onSearch }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Doctor[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse URL query params to set initial search
    const params = new URLSearchParams(location.search);
    const queryParam = params.get("query");
    if (queryParam) {
      setSearchQuery(queryParam);
    }

    // Close suggestions when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [location.search]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Filter doctors based on search query
    const filteredDoctors = doctors.filter(doctor =>
      doctor.name.toLowerCase().includes(query.toLowerCase())
    );
    
    // Show only top 3 suggestions
    setSuggestions(filteredDoctors.slice(0, 3));
    setShowSuggestions(true);
  };

  const selectDoctor = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    onSearch(query);
    
    // Update URL with search query
    const params = new URLSearchParams(location.search);
    params.set("query", query);
    navigate(`?${params.toString()}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    selectDoctor(searchQuery);
  };

  return (
    <header className="bg-primary w-full p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-center">
        <div className="w-full max-w-2xl relative" ref={searchRef}>
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="text"
                data-testid="autocomplete-input"
                className="w-full px-4 py-2 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Search Symptoms, Doctors, Specialists, Clinics"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => {
                  if (searchQuery && suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute w-full bg-white shadow-lg rounded-b-md mt-1 z-10">
              {suggestions.map((doctor) => (
                <div
                  key={doctor.id}
                  data-testid="suggestion-item"
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                  onClick={() => selectDoctor(doctor.name)}
                >
                  <p className="font-medium">{doctor.name}</p>
                  <p className="text-sm text-gray-500">
                    {doctor.specialties.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
