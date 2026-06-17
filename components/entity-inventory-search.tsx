'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '@/lib/api';
import type { Inventory } from '@/lib/models';

interface EntityInventorySearchProps {
  entityType: 'system' | 'subsystem' | 'module' | 'unit' | 'component';
  entityName: string;
}

export function EntityInventorySearch({ entityType, entityName }: EntityInventorySearchProps) {
  const [inventoryItems, setInventoryItems] = useState<Inventory[]>([]);
  const [filteredItems, setFilteredItems] = useState<Inventory[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const res = await api.inventory.listByType(entityType, 0, 1000);
        setInventoryItems(res.data || []);
        setFilteredItems(res.data || []);
      } catch (err) {
        console.error('Failed to fetch inventory:', err);
        toast.error('Failed to load inventory items');
        setInventoryItems([]);
        setFilteredItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [entityType]);

  useEffect(() => {
    const searchLower = search.toLowerCase();
    const filtered = inventoryItems.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchLower) ||
        item.serial_number?.toLowerCase().includes(searchLower) ||
        item.manufacturer_part_number?.toLowerCase().includes(searchLower) ||
        item.oem_name?.toLowerCase().includes(searchLower)
    );
    setFilteredItems(filtered);
  }, [search, inventoryItems]);

  async function handleUseItem(item: Inventory) {
    if (item.quantity <= 0) {
      toast.error('This item is out of stock');
      return;
    }

    try {
      const newQuantity = item.quantity - 1;
      await api.inventory.update(item.id, {
        ...item,
        quantity: newQuantity,
      });

      toast.success(`Used 1 unit of "${item.name}". Remaining: ${newQuantity}`);

      // Update local state
      const updatedItems = inventoryItems.map((invItem) =>
        invItem.id === item.id ? { ...invItem, quantity: newQuantity } : invItem
      );
      setInventoryItems(updatedItems);
      setFilteredItems(
        filteredItems.map((invItem) =>
          invItem.id === item.id ? { ...invItem, quantity: newQuantity } : invItem
        )
      );
    } catch (err) {
      console.error('Failed to update inventory:', err);
      toast.error('Failed to use inventory item');
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Loading inventory for {entityType}...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>{entityName} - {inventoryItems.length} items available</CardDescription>
          </div>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, serial number, part number, or OEM..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {inventoryItems.length === 0
                ? `No inventory items for ${entityType}s`
                : 'No matching inventory items'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead>OEM</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-sm">{item.serial_number || '—'}</TableCell>
                      <TableCell className="text-sm">{item.manufacturer_part_number || '—'}</TableCell>
                      <TableCell className="text-sm">{item.oem_name || '—'}</TableCell>
                      <TableCell className="text-right font-medium">
                        <span
                          className={`px-2 py-1 rounded ${
                            item.quantity === 0
                              ? 'bg-red-100 text-red-800'
                              : item.quantity <= 5
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={item.quantity === 0 ? 'outline' : 'default'}
                          onClick={() => handleUseItem(item)}
                          disabled={item.quantity === 0}
                        >
                          Use
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
