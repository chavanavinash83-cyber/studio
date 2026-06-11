
export type BranchLocation = 'Khodad' | 'Manjarwadi' | 'Sultanpur' | 'Ghodegaon';

export type AssetCategory = 'Buildings' | 'Building Lands' | 'Vehicles' | 'Electronics Machinery' | 'IT Equipment';

export type AssetStatus = 'Active' | 'In Warehouse' | 'Under Repair' | 'Disposed';

export interface Asset {
  id: string;
  serialNumber: string;
  name: string;
  model?: string;
  category: AssetCategory;
  purchaseDate: string;
  installationDate?: string;
  purchaseValue: number;
  currentBookValue: number;
  location: BranchLocation;
  department: string;
  status: AssetStatus;
  warrantyPeriodMonths?: number;
  warrantyExpiry?: string;
  vendorName?: string;
  lastAuditDate?: string;
  depreciationRate: number; // 5, 10, 15, or 33.33
  assetPhotoUrl?: string;
  invoiceUrl?: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  date: string;
  description: string;
  cost: number;
  provider: string;
}

export interface TransferRecord {
  id: string;
  assetId: string;
  fromLocation: BranchLocation;
  toLocation: BranchLocation;
  transferDate: string;
  authorizedBy: string;
  remarks: string;
}
