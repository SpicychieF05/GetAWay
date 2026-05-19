"use client";

import { useState } from "react";
import { useMockStore } from "@/store/mockStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const settings = useMockStore((state) => state.settings);
  const updateSettings = useMockStore((state) => state.updateSettings);

  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateSettings(localSettings);
      setIsSaving(false);
      toast.success("Settings saved successfully.");
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-2">
          Configure system preferences and AI thresholds.
        </p>
      </div>

      <Card className="glass-panel border-white/10 bg-card/40">
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
          <CardDescription>Manage your GetAWay environment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">AI Analysis</h3>
            <div className="grid gap-2">
              <Label htmlFor="threshold">
                Trust Score Warning Threshold (%)
              </Label>
              <Input
                id="threshold"
                type="number"
                value={localSettings.aiThreshold}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    aiThreshold: Number(e.target.value),
                  })
                }
                className="bg-black/20 border-white/10 w-32"
              />
              <p className="text-xs text-muted-foreground">
                Alerts trigger if the candidate score drops below this.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Integrations</h3>
            <div className="grid gap-2">
              <Label htmlFor="webhook">Webhook URL</Label>
              <Input
                id="webhook"
                placeholder="https://your-domain.com/webhook"
                value={localSettings.webhookUrl}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    webhookUrl: e.target.value,
                  })
                }
                className="bg-black/20 border-white/10"
              />
              <p className="text-xs text-muted-foreground">
                Receive real-time events for session end or alert triggers.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Device Defaults</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Require Microphone</Label>
                <p className="text-sm text-muted-foreground">
                  Candidates must grant mic access to proceed.
                </p>
              </div>
              <Switch
                checked={localSettings.micEnabled}
                onCheckedChange={(c) =>
                  setLocalSettings({ ...localSettings, micEnabled: c })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Require Camera</Label>
                <p className="text-sm text-muted-foreground">
                  Candidates must grant camera access to proceed.
                </p>
              </div>
              <Switch
                checked={localSettings.cameraEnabled}
                onCheckedChange={(c) =>
                  setLocalSettings({ ...localSettings, cameraEnabled: c })
                }
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border/30 pt-6">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
