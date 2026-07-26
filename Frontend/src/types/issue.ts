export interface IssueCreate {
  issueDate: string;
  issuedTo: string;
  notes?: string;
  items: IssueItemCreate[];
}

export interface IssueItemCreate {
  inventoryItemId: number;
  quantity: number; // This will be converted to decimal on backend
}

export interface IssueUpdate {
  issueDate?: string;
  issuedTo?: string;
  notes?: string;
  items: IssueItemCreate[];
}

export interface IssueResponse {
  id: number;
  issueDate: string;
  issuedTo: string;
  notes?: string;
  items: IssueItemResponse[];
  createdBy?: string;
  createdAt: string;
  totalItems: number;
  totalValue: number;
}

export interface IssueItemResponse {
  id: number;
  inventoryItemId: number;
  itemName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  subtotal: number;
}

export interface ProductionUpdate {
  productionDate?: string;
  notes?: string;
  items: ProductionItemUpdate[];
}

export interface ProductionItemUpdate {
  productId: number;
  quantity: number;
  wasteQuantity?: number;
}

export interface ProductionStats {
  totalProductions: number;
  totalItemsProduced: number;
  totalWaste: number;
  totalCost: number;
  dailyAverage: number;
  topProducts: TopProduct[];
  wasteByDay: WasteByDay[];
}

export interface TopProduct {
  productId: number;
  productName: string;
  totalQuantity: number;
  totalCost: number;
}

export interface WasteByDay {
  date: string;
  wasteCount: number;
}
