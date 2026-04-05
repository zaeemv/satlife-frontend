"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  Network,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { hierarchyRules as initialRules, type HierarchyRule } from "@/lib/dummy-data";

export default function HierarchyPage() {
  const { hasAccess } = useAuth();
  const isAdmin = hasAccess(["Admin"]);
  const [rules, setRules] = useState<HierarchyRule[]>(initialRules);

  // Validation test state
  const [testSystemType, setTestSystemType] = useState("");
  const [testSubsystem, setTestSubsystem] = useState("");
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  // New rule form
  const [newSystemType, setNewSystemType] = useState("");
  const [newSubsystem, setNewSubsystem] = useState("");

  function addSubsystem(systemType: string) {
    if (!newSubsystem.trim()) return;
    setRules((prev) =>
      prev.map((rule) =>
        rule.systemType === systemType
          ? {
              ...rule,
              allowedSubsystems: [...rule.allowedSubsystems, newSubsystem.trim()],
            }
          : rule
      )
    );
    setNewSubsystem("");
  }

  function removeSubsystem(systemType: string, subsystem: string) {
    setRules((prev) =>
      prev.map((rule) =>
        rule.systemType === systemType
          ? {
              ...rule,
              allowedSubsystems: rule.allowedSubsystems.filter(
                (s) => s !== subsystem
              ),
            }
          : rule
      )
    );
  }

  function addSystemType() {
    if (!newSystemType.trim()) return;
    if (rules.some((r) => r.systemType === newSystemType.trim())) return;
    setRules((prev) => [
      ...prev,
      { systemType: newSystemType.trim(), allowedSubsystems: [] },
    ]);
    setNewSystemType("");
  }

  function removeSystemType(systemType: string) {
    setRules((prev) => prev.filter((r) => r.systemType !== systemType));
  }

  function validateAssignment() {
    if (!testSystemType || !testSubsystem.trim()) {
      setValidationResult({
        valid: false,
        message: "Please select a system type and enter a subsystem name.",
      });
      return;
    }
    const rule = rules.find((r) => r.systemType === testSystemType);
    if (!rule) {
      setValidationResult({
        valid: false,
        message: `No hierarchy rules defined for system type "${testSystemType}".`,
      });
      return;
    }
    const isAllowed = rule.allowedSubsystems.some(
      (s) => s.toLowerCase() === testSubsystem.trim().toLowerCase()
    );
    setValidationResult({
      valid: isAllowed,
      message: isAllowed
        ? `"${testSubsystem}" is a valid subsystem under "${testSystemType}".`
        : `"${testSubsystem}" is NOT allowed under "${testSystemType}". Allowed: ${rule.allowedSubsystems.join(", ")}`,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Systems Hierarchy
        </h1>
        <p className="text-sm text-muted-foreground">
          Define and validate system hierarchy rules
        </p>
      </div>

      {/* Validation Tester */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-card-foreground">
            Hierarchy Validator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 flex-wrap">
            <div className="space-y-2 w-48">
              <Label className="text-foreground">System Type</Label>
              <Select value={testSystemType} onValueChange={setTestSystemType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {rules.map((r) => (
                    <SelectItem key={r.systemType} value={r.systemType}>
                      {r.systemType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 w-64">
              <Label className="text-foreground">Subsystem Name</Label>
              <Input
                value={testSubsystem}
                onChange={(e) => setTestSubsystem(e.target.value)}
                placeholder="e.g., Antenna"
              />
            </div>
            <Button onClick={validateAssignment}>Validate</Button>
          </div>
          {validationResult && (
            <div
              className={`mt-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${
                validationResult.valid
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
              }`}
            >
              {validationResult.valid ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              {validationResult.message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hierarchy Rules */}
      {!isAdmin && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          Only admins can modify hierarchy rules. You have read-only access.
        </div>
      )}

      {isAdmin && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-card-foreground">
              Add System Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="space-y-2 flex-1 max-w-xs">
                <Label className="text-foreground">System Type Name</Label>
                <Input
                  value={newSystemType}
                  onChange={(e) => setNewSystemType(e.target.value)}
                  placeholder="e.g., THERMAL"
                />
              </div>
              <Button onClick={addSystemType}>
                <Plus className="mr-1.5 h-4 w-4" />
                Add Type
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rules.map((rule) => (
          <Card key={rule.systemType} className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-semibold text-card-foreground">
                    {rule.systemType}
                  </CardTitle>
                </div>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeSystemType(rule.systemType)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {rule.allowedSubsystems.map((sub) => (
                  <Badge
                    key={sub}
                    variant="secondary"
                    className="text-xs gap-1"
                  >
                    {sub}
                    {isAdmin && (
                      <button
                        onClick={() => removeSubsystem(rule.systemType, sub)}
                        className="ml-0.5 text-muted-foreground hover:text-destructive"
                      >
                        x
                      </button>
                    )}
                  </Badge>
                ))}
                {rule.allowedSubsystems.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No subsystems defined
                  </p>
                )}
              </div>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add subsystem..."
                    className="h-8 text-xs"
                    value={
                      newSubsystem && testSystemType === rule.systemType
                        ? newSubsystem
                        : ""
                    }
                    onChange={(e) => {
                      setNewSubsystem(e.target.value);
                      setTestSystemType(rule.systemType);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addSubsystem(rule.systemType);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => {
                      setTestSystemType(rule.systemType);
                      addSubsystem(rule.systemType);
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
