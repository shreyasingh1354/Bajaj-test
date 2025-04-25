
export interface Doctor {
  id: number | string;
  name: string;
  specialties: string[];
  experience: number;
  consultationFee: number;
  clinic?: string;
  location?: string;
  image?: string;
  consultationModes: string[];
}
