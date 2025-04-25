
import { Doctor } from "@/types/doctor";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="mb-4 hover:shadow-lg transition" data-testid="doctor-card">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row">
          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {doctor.image ? (
                <img 
                  src={doctor.image} 
                  alt={doctor.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl text-gray-400">
                  {doctor.name.charAt(0)}
                </span>
              )}
            </div>
          </div>

          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:justify-between">
              <div>
                <h3 className="text-xl font-bold" data-testid="doctor-name">
                  {doctor.name}
                </h3>

                <p className="text-gray-600" data-testid="doctor-specialty">
                  {Array.isArray(doctor.specialties) && doctor.specialties.length > 0 
                    ? doctor.specialties.join(", ") 
                    : "General Practitioner"}
                </p>

                <p className="text-gray-600 mt-1">
                  <span data-testid="doctor-experience">{doctor.experience} yrs exp.</span>
                </p>

                {doctor.clinic && (
                  <p className="text-gray-600 mt-2">
                    {doctor.clinic}
                  </p>
                )}

                {doctor.location && (
                  <p className="text-gray-500 text-sm mt-1">
                    {doctor.location}
                  </p>
                )}
              </div>
              
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-xl font-bold" data-testid="doctor-fee">
                  ₹{doctor.consultationFee}
                </p>
                
                <Button className="mt-4">
                  Book Appointment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
