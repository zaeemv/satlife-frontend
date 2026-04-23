// User
export interface User {
  id: number
  username: string
  email: string
  full_name: string
  is_active: boolean
  created_at: string
  roles: string[]
}

// Customer
export interface Customer {
  id: number
  name: string
  contact_info: string
  created_at: string
}

// Status
export interface Status {
  id: number
  name: string
  description: string
}

// Order
export interface Order {
  id: number
  customer_id: number
  order_number: string
  status_id: number
  created_at: string
  customer?: Customer
  status?: Status
}

// Project
export interface Project {
  id: number
  name: string
  description: string
  start_date: string
  end_date: string
  owner_id: number
  order_id: number
  status_id: number
  created_at: string
  updated_at: string
  owner?: User
  order?: Order
  status?: Status
  systems?: System[]
}

// System (top level in hierarchy)
export interface System {
  id: number
  name: string
  description: string
  project_id: number
  status_id: number
  created_at: string
  project?: Project
  status?: Status
}

// Subsystem
export interface Subsystem {
  id: number
  name: string
  description: string
  system_id: number
  status_id: number
  created_at: string
  system?: System
  status?: Status
}

// Module
export interface Module {
  id: number
  name: string
  description: string
  subsystem_id: number
  status_id: number
  created_at: string
  subsystem?: Subsystem
  status?: Status
}

// Unit
export interface Unit {
  id: number
  name: string
  description: string
  module_id: number
  status_id: number
  created_at: string
  module?: Module
  status?: Status
}

// Component (leaf node in hierarchy)
export interface Component {
  id: number
  name: string
  description: string
  sku: string
  unit_id: number
  status_id: number
  created_at: string
  unit?: Unit
  status?: Status
}

// Inventory
export interface Inventory {
  id: number
  component_id: number
  quantity: number
  location: string
  created_at: string
  component?: Component
}

// Entity (generic resource tracker)
export interface Entity {
  id: number
  entity_type: string
  entity_pk: number
  display_name: string
  status_id: number
  created_at: string
  status?: Status
}

// Entity Status History
export interface EntityStatusHistory {
  id: number
  entity_id: number
  status_id: number
  changed_by: number
  changed_at: string
  notes: string
  entity?: Entity
  status?: Status
  changed_by_user?: User
}

// maintenanceLogs Log
export interface MaintenanceLog {
  id: number
  entity_id: number
  performed_by: number
  notes: string
  performed_at: string
  next_due: string
  created_at: string
  entity?: Entity
  performed_by_user?: User
}
