import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface UploadResult {
  filename: string;
  rollNumber: string;
  status: 'success' | 'error';
  message: string;
}

export default function BulkUpload() {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);

  const extractRollNumberFromFilename = (filename: string): string | null => {
    const match = filename.match(/([A-Z0-9]+)\.pdf/i);
    return match ? match[1] : null;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    setIsUploading(true);
    const uploadResults: UploadResult[] = [];

    for (const file of files) {
      const rollNumber = extractRollNumberFromFilename(file.name);
      
      if (!rollNumber) {
        uploadResults.push({
          filename: file.name,
          rollNumber: 'UNKNOWN',
          status: 'error',
          message: 'Could not extract Roll Number from filename'
        });
        continue;
      }

      try {
        const response = await fetch('/api/admin/bulk-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rollNumber,
            filename: file.name,
            size: file.size
          })
        });

        if (response.ok) {
          uploadResults.push({
            filename: file.name,
            rollNumber,
            status: 'success',
            message: 'Hall ticket mapped successfully'
          });
        } else {
          uploadResults.push({
            filename: file.name,
            rollNumber,
            status: 'error',
            message: 'Failed to map hall ticket'
          });
        }
      } catch (error) {
        uploadResults.push({
          filename: file.name,
          rollNumber,
          status: 'error',
          message: error instanceof Error ? error.message : 'Upload failed'
        });
      }
    }

    setResults(uploadResults);
    setIsUploading(false);

    const successCount = uploadResults.filter(r => r.status === 'success').length;
    toast({
      title: 'Upload Complete',
      description: `${successCount}/${uploadResults.length} files processed successfully`,
      variant: successCount === uploadResults.length ? 'default' : 'destructive'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bulk Hall Ticket Upload</h1>
        <p className="text-muted-foreground">Upload PDF files named with Roll Numbers (e.g., R101.pdf, R102.pdf)</p>
      </div>

      <Card className="border-dashed border-2">
        <CardContent className="p-8">
          <div
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-4 p-12 rounded-lg transition-colors ${
              isDragging ? 'bg-primary/10 border-primary' : 'bg-muted'
            }`}
          >
            <Upload className="w-8 h-8 text-muted-foreground" />
            <div className="text-center">
              <p className="font-semibold">Drag and drop PDF files here</p>
              <p className="text-sm text-muted-foreground">or click to select files</p>
            </div>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileInput}
              disabled={isUploading}
              className="hidden"
              id="file-input"
            />
            <Button asChild disabled={isUploading}>
              <label htmlFor="file-input" className="cursor-pointer">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Select Files
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Upload Results
              <Badge variant={results.every(r => r.status === 'success') ? 'default' : 'destructive'}>
                {results.filter(r => r.status === 'success').length}/{results.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border">
                  <div className="flex-1">
                    <p className="font-medium">{result.filename}</p>
                    <p className="text-sm text-muted-foreground">Roll: {result.rollNumber}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.status === 'success' ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-green-500">Success</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="text-sm text-red-500">{result.message}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
