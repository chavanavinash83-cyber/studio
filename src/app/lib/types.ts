
export type BranchLocation = string;

export type AssetCategory = string;

export type AssetStatus = 'Active' | 'In Warehouse' | 'Under Repair' | 'Disposed';

export interface Asset {
  id: string;
  serialNumber: string;
  name: string;
  brand?: string;
  model?: string;
  category: AssetCategory;
  purchaseDate: string;
  installationDate?: string;
  purchaseValue: number;
  currentBookValue: number;
  previousBookValue?: number;
  lastDepreciationDate?: string;
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
  updatedAt?: any;
}

export interface MasterCategory {
  id: string;
  name: string;
  rate: number;
  life: string;
  method: "WDV" | "Straight Line" | "Purchase Amount" | "No Depreciation";
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
  assetName?: string;
  fromLocation: BranchLocation;
  toLocation: BranchLocation;
  transferDate: string;
  authorizedBy: string;
  remarks: string;
  updatedAt?: any;
}
