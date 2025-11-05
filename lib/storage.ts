import { Property } from '@/types/property';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'properties.json');

export function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

export function getAllProperties(): Property[] {
  ensureDataFile();
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

export function getPropertyById(id: string): Property | null {
  const properties = getAllProperties();
  return properties.find(p => p.id === id) || null;
}

export function createProperty(property: Omit<Property, 'id' | 'createdAt'>): Property {
  const properties = getAllProperties();
  const newProperty: Property = {
    ...property,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  properties.push(newProperty);
  fs.writeFileSync(DATA_FILE, JSON.stringify(properties, null, 2));
  return newProperty;
}

export function updateProperty(id: string, updates: Partial<Property>): Property | null {
  const properties = getAllProperties();
  const index = properties.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  properties[index] = { ...properties[index], ...updates };
  fs.writeFileSync(DATA_FILE, JSON.stringify(properties, null, 2));
  return properties[index];
}

export function deleteProperty(id: string): boolean {
  const properties = getAllProperties();
  const filtered = properties.filter(p => p.id !== id);
  if (filtered.length === properties.length) return false;
  
  fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2));
  return true;
}
