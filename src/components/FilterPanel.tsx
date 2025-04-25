
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Doctor } from "@/types/doctor";

interface FilterPanelProps {
  doctors: Doctor[];
  onFilterChange: (filters: FilterState) => void;
  onSortChange: (sortBy: string) => void;
}

export interface FilterState {
  consultationType: string[];
  specialties: string[];
}

export default function FilterPanel({ doctors, onFilterChange, onSortChange }: FilterPanelProps) {
  const [filterState, setFilterState] = useState<FilterState>({
    consultationType: [],
    specialties: [],
  });
  const [sortBy, setSortBy] = useState<string>("");
  const [allSpecialties, setAllSpecialties] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    specialties: true,
    consultationType: true,
    sort: true,
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Extract unique specialties
  useEffect(() => {
    const specialtiesSet = new Set<string>();
    doctors.forEach(doctor => {
      doctor.specialties.forEach(specialty => {
        specialtiesSet.add(specialty);
      });
    });

    setAllSpecialties(Array.from(specialtiesSet).sort());
  }, [doctors]);

  // Parse URL parameters on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Get consultation types from URL
    const consultationTypes = params.getAll("consultationType");
    
    // Get specialties from URL
    const specialties = params.getAll("specialty");
    
    // Get sort option from URL
    const sortOption = params.get("sortBy") || "";

    setFilterState({
      consultationType: consultationTypes,
      specialties: specialties,
    });
    
    setSortBy(sortOption);
    
    // Apply filters from URL
    onFilterChange({
      consultationType: consultationTypes,
      specialties: specialties,
    });
    
    // Apply sort from URL
    if (sortOption) {
      onSortChange(sortOption);
    }
  }, [location.search, onFilterChange, onSortChange]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateFilters = (
    filterType: keyof FilterState,
    value: string,
    isRadio = false
  ) => {
    let newFilters: FilterState;

    if (isRadio) {
      // For radio buttons, replace the entire array
      newFilters = {
        ...filterState,
        [filterType]: [value]
      };
    } else {
      // For checkboxes, toggle the value
      const currentValues = filterState[filterType];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value];

      newFilters = {
        ...filterState,
        [filterType]: newValues
      };
    }

    setFilterState(newFilters);
    onFilterChange(newFilters);
    updateURLParams(newFilters, sortBy);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onSortChange(value);
    updateURLParams(filterState, value);
  };

  const updateURLParams = (filters: FilterState, sort: string) => {
    const params = new URLSearchParams(location.search);
    
    // Clear existing filter params
    params.delete("consultationType");
    params.delete("specialty");
    params.delete("sortBy");
    
    // Preserve search query if exists
    const query = params.get("query");
    params.delete("query");
    if (query) {
      params.set("query", query);
    }
    
    // Add consultation types
    filters.consultationType.forEach(type => {
      params.append("consultationType", type);
    });
    
    // Add specialties
    filters.specialties.forEach(specialty => {
      params.append("specialty", specialty);
    });
    
    // Add sort option
    if (sort) {
      params.set("sortBy", sort);
    }
    
    navigate(`?${params.toString()}`, { replace: true });
  };

  const clearAllFilters = () => {
    const newFilters = {
      consultationType: [],
      specialties: [],
    };
    setFilterState(newFilters);
    setSortBy("");
    onFilterChange(newFilters);
    onSortChange("");

    const params = new URLSearchParams(location.search);
    const query = params.get("query");
    
    if (query) {
      navigate(`?query=${query}`, { replace: true });
    } else {
      navigate("", { replace: true });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Filter size={18} />
          <h2 className="text-lg font-semibold ml-2">Filters</h2>
        </div>
        <button 
          className="text-primary text-sm hover:underline"
          onClick={clearAllFilters}
        >
          Clear All
        </button>
      </div>

      {/* Sort Options */}
      <div className="mb-4 border-b pb-4">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("sort")}
          data-testid="filter-header-sort"
        >
          <h3 className="font-medium">Sort by</h3>
          {expandedSections.sort ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        
        {expandedSections.sort && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="sort-fees"
                data-testid="sort-fees"
                name="sort"
                checked={sortBy === "fees"}
                onChange={() => handleSortChange("fees")}
                className="mr-2"
              />
              <label htmlFor="sort-fees">Price: Low-High</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="sort-experience"
                data-testid="sort-experience"
                name="sort"
                checked={sortBy === "experience"}
                onChange={() => handleSortChange("experience")}
                className="mr-2"
              />
              <label htmlFor="sort-experience">Experience: Most Experience first</label>
            </div>
          </div>
        )}
      </div>

      {/* Consultation Type */}
      <div className="mb-4 border-b pb-4">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("consultationType")}
          data-testid="filter-header-moc"
        >
          <h3 className="font-medium">Mode of consultation</h3>
          {expandedSections.consultationType ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        
        {expandedSections.consultationType && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center">
              <input
                type="radio"
                id="video-consult"
                data-testid="filter-video-consult"
                name="consultationType"
                checked={filterState.consultationType.includes("Video Consult")}
                onChange={() => updateFilters("consultationType", "Video Consult", true)}
                className="mr-2"
              />
              <label htmlFor="video-consult">Video Consult</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="in-clinic"
                data-testid="filter-in-clinic"
                name="consultationType"
                checked={filterState.consultationType.includes("In Clinic")}
                onChange={() => updateFilters("consultationType", "In Clinic", true)}
                className="mr-2"
              />
              <label htmlFor="in-clinic">In Clinic</label>
            </div>
          </div>
        )}
      </div>

      {/* Specialties */}
      <div className="mb-4">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("specialties")}
          data-testid="filter-header-speciality"
        >
          <h3 className="font-medium">Specialties</h3>
          {expandedSections.specialties ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        
        {expandedSections.specialties && (
          <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
            {allSpecialties.map(specialty => (
              <div key={specialty} className="flex items-center">
                <input
                  type="checkbox"
                  id={`specialty-${specialty}`}
                  data-testid={`filter-specialty-${specialty}`}
                  checked={filterState.specialties.includes(specialty)}
                  onChange={() => updateFilters("specialties", specialty)}
                  className="mr-2"
                />
                <label htmlFor={`specialty-${specialty}`}>{specialty}</label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
