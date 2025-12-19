import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ReactFlow, Background, Controls, Handle, Position, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { Upload, Loader2, BookOpen, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const CustomNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const getColor = (type: string) => {
    switch (type) {
      case 'subject': return '#3b82f6';
      case 'unit': return '#8b5cf6';
      case 'topic': return '#1e293b';
      default: return '#64748b';
    }
  };

  return (
    <div
      style={{
        background: getColor(data.type),
        color: 'white',
        padding: '10px 15px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: data.type === 'subject' ? 'bold' : 'normal',
        border: selected ? '2px solid #fbbf24' : 'none',
        cursor: 'pointer',
        maxWidth: '120px',
        textAlign: 'center',
        wordWrap: 'break-word',
      }}
      data-testid={`node-${data.label}`}
    >
      {data.label}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export function StudySupport() {
  const [uploadedText, setUploadedText] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: parsedData, isLoading } = useQuery({
    queryKey: ['syllabus', uploadedText],
    queryFn: async () => {
      if (!uploadedText.trim()) return null;
      const res = await fetch('/api/syllabus/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: uploadedText }),
      });
      return res.json();
    },
    enabled: !!uploadedText,
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      setUploadedText(text);
    } catch (error) {
      console.error('Error reading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getReadingLinks = (unitName: string) => {
    const readings: Record<string, Array<{ title: string; url: string }>> = {
      'Data Structures': [
        { title: 'Introduction to Algorithms (CLRS)', url: '#' },
        { title: 'Data Structures and Algorithms Made Easy', url: '#' },
        { title: 'GeeksforGeeks - DSA Tutorial', url: '#' },
      ],
      'Algorithms': [
        { title: 'Algorithm Design Manual', url: '#' },
        { title: 'Competitive Programming Handbook', url: '#' },
        { title: 'LeetCode - Problem Solving', url: '#' },
      ],
      'default': [
        { title: 'Course Textbook', url: '#' },
        { title: 'Professor Notes', url: '#' },
        { title: 'Online Resources', url: '#' },
      ],
    };

    return readings[unitName] || readings['default'];
  };

  const processedNodes = parsedData?.nodes?.map((node: any) => ({
    id: node.id,
    data: { label: node.label, type: node.type },
    position: { x: Math.random() * 400, y: Math.random() * 400 },
    type: 'custom',
  })) || [];

  const processedEdges = parsedData?.edges?.map((edge: any) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    animated: true,
    style: { stroke: '#8b5cf6' },
    markerEnd: { type: MarkerType.ArrowClosed },
  })) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="glass-card lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Upload Syllabus</CardTitle>
            <CardDescription>Add your course syllabus</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full gap-2"
                data-testid="button-upload-syllabus"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isUploading ? 'Reading...' : 'Upload File'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground mt-2">Supports .txt files</p>
            </div>

            {uploadedText && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-xs font-medium text-emerald-400">✓ File loaded</p>
              </div>
            )}

            {parsedData && (
              <Badge className="w-full justify-center" data-testid="badge-parsed">
                {parsedData.nodes?.length || 0} Topics Found
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card lg:col-span-3">
          <CardHeader>
            <CardTitle>Syllabus Hierarchy</CardTitle>
            <CardDescription>
              {isLoading ? 'Processing...' : 'Interactive mind map of topics'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Parsing syllabus...
              </div>
            ) : processedNodes.length > 0 ? (
              <div className="h-96 w-full rounded-xl border border-white/10 overflow-hidden bg-black/20">
                <ReactFlow
                  nodes={processedNodes}
                  edges={processedEdges}
                  nodeTypes={{ custom: CustomNode }}
                  fitView
                  onNodeClick={(event, node) => setSelectedNode(node.id)}
                  attributionPosition="bottom-right"
                >
                  <Background color="#444" gap={16} />
                  <Controls />
                </ReactFlow>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="w-12 h-12 opacity-50 mx-auto mb-2" />
                  <p>Upload a syllabus to visualize topics</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedNode && parsedData && (
        <Card className="glass-card" data-testid="card-readings">
          <CardHeader>
            <CardTitle className="text-lg">Recommended Reading</CardTitle>
            <CardDescription>
              Resources for: <Badge variant="outline" className="ml-2">{selectedNode}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3 pr-4">
                {getReadingLinks(selectedNode).map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg hover-elevate border border-white/10 bg-white/5"
                    data-testid={`link-reading-${idx}`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{link.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">Click to access</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </a>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
