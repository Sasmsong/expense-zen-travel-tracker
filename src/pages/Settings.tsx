
import { useState } from 'react';
import { ArrowLeft, Moon, Sun, Palette, Bell, Cloud, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';
import { CurrencySelector } from '@/components/CurrencySelector';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    theme,
    accentColor,
    baseCurrency,
    reminderEnabled,
    reminderTime,
    cloudBackupEnabled,
    setTheme,
    setAccentColor,
    setBaseCurrency,
    setReminderEnabled,
    setReminderTime,
    setCloudBackupEnabled
  } = useSettings();

  const [tempColor, setTempColor] = useState(accentColor);

  const accentColors = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Pink', value: '#EC4899' }
  ];

  const handleBackup = () => {
    // Simulate backup process
    toast({
      title: "Backup initiated",
      description: "Your data is being backed up to the cloud.",
    });
  };

  const handleExportData = () => {
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    const dataStr = JSON.stringify({ trips, settings: { theme, accentColor, baseCurrency } }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'travel-expenses-backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Data exported",
      description: "Your data has been downloaded as a backup file.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20 p-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  <Label>Dark Mode</Label>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Accent Color</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {accentColors.map((color) => (
                    <button
                      key={color.value}
                      className={`w-8 h-8 rounded-full border-2 ${
                        accentColor === color.value ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setAccentColor(color.value)}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Currency */}
          <Card>
            <CardHeader>
              <CardTitle>Default Currency</CardTitle>
            </CardHeader>
            <CardContent>
              <CurrencySelector
                value={baseCurrency}
                onValueChange={setBaseCurrency}
                placeholder="Select currency"
              />
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Reminders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Expense Reminders</Label>
                <Switch
                  checked={reminderEnabled}
                  onCheckedChange={setReminderEnabled}
                />
              </div>
              
              {reminderEnabled && (
                <div>
                  <Label htmlFor="reminderTime">Daily Reminder Time</Label>
                  <Input
                    id="reminderTime"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Backup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                Backup & Export
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Cloud Backup</Label>
                <Switch
                  checked={cloudBackupEnabled}
                  onCheckedChange={setCloudBackupEnabled}
                />
              </div>
              
              <div className="space-y-2">
                <Button onClick={handleBackup} className="w-full" variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Backup Now
                </Button>
                <Button onClick={handleExportData} className="w-full" variant="outline">
                  Export Data
                </Button>
              </div>
              
              {cloudBackupEnabled && (
                <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                  <p>Connect your Google Drive or Dropbox account to automatically backup your trips and expenses.</p>
                  <Button size="sm" className="mt-2">Connect Drive</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
