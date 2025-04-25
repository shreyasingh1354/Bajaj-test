
import { Doctor } from "@/types/doctor";

const API_URL = "https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json";

export async function fetchDoctors(): Promise<Doctor[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Failed to fetch doctors data");
    }
    const data = await response.json();
    return ensureValidDoctorData(data);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }
}


function ensureValidDoctorData(data: any[]): Doctor[] {
  return data.map(item => {
 
    const specialties = Array.isArray(item.specialities) 
      ? item.specialities.map(spec => typeof spec === 'object' && spec.name ? spec.name : spec)
      : [];

 
    const consultationModes = [];
    if (item.video_consult) consultationModes.push("Video Consult");
    if (item.in_clinic) consultationModes.push("In Clinic");


    const feeMatch = typeof item.fees === 'string' ? item.fees.match(/\d+/) : null;
    const consultationFee = feeMatch ? parseInt(feeMatch[0], 10) : 0;


    const expMatch = typeof item.experience === 'string' ? item.experience.match(/\d+/) : null;
    const experience = expMatch ? parseInt(expMatch[0], 10) : 0;


    const doctor: Doctor = {
      id: item.id || `doc-${Math.random().toString(36).substr(2, 9)}`,
      name: typeof item.name === 'string' ? item.name : 'Unknown Doctor',
      specialties: specialties,
      experience: experience,
      consultationFee: consultationFee,
      consultationModes: consultationModes,
    };


    if (item.photo && typeof item.photo === 'string') {
      doctor.image = item.photo;
    }


    if (item.clinic) {
      if (typeof item.clinic === 'string') {
        doctor.clinic = item.clinic;
      } else if (typeof item.clinic === 'object' && item.clinic.name) {
        doctor.clinic = item.clinic.name;
        
    
        if (item.clinic.address) {
          const addressParts = [];
          
          if (item.clinic.address.address_line1) addressParts.push(item.clinic.address.address_line1);
          if (item.clinic.address.locality) addressParts.push(item.clinic.address.locality);
          if (item.clinic.address.city) addressParts.push(item.clinic.address.city);
          
          doctor.location = addressParts.join(', ');
        }
      }
    }

    return doctor;
  });
}

export function getAllSpecialties(doctors: Doctor[]): string[] {
  const specialtiesSet = new Set<string>();
  
  doctors.forEach((doctor) => {
    if (Array.isArray(doctor.specialties)) {
      doctor.specialties.forEach((specialty) => {
        if (typeof specialty === 'string') {
          specialtiesSet.add(specialty);
        }
      });
    }
  });
  
  return Array.from(specialtiesSet).sort();
}
