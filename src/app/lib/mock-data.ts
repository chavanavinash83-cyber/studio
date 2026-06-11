
import { Asset } from './types';

export const MOCK_ASSETS: Asset[] = [
  {
    id: 'ASSET-001',
    serialNumber: 'BLD-KH-001',
    name: 'Main Admin Building',
    category: 'Buildings',
    purchaseDate: '2015-06-15',
    purchaseValue: 5000000,
    currentBookValue: 3850000,
    location: 'Khodad',
    department: 'Administration',
    status: 'Active',
    depreciationRate: 5,
    vendorName: 'Global Construction Corp'
  },
  {
    id: 'ASSET-002',
    serialNumber: 'VEH-MN-022',
    name: 'Logistics Van 4',
    category: 'Vehicles',
    purchaseDate: '2022-11-20',
    purchaseValue: 25000,
    currentBookValue: 18500,
    location: 'Manjarwadi',
    department: 'Logistics',
    status: 'Active',
    depreciationRate: 15,
    warrantyExpiry: '2025-11-20',
    vendorName: 'Swift Motors'
  },
  {
    id: 'ASSET-003',
    serialNumber: 'IT-SL-505',
    name: 'High Performance Server R740',
    category: 'IT Equipment',
    purchaseDate: '2023-01-10',
    purchaseValue: 12000,
    currentBookValue: 8000,
    location: 'Sultanpur',
    department: 'IT',
    status: 'Active',
    depreciationRate: 33.33,
    warrantyExpiry: '2026-01-10',
    vendorName: 'Dell Enterprise'
  },
  {
    id: 'ASSET-004',
    serialNumber: 'MAC-GH-101',
    name: 'CNC Milling Machine',
    category: 'Electronics Machinery',
    purchaseDate: '2020-03-05',
    purchaseValue: 150000,
    currentBookValue: 95000,
    location: 'Ghodegaon',
    department: 'Manufacturing',
    status: 'Under Repair',
    depreciationRate: 15,
    vendorName: 'Precision Tools Ltd'
  },
  {
    id: 'ASSET-005',
    serialNumber: 'LND-KH-99',
    name: 'East Expansion Plot',
    category: 'Building Lands',
    purchaseDate: '2010-01-01',
    purchaseValue: 1200000,
    currentBookValue: 1200000, // Land usually doesn't depreciate
    location: 'Khodad',
    department: 'Real Estate',
    status: 'Active',
    depreciationRate: 0,
    vendorName: 'Local Authority'
  }
];
