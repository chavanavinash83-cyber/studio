
import { collection, addDoc, serverTimestamp, Firestore } from 'firebase/firestore';
import { Asset, MasterCategory, MaintenanceRecord } from './types';
import { format, subMonths } from 'date-fns';

export async function seedDemoData(db: Firestore) {
  // 1. Seed Firms
  const firms = [
    { 
      name: 'AMBIKA INDUSTRIES PVT LTD', 
      registrationNumber: 'U29100PN2010PTC136789', 
      gstNumber: '27AAAAA0000A1Z5', 
      address: 'Plot No. 12, Narayangaon Industrial Area, Pune 410504',
      contactPerson: 'Director Office',
      phone: '+91 20 2233 4455',
      email: 'hq@ambika.ams'
    }
  ];
  for (const f of firms) {
    await addDoc(collection(db, 'firms'), { ...f, updatedAt: serverTimestamp() });
  }

  // 2. Seed Branches
  const branches = [
    { name: 'Khodad', code: 'KHD', type: 'Admin & Research', location: 'Narayangaon, Pune' },
    { name: 'Manjarwadi', code: 'MNJ', type: 'Logistics Hub', location: 'Manjarwadi, Junnar' },
    { name: 'Sultanpur', code: 'SLT', type: 'IT Center', location: 'Sultanpur, Maharashtra' },
    { name: 'Ghodegaon', code: 'GDN', type: 'Manufacturing', location: 'Ghodegaon, Pune' },
  ];
  for (const b of branches) {
    await addDoc(collection(db, 'branches'), { ...b, updatedAt: serverTimestamp() });
  }

  // 3. Seed Categories
  const categories: Omit<MasterCategory, 'id'>[] = [
    { name: 'Buildings', rate: 5, life: '30', method: 'WDV' },
    { name: 'Vehicles', rate: 15, life: '10', method: 'WDV' },
    { name: 'IT Equipment', rate: 33.33, life: '3', method: 'WDV' },
    { name: 'Electronics Machinery', rate: 15, life: '15', method: 'WDV' },
    { name: 'Furniture', rate: 10, life: '10', method: 'WDV' },
    { name: 'Land', rate: 0, life: 'Infinite', method: 'No Depreciation' },
  ];
  for (const c of categories) {
    await addDoc(collection(db, 'categories'), { ...c, updatedAt: serverTimestamp() });
  }

  // 4. Seed Departments
  const depts = [
    { name: 'Administration', branch: 'Khodad' },
    { name: 'Human Resources', branch: 'Khodad' },
    { name: 'IT Support', branch: 'Sultanpur' },
    { name: 'Logistics', branch: 'Manjarwadi' },
    { name: 'Manufacturing', branch: 'Ghodegaon' },
    { name: 'Quality Control', branch: 'Ghodegaon' },
  ];
  for (const d of depts) {
    await addDoc(collection(db, 'departments'), { ...d, updatedAt: serverTimestamp() });
  }

  // 5. Seed Vendors
  const vendors = [
    { name: 'Dell Enterprise', category: 'IT', contactPerson: 'Kevin Miller', gstNumber: '27AAAAA0000A1Z5' },
    { name: 'Swift Motors', category: 'Vehicles', contactPerson: 'John Swift', gstNumber: '27BBBBB0000B1Z6' },
    { name: 'Precision Tools Ltd', category: 'Machinery', contactPerson: 'Arun Sharma', gstNumber: '27DDDDD0000D1Z8' },
    { name: 'Global Construction', category: 'Real Estate', contactPerson: 'Bob Builder', gstNumber: '27CCCCC0000C1Z7' },
  ];
  for (const v of vendors) {
    await addDoc(collection(db, 'vendors'), { ...v, updatedAt: serverTimestamp() });
  }

  // 6. Seed Assets
  const assetRefs = [];
  const assets: Omit<Asset, 'id'>[] = [
    {
      name: 'Main Server Rack',
      brand: 'Dell',
      serialNumber: 'SRV-KHD-001',
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
      brand: 'Tata',
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
    },
    {
      name: 'CNC Milling Unit',
      brand: 'Haas',
      serialNumber: 'CNC-GDN-101',
      category: 'Electronics Machinery',
      location: 'Ghodegaon',
      department: 'Manufacturing',
      status: 'Active',
      purchaseDate: '2021-03-15',
      purchaseValue: 2500000,
      currentBookValue: 1800000,
      depreciationRate: 15,
      vendorName: 'Precision Tools Ltd'
    }
  ];
  for (const a of assets) {
    const ref = await addDoc(collection(db, 'assets'), { ...a, updatedAt: serverTimestamp() });
    assetRefs.push({ id: ref.id, ...a });
  }

  // 7. Seed Maintenance Records
  const maintenanceRecords: Omit<MaintenanceRecord, 'id'>[] = [
    {
      assetId: assetRefs[1]?.id || 'unknown',
      date: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
      description: 'Engine overhaul and suspension check',
      cost: 45000,
      provider: 'Swift Motors'
    },
    {
      assetId: assetRefs[0]?.id || 'unknown',
      date: format(subMonths(new Date(), 2), 'yyyy-MM-dd'),
      description: 'Server RAM upgrade (64GB)',
      cost: 15000,
      provider: 'Dell Enterprise'
    },
    {
      assetId: assetRefs[3]?.id || 'unknown',
      date: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
      description: 'Annual Calibration and Tooling replacement',
      cost: 75000,
      provider: 'Precision Tools Ltd'
    }
  ];

  for (const m of maintenanceRecords) {
    await addDoc(collection(db, 'maintenance'), { ...m, updatedAt: serverTimestamp() });
  }
}
