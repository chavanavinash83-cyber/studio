
import { collection, addDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { Asset, MasterCategory, AssetStatus } from './types';

export async function seedDemoData(db: Firestore) {
  // 1. Seed Branches
  const branches = [
    { name: 'Khodad', code: 'KHD', type: 'Admin & Research', location: 'Narayangaon, Pune' },
    { name: 'Manjarwadi', code: 'MNJ', type: 'Logistics Hub', location: 'Manjarwadi, Junnar' },
    { name: 'Sultanpur', code: 'SLT', type: 'IT Center', location: 'Sultanpur, Maharashtra' },
    { name: 'Ghodegaon', code: 'GDN', type: 'Manufacturing', location: 'Ghodegaon, Pune' },
  ];
  for (const b of branches) {
    await addDoc(collection(db, 'branches'), { ...b, updatedAt: serverTimestamp() });
  }

  // 2. Seed Categories
  const categories: Omit<MasterCategory, 'id'>[] = [
    { name: 'Buildings', rate: 5, life: '30', method: 'WDV' },
    { name: 'Vehicles', rate: 15, life: '10', method: 'WDV' },
    { name: 'IT Equipment', rate: 33.33, life: '3', method: 'WDV' },
    { name: 'Electronics Machinery', rate: 15, life: '15', method: 'WDV' },
    { name: 'Land', rate: 0, life: 'Infinite', method: 'No Depreciation' },
  ];
  for (const c of categories) {
    await addDoc(collection(db, 'categories'), { ...c, updatedAt: serverTimestamp() });
  }

  // 3. Seed Departments
  const depts = [
    { name: 'Administration', head: 'Rajesh Patil', costCenter: 'ADM-001' },
    { name: 'IT Support', head: 'Sandeep Varma', costCenter: 'IT-404' },
    { name: 'Logistics', head: 'Amit Shinde', costCenter: 'LOG-777' },
    { name: 'Manufacturing', head: 'Sanjay Kale', costCenter: 'MFG-501' },
  ];
  for (const d of depts) {
    await addDoc(collection(db, 'departments'), { ...d, updatedAt: serverTimestamp() });
  }

  // 4. Seed Vendors
  const vendors = [
    { name: 'Dell Enterprise', category: 'IT', contactPerson: 'Kevin Miller', gstNumber: '27AAAAA0000A1Z5' },
    { name: 'Swift Motors', category: 'Vehicles', contactPerson: 'John Swift', gstNumber: '27BBBBB0000B1Z6' },
    { name: 'Global Construction', category: 'Real Estate', contactPerson: 'Bob Builder', gstNumber: '27CCCCC0000C1Z7' },
  ];
  for (const v of vendors) {
    await addDoc(collection(db, 'vendors'), { ...v, updatedAt: serverTimestamp() });
  }

  // 5. Seed Assets
  const assets: Omit<Asset, 'id'>[] = [
    {
      name: 'Main Server Rack',
      serialNumber: 'SRV-001',
      model: 'PowerEdge R740',
      category: 'IT Equipment',
      location: 'Sultanpur',
      department: 'IT Support',
      status: 'Active',
      purchaseDate: '2023-01-10',
      installationDate: '2023-01-15',
      purchaseValue: 850000,
      currentBookValue: 600000,
      depreciationRate: 33.33,
      warrantyPeriodMonths: 36,
      warrantyExpiry: '2026-01-10',
      vendorName: 'Dell Enterprise'
    },
    {
      name: 'Logistics Van 1',
      serialNumber: 'MH-14-GH-1234',
      model: 'Tata Ace',
      category: 'Vehicles',
      location: 'Manjarwadi',
      department: 'Logistics',
      status: 'Under Repair',
      purchaseDate: '2022-05-20',
      installationDate: '2022-05-22',
      purchaseValue: 650000,
      currentBookValue: 480000,
      depreciationRate: 15,
      warrantyPeriodMonths: 24,
      warrantyExpiry: '2024-05-20',
      vendorName: 'Swift Motors'
    },
    {
      name: 'Office Building A',
      serialNumber: 'BLD-001',
      category: 'Buildings',
      location: 'Khodad',
      department: 'Administration',
      status: 'Active',
      purchaseDate: '2015-06-01',
      installationDate: '2015-08-01',
      purchaseValue: 5000000,
      currentBookValue: 3200000,
      depreciationRate: 5,
      vendorName: 'Global Construction'
    }
  ];
  for (const a of assets) {
    await addDoc(collection(db, 'assets'), { ...a, updatedAt: serverTimestamp() });
  }
}
