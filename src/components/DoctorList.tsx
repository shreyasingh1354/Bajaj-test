
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { fetchDoctors } from "@/api/doctorApi";
import { Doctor } from "@/types/doctor";
import DoctorCard from "@/components/DoctorCard";
import FilterPanel, { FilterState } from "@/components/FilterPanel";
import Header from "@/components/Header";
import { useToast } from "@/components/ui/use-toast";

export default function DoctorList() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const { toast } = useToast();

  // Fetch doctors data
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setIsLoading(true);
        const data = await fetchDoctors();
        setDoctors(data);
        setFilteredDoctors(data);
      } catch (err) {
        setError("Failed to load doctors data. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load doctors data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctors();
  }, [toast]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      applyFilters({ consultationType: [], specialties: [] }, "");
      return;
    }

    const searchResults = doctors.filter((doctor) =>
      doctor.name.toLowerCase().includes(query.toLowerCase())
    );

    setFilteredDoctors(searchResults);
  };

  const applyFilters = (filters: FilterState, sortBy: string) => {
    let results = [...doctors];

    // Apply consultation type filter
    if (filters.consultationType.length > 0) {
      results = results.filter((doctor) =>
        doctor.consultationModes?.some(mode => 
          filters.consultationType.includes(mode)
        )
      );
    }

    // Apply specialty filter
    if (filters.specialties.length > 0) {
      results = results.filter((doctor) =>
        doctor.specialties.some((specialty) =>
          filters.specialties.includes(specialty)
        )
      );
    }

    // Apply search query if present in URL
    const params = new URLSearchParams(location.search);
    const query = params.get("query");
    if (query) {
      results = results.filter((doctor) =>
        doctor.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy === "fees") {
      results.sort((a, b) => a.consultationFee - b.consultationFee);
    } else if (sortBy === "experience") {
      results.sort((a, b) => b.experience - a.experience);
    }

    setFilteredDoctors(results);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header doctors={doctors} onSearch={handleSearch} />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center py-12">Loading doctors data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header doctors={doctors} onSearch={handleSearch} />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center py-12 text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header doctors={doctors} onSearch={handleSearch} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <FilterPanel 
              doctors={doctors}
              onFilterChange={(filters) => applyFilters(filters, "")}
              onSortChange={(sortBy) => applyFilters({ consultationType: [], specialties: [] }, sortBy)}
            />
          </div>
          
          <div className="lg:col-span-3">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                {filteredDoctors.length} {filteredDoctors.length === 1 ? "Doctor" : "Doctors"} available
              </h2>
            </div>

            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))
            ) : (
              <p className="text-center py-8">No doctors match your criteria. Try adjusting your filters.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
