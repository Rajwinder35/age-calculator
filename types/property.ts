export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  imageUrl: string;
  modelData: {
    floors: number;
    roofType: 'flat' | 'gabled' | 'hipped';
    color: string;
    hasGarage: boolean;
  };
  createdAt: string;
}

export interface PropertyFormData {
  title: string;
  price: number;
  location: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  imageUrl: string;
  floors: number;
  roofType: 'flat' | 'gabled' | 'hipped';
  color: string;
  hasGarage: boolean;
}
