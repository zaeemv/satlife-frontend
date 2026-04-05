'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from './api';
import * as Models from './models';
import { toast } from 'sonner';

interface DataStoreContextType {
  // Data
  users: Models.User[];
  customers: Models.Customer[];
  orders: Models.Order[];
  projects: Models.Project[];
  systems: Models.System[];
  subsystems: Models.Subsystem[];
  modules: Models.Module[];
  units: Models.Unit[];
  components: Models.Component[];
  inventory: Models.Inventory[];
  statuses: Models.Status[];
  maintenanceLogs: Models.MaintenanceLog[];

  // Loading states
  loading: boolean;
  error: string | null;

  // Users
  getUser: (id: number) => Promise<Models.User>;
  createUser: (data: Partial<Models.User>) => Promise<Models.User>;
  updateUser: (id: number, data: Partial<Models.User>) => Promise<Models.User>;
  deleteUser: (id: number) => Promise<void>;

  // Customers
  getCustomer: (id: number) => Promise<Models.Customer>;
  createCustomer: (data: Partial<Models.Customer>) => Promise<Models.Customer>;
  updateCustomer: (id: number, data: Partial<Models.Customer>) => Promise<Models.Customer>;
  deleteCustomer: (id: number) => Promise<void>;

  // Orders
  getOrder: (id: number) => Promise<Models.Order>;
  createOrder: (data: Partial<Models.Order>) => Promise<Models.Order>;
  updateOrder: (id: number, data: Partial<Models.Order>) => Promise<Models.Order>;
  deleteOrder: (id: number) => Promise<void>;

  // Projects
  getProject: (id: number) => Promise<Models.Project>;
  createProject: (data: Partial<Models.Project>) => Promise<Models.Project>;
  updateProject: (id: number, data: Partial<Models.Project>) => Promise<Models.Project>;
  deleteProject: (id: number) => Promise<void>;
  getProjectSystems: (projectId: number) => Promise<Models.System[]>;

  // Systems
  getSystem: (id: number) => Promise<Models.System>;
  createSystem: (data: Partial<Models.System>) => Promise<Models.System>;
  updateSystem: (id: number, data: Partial<Models.System>) => Promise<Models.System>;
  deleteSystem: (id: number) => Promise<void>;
  getSystemSubsystems: (systemId: number) => Promise<Models.Subsystem[]>;

  // Subsystems
  getSubsystem: (id: number) => Promise<Models.Subsystem>;
  createSubsystem: (data: Partial<Models.Subsystem>) => Promise<Models.Subsystem>;
  updateSubsystem: (id: number, data: Partial<Models.Subsystem>) => Promise<Models.Subsystem>;
  deleteSubsystem: (id: number) => Promise<void>;
  getSubsystemModules: (subsystemId: number) => Promise<Models.Module[]>;

  // Modules
  getModule: (id: number) => Promise<Models.Module>;
  createModule: (data: Partial<Models.Module>) => Promise<Models.Module>;
  updateModule: (id: number, data: Partial<Models.Module>) => Promise<Models.Module>;
  deleteModule: (id: number) => Promise<void>;
  getModuleUnits: (moduleId: number) => Promise<Models.Unit[]>;

  // Units
  getUnit: (id: number) => Promise<Models.Unit>;
  createUnit: (data: Partial<Models.Unit>) => Promise<Models.Unit>;
  updateUnit: (id: number, data: Partial<Models.Unit>) => Promise<Models.Unit>;
  deleteUnit: (id: number) => Promise<void>;
  getUnitComponents: (unitId: number) => Promise<Models.Component[]>;

  // Components
  getComponent: (id: number) => Promise<Models.Component>;
  createComponent: (data: Partial<Models.Component>) => Promise<Models.Component>;
  updateComponent: (id: number, data: Partial<Models.Component>) => Promise<Models.Component>;
  deleteComponent: (id: number) => Promise<void>;

  // Inventory
  getInventoryItem: (id: number) => Promise<Models.Inventory>;
  createInventoryItem: (data: Partial<Models.Inventory>) => Promise<Models.Inventory>;
  updateInventoryItem: (id: number, data: Partial<Models.Inventory>) => Promise<Models.Inventory>;
  deleteInventoryItem: (id: number) => Promise<void>;

  // Statuses
  createStatus: (data: Partial<Models.Status>) => Promise<Models.Status>;
  updateStatus: (id: number, data: Partial<Models.Status>) => Promise<Models.Status>;
  deleteStatus: (id: number) => Promise<void>;

  // Maintenance
  createMaintenanceLog: (data: Partial<Models.MaintenanceLog>) => Promise<Models.MaintenanceLog>;
  getEntityMaintenanceLogs: (entityId: number) => Promise<Models.MaintenanceLog[]>;
  getEntityStatusHistory: (entityId: number) => Promise<Models.EntityStatusHistory[]>;

  // Refresh
  refreshData: () => Promise<void>;
}

const DataStoreContext = createContext<DataStoreContextType | undefined>(undefined);

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<Models.User[]>([]);
  const [customers, setCustomers] = useState<Models.Customer[]>([]);
  const [orders, setOrders] = useState<Models.Order[]>([]);
  const [projects, setProjects] = useState<Models.Project[]>([]);
  const [systems, setSystems] = useState<Models.System[]>([]);
  const [subsystems, setSubsystems] = useState<Models.Subsystem[]>([]);
  const [modules, setModules] = useState<Models.Module[]>([]);
  const [units, setUnits] = useState<Models.Unit[]>([]);
  const [components, setComponents] = useState<Models.Component[]>([]);
  const [inventory, setInventory] = useState<Models.Inventory[]>([]);
  const [statuses, setStatuses] = useState<Models.Status[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<Models.MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      setLoading(true);
      const [usersRes, customersRes, ordersRes, projectsRes, systemsRes, subsystemsRes, modulesRes, unitsRes, componentsRes, inventoryRes, statusesRes, maintenanceRes] =
        await Promise.all([
          api.users.list(0, 100),
          api.customers.list(0, 100),
          api.orders.list(0, 100),
          api.projects.list(0, 100),
          api.systems.list(0, 100),
          api.subsystems.list(0, 100),
          api.modules.list(0, 100),
          api.units.list(0, 100),
          api.components.list(0, 100),
          api.inventory.list(0, 100),
          api.statuses.list(0, 100),
          api.maintenanceLogs.list(0, 100),
        ]);

      setUsers(usersRes.data);
      setCustomers(customersRes.data);
      setOrders(ordersRes.data);
      setProjects(projectsRes.data);
      setSystems(systemsRes.data);
      setSubsystems(subsystemsRes.data);
      setModules(modulesRes.data);
      setUnits(unitsRes.data);
      setComponents(componentsRes.data);
      setInventory(inventoryRes.data);
      setStatuses(statusesRes.data);
      setMaintenanceLogs(maintenanceRes.data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Users
  const getUser = async (id: number) => {
    try {
      const res = await api.users.get(id);
      return res.data;
    } catch (err) {
      toast.error('Failed to fetch user');
      throw err;
    }
  };

  const createUser = async (data: Partial<Models.User>) => {
    try {
      const res = await api.users.create(data);
      setUsers([...users, res.data]);
      toast.success('User created successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to create user');
      throw err;
    }
  };

  const updateUser = async (id: number, data: Partial<Models.User>) => {
    try {
      const res = await api.users.update(id, data);
      setUsers(users.map((u) => (u.id === id ? res.data : u)));
      toast.success('User updated successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to update user');
      throw err;
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await api.users.delete(id);
      setUsers(users.filter((u) => u.id !== id));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error('Failed to delete user');
      throw err;
    }
  };

  // Customers
  const getCustomer = async (id: number) => {
    try {
      const res = await api.customers.get(id);
      return res.data;
    } catch (err) {
      toast.error('Failed to fetch customer');
      throw err;
    }
  };

  const createCustomer = async (data: Partial<Models.Customer>) => {
    try {
      const res = await api.customers.create(data);
      setCustomers([...customers, res.data]);
      toast.success('Customer created successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to create customer');
      throw err;
    }
  };

  const updateCustomer = async (id: number, data: Partial<Models.Customer>) => {
    try {
      const res = await api.customers.update(id, data);
      setCustomers(customers.map((c) => (c.id === id ? res.data : c)));
      toast.success('Customer updated successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to update customer');
      throw err;
    }
  };

  const deleteCustomer = async (id: number) => {
    try {
      await api.customers.delete(id);
      setCustomers(customers.filter((c) => c.id !== id));
      toast.success('Customer deleted successfully');
    } catch (err) {
      toast.error('Failed to delete customer');
      throw err;
    }
  };

  // Orders
  const getOrder = async (id: number) => {
    try {
      const res = await api.orders.get(id);
      return res.data;
    } catch (err) {
      toast.error('Failed to fetch order');
      throw err;
    }
  };

  const createOrder = async (data: Partial<Models.Order>) => {
    try {
      const res = await api.orders.create(data);
      setOrders([...orders, res.data]);
      toast.success('Order created successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to create order');
      throw err;
    }
  };

  const updateOrder = async (id: number, data: Partial<Models.Order>) => {
    try {
      const res = await api.orders.update(id, data);
      setOrders(orders.map((o) => (o.id === id ? res.data : o)));
      toast.success('Order updated successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to update order');
      throw err;
    }
  };

  const deleteOrder = async (id: number) => {
    try {
      await api.orders.delete(id);
      setOrders(orders.filter((o) => o.id !== id));
      toast.success('Order deleted successfully');
    } catch (err) {
      toast.error('Failed to delete order');
      throw err;
    }
  };

  // Projects
  const getProject = async (id: number) => {
    try {
      const res = await api.projects.get(id);
      return res.data;
    } catch (err) {
      toast.error('Failed to fetch project');
      throw err;
    }
  };

  const createProject = async (data: Partial<Models.Project>) => {
    try {
      const res = await api.projects.create(data);
      setProjects([...projects, res.data]);
      toast.success('Project created successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to create project');
      throw err;
    }
  };

  const updateProject = async (id: number, data: Partial<Models.Project>) => {
    try {
      const res = await api.projects.update(id, data);
      setProjects(projects.map((p) => (p.id === id ? res.data : p)));
      toast.success('Project updated successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to update project');
      throw err;
    }
  };

  const deleteProject = async (id: number) => {
    try {
      await api.projects.delete(id);
      setProjects(projects.filter((p) => p.id !== id));
      toast.success('Project deleted successfully');
    } catch (err) {
      toast.error('Failed to delete project');
      throw err;
    }
  };

  const getProjectSystems = async (projectId: number) => {
    try {
      const res = await api.projects.getSystems(projectId);
      return res.data;
    } catch (err) {
      toast.error('Failed to fetch project systems');
      throw err;
    }
  };

  // Systems
  const getSystem = async (id: number) => {
    try {
      const res = await api.systems.get(id);
      return res.data;
    } catch (err) {
      toast.error('Failed to fetch system');
      throw err;
    }
  };

  const createSystem = async (data: Partial<Models.System>) => {
    try {
      const res = await api.systems.create(data);
      setSystems([...systems, res.data]);
      toast.success('System created successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to create system');
      throw err;
    }
  };

  const updateSystem = async (id: number, data: Partial<Models.System>) => {
    try {
      const res = await api.systems.update(id, data);
      setSystems(systems.map((s) => (s.id === id ? res.data : s)));
      toast.success('System updated successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to update system');
      throw err;
    }
  };

  const deleteSystem = async (id: number) => {
    try {
      await api.systems.delete(id);
      setSystems(systems.filter((s) => s.id !== id));
      toast.success('System deleted successfully');
    } catch (err) {
      toast.error('Failed to delete system');
      throw err;
    }
  };

  const getSystemSubsystems = async (systemId: number) => {
    try {
      const res = await api.systems.getSubsystems(systemId);
      return res.data;
    } catch (err) {
      toast.error('Failed to fetch system subsystems');
      throw err;
    }
  };

  // Subsystems
  const getSubsystem = async (id: number) => {
    try {
      const res = await api.subsystems.get(id);
      return res.data;
    } catch (err) {
      toast.error('Failed to fetch subsystem');
      throw err;
    }
  };

  const createSubsystem = async (data: Partial<Models.Subsystem>) => {
    try {
      const res = await api.subsystems.create(data);
      setSubsystems([...subsystems, res.data]);
      toast.success('Subsystem created successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to create subsystem');
      throw err;
    }
  };

  const updateSubsystem = async (id: number, data: Partial<Models.Subsystem>) => {
    try {
      const res = await api.subsystems.update(id, data);
      setSubsystems(subsystems.map((s) => (s.id === id ? res.data : s)));
      toast.success('Subsystem updated successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to update subsystem');
      throw err;
    }
  };

  const deleteSubsystem = async (id: number) => {
    try {
      await api.subsystems.delete(id);
      setSubsystems(subsystems.filter((s) => s.id !== id));
      toast.success('Subsystem deleted successfully');
    } catch (err) {
      toast.error('Failed to delete subsystem');
      throw err;
    }
  };

  const getSubsystemModules = async (subsystemId: number) => {
    try {
      const res = await api.subsystems.getModules(subsystemId);
      return res.data;
    } catch (err) {
      toast.error('Failed to fetch subsystem modules');
      throw err;
    }
  };

  // Modules
  const getModule = async (id: number) => {
    try {
      const res = await api.modules.get(id);
      return res.data;
    } catch (err) {
      toast.error('Failed to fetch module');
      throw err;
    }
  };

  const createModule = async (data: Partial<Models.Module>) => {
    try {
      const res = await api.modules.create(data);
      setModules([...modules, res.data]);
      toast.success('Module created successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to create module');
      throw err;
    }
  };

  const updateModule = async (id: number, data: Partial<Models.Module>) => {
    try {
      const res = await api.modules.update(id, data);
      setModules(modules.map((m) => (m.id === id ? res.data : m)));
      toast.success('Module updated successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to update module');
      throw err;
    }
  };

  const deleteModule = async (id: number) => {
    try {
      await api.modules.delete(id);
      setModules(modules.filter((m) => m.id !== id));
      toast.success('Module deleted successfully');
    } catch (err) {
      toast.error('Failed to delete module');
      throw err;
    }
  };

  const getModuleUnits = async (moduleId: number) => {
    try {
      const res = await api.modules.getUnits(moduleId);
      return res.data;
    } catch (err) {
      toast.error('Failed to fetch module units');
      throw err;
    }
  };

  // Units
  const getUnit = async (id: number) => {
    try {
      const res = await api.units.get(id);
      return res.data;
    } catch (err) {
      toast.error('Failed to fetch unit');
      throw err;
    }
  };

  const createUnit = async (data: Partial<Models.Unit>) => {
    try {
      const res = await api.units.create(data);
      setUnits([...units, res.data]);
      toast.success('Unit created successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to create unit');
      throw err;
    }
  };

  const updateUnit = async (id: number, data: Partial<Models.Unit>) => {
    try {
      const res = await api.units.update(id, data);
      setUnits(units.map((u) => (u.id === id ? res.data : u)));
      toast.success('Unit updated successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to update unit');
      throw err;
    }
  };

  const deleteUnit = async (id: number) => {
    try {
      await api.units.delete(id);
      setUnits(units.filter((u) => u.id !== id));
      toast.success('Unit deleted successfully');
    } catch (err) {
      toast.error('Failed to delete unit');
      throw err;
    }
  };

  const getUnitComponents = async (unitId: number) => {
    try {
      const res = await api.units.getComponents(unitId);
      return res.data;
    } catch (err) {
      toast.error('Failed to fetch unit components');
      throw err;
    }
  };

  // Components
  const getComponent = async (id: number) => {
    try {
      const res = await api.components.get(id);
      return res.data;
    } catch (err) {
      toast.error('Failed to fetch component');
      throw err;
    }
  };

  const createComponent = async (data: Partial<Models.Component>) => {
    try {
      const res = await api.components.create(data);
      setComponents([...components, res.data]);
      toast.success('Component created successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to create component');
      throw err;
    }
  };

  const updateComponent = async (id: number, data: Partial<Models.Component>) => {
    try {
      const res = await api.components.update(id, data);
      setComponents(components.map((c) => (c.id === id ? res.data : c)));
      toast.success('Component updated successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to update component');
      throw err;
    }
  };

  const deleteComponent = async (id: number) => {
    try {
      await api.components.delete(id);
      setComponents(components.filter((c) => c.id !== id));
      toast.success('Component deleted successfully');
    } catch (err) {
      toast.error('Failed to delete component');
      throw err;
    }
  };

  // Inventory
  const getInventoryItem = async (id: number) => {
    try {
      const res = await api.inventory.get(id);
      return res.data;
    } catch (err) {
      toast.error('Failed to fetch inventory item');
      throw err;
    }
  };

  const createInventoryItem = async (data: Partial<Models.Inventory>) => {
    try {
      const res = await api.inventory.create(data);
      setInventory([...inventory, res.data]);
      toast.success('Inventory item created successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to create inventory item');
      throw err;
    }
  };

  const updateInventoryItem = async (id: number, data: Partial<Models.Inventory>) => {
    try {
      const res = await api.inventory.update(id, data);
      setInventory(inventory.map((inv) => (inv.id === id ? res.data : inv)));
      toast.success('Inventory item updated successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to update inventory item');
      throw err;
    }
  };

  const deleteInventoryItem = async (id: number) => {
    try {
      await api.inventory.delete(id);
      setInventory(inventory.filter((inv) => inv.id !== id));
      toast.success('Inventory item deleted successfully');
    } catch (err) {
      toast.error('Failed to delete inventory item');
      throw err;
    }
  };

  // Statuses
  const createStatus = async (data: Partial<Models.Status>) => {
    try {
      const res = await api.statuses.create(data);
      setStatuses([...statuses, res.data]);
      toast.success('Status created successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to create status');
      throw err;
    }
  };

  const updateStatus = async (id: number, data: Partial<Models.Status>) => {
    try {
      const res = await api.statuses.update(id, data);
      setStatuses(statuses.map((s) => (s.id === id ? res.data : s)));
      toast.success('Status updated successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to update status');
      throw err;
    }
  };

  const deleteStatus = async (id: number) => {
    try {
      await api.statuses.delete(id);
      setStatuses(statuses.filter((s) => s.id !== id));
      toast.success('Status deleted successfully');
    } catch (err) {
      toast.error('Failed to delete status');
      throw err;
    }
  };

  // Maintenance
  const createMaintenanceLog = async (data: Partial<Models.MaintenanceLog>) => {
    try {
      const res = await api.maintenanceLogs.create(data);
      setMaintenanceLogs([...maintenanceLogs, res.data]);
      toast.success('Maintenance log created successfully');
      return res.data;
    } catch (err) {
      toast.error('Failed to create maintenance log');
      throw err;
    }
  };

  const getEntityMaintenanceLogs = async (entityId: number) => {
    try {
      const res = await api.entities.getMaintenanceLogs(entityId);
      return res.data;
    } catch (err) {
      toast.error('Failed to fetch maintenance logs');
      throw err;
    }
  };

  const getEntityStatusHistory = async (entityId: number) => {
    try {
      const res = await api.entities.getStatusHistory(entityId);
      return res.data;
    } catch (err) {
      toast.error('Failed to fetch status history');
      throw err;
    }
  };

  const value: DataStoreContextType = {
    users,
    customers,
    orders,
    projects,
    systems,
    subsystems,
    modules,
    units,
    components,
    inventory,
    statuses,
    maintenanceLogs,
    loading,
    error,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getProjectSystems,
    getSystem,
    createSystem,
    updateSystem,
    deleteSystem,
    getSystemSubsystems,
    getSubsystem,
    createSubsystem,
    updateSubsystem,
    deleteSubsystem,
    getSubsystemModules,
    getModule,
    createModule,
    updateModule,
    deleteModule,
    getModuleUnits,
    getUnit,
    createUnit,
    updateUnit,
    deleteUnit,
    getUnitComponents,
    getComponent,
    createComponent,
    updateComponent,
    deleteComponent,
    getInventoryItem,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    createStatus,
    updateStatus,
    deleteStatus,
    createMaintenanceLog,
    getEntityMaintenanceLogs,
    getEntityStatusHistory,
    refreshData,
  };

  return <DataStoreContext.Provider value={value}>{children}</DataStoreContext.Provider>;
}

export function useDataStore() {
  const context = useContext(DataStoreContext);
  if (!context) {
    throw new Error('useDataStore must be used within DataStoreProvider');
  }
  return context;
}
