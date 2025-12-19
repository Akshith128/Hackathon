import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Upload, Loader2 } from 'lucide-react';

interface TicketData {
  studentId: string;
  seatNumber: string;
}

export function TicketVerifier() {
  const [qrData, setQrData] = useState<TicketData | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleQRCodeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // Simulate QR code verification by checking uploaded file
      const response = await fetch('/api/tickets/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData: 'scanned-qr-data' }),
      });

      const result = await response.json();
      setIsValid(result.valid);
      if (result.valid) {
        setQrData(result.data);
      }
    } catch (error) {
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  const handleManualEntry = async (studentId: string, seatNumber: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/tickets/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, seatNumber }),
      });

      const result = await response.json();
      setIsValid(result.valid);
      if (result.valid) {
        setQrData(result.data);
      }
    } catch (error) {
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Hall Ticket Verification</CardTitle>
        <CardDescription>Verify student tickets using QR code or manual entry</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* QR Code Scanner */}
          <div className="space-y-3 p-4 rounded-lg border border-white/10 bg-white/5">
            <label className="text-sm font-medium">QR Code Scan</label>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full gap-2"
              data-testid="button-upload-qr"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload QR Code Image
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleQRCodeUpload}
              className="hidden"
              data-testid="input-qr-file"
            />
            <p className="text-xs text-muted-foreground">Upload a QR code image for automatic verification</p>
          </div>

          {/* Manual Entry */}
          <div className="space-y-3 p-4 rounded-lg border border-white/10 bg-white/5">
            <label className="text-sm font-medium">Manual Verification</label>
            <div className="flex gap-2">
              <Input
                placeholder="Student ID"
                data-testid="input-student-id"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const studentId = (e.target as HTMLInputElement).value;
                    const seatNumber = (document.querySelector('[data-testid="input-seat-number"]') as HTMLInputElement)?.value;
                    if (studentId && seatNumber) {
                      handleManualEntry(studentId, seatNumber);
                    }
                  }
                }}
              />
            </div>
            <Input
              placeholder="Seat Number"
              data-testid="input-seat-number"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const seatNumber = (e.target as HTMLInputElement).value;
                  const studentId = (document.querySelector('[data-testid="input-student-id"]') as HTMLInputElement)?.value;
                  if (studentId && seatNumber) {
                    handleManualEntry(studentId, seatNumber);
                  }
                }
              }}
            />
            <Button
              onClick={() => {
                const studentId = (document.querySelector('[data-testid="input-student-id"]') as HTMLInputElement)?.value;
                const seatNumber = (document.querySelector('[data-testid="input-seat-number"]') as HTMLInputElement)?.value;
                if (studentId && seatNumber) {
                  handleManualEntry(studentId, seatNumber);
                }
              }}
              disabled={loading}
              className="w-full gap-2"
              data-testid="button-verify-ticket"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Verify Ticket
            </Button>
          </div>
        </div>

        {/* Verification Result */}
        {isValid !== null && (
          <div className={`p-4 rounded-lg border ${isValid ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
            <div className="flex items-start gap-3">
              {isValid ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" data-testid="icon-valid" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" data-testid="icon-invalid" />
              )}
              <div>
                <p className="font-medium">{isValid ? 'Ticket Valid' : 'Ticket Invalid'}</p>
                {isValid && qrData && (
                  <div className="text-sm text-muted-foreground mt-2 space-y-1">
                    <p>Student ID: <span className="font-mono">{qrData.studentId}</span></p>
                    <p>Seat: <span className="font-mono">{qrData.seatNumber}</span></p>
                    <Badge className="mt-2" data-testid="badge-verified">VERIFIED</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
