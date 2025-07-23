import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin, Fuel, Route } from 'lucide-react';

interface RouteNode {
  id: string;
  label: string;
  position: { x: number; y: number };
  type: 'start' | 'stop' | 'fuel' | 'end';
  state?: string;
  miles?: number;
}

const routeNodes: RouteNode[] = [
  { id: '1', label: 'Denver, CO', position: { x: 50, y: 200 }, type: 'start', state: 'CO' },
  { id: '2', label: 'Fuel Stop', position: { x: 200, y: 150 }, type: 'fuel', state: 'NE', miles: 180 },
  { id: '3', label: 'Chicago, IL', position: { x: 350, y: 100 }, type: 'stop', state: 'IL', miles: 420 },
  { id: '4', label: 'Detroit, MI', position: { x: 500, y: 120 }, type: 'end', state: 'MI', miles: 280 },
];

const connections = [
  { from: '1', to: '2' },
  { from: '2', to: '3' },
  { from: '3', to: '4' },
];

export const RouteVisualization = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);

    connections.forEach(connection => {
      const fromNode = routeNodes.find(n => n.id === connection.from);
      const toNode = routeNodes.find(n => n.id === connection.to);
      
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.position.x + 25, fromNode.position.y + 25);
        ctx.lineTo(toNode.position.x + 25, toNode.position.y + 25);
        ctx.stroke();
      }
    });

    // Add animated truck moving along route
    const animateProgress = (Date.now() / 2000) % 1;
    const totalConnections = connections.length;
    const currentSegment = Math.floor(animateProgress * totalConnections);
    const segmentProgress = (animateProgress * totalConnections) % 1;

    if (currentSegment < connections.length) {
      const connection = connections[currentSegment];
      const fromNode = routeNodes.find(n => n.id === connection.from);
      const toNode = routeNodes.find(n => n.id === connection.to);

      if (fromNode && toNode) {
        const truckX = fromNode.position.x + (toNode.position.x - fromNode.position.x) * segmentProgress;
        const truckY = fromNode.position.y + (toNode.position.y - fromNode.position.y) * segmentProgress;

        // Draw truck
        ctx.fillStyle = 'hsl(var(--primary))';
        ctx.fillRect(truckX + 20, truckY + 20, 10, 10);
      }
    }

    // Request next frame
    const animationId = requestAnimationFrame(() => {});
    return () => cancelAnimationFrame(animationId);
  }, [hoveredNode]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'start': return <MapPin className="h-4 w-4" />;
      case 'fuel': return <Fuel className="h-4 w-4" />;
      case 'stop': return <Route className="h-4 w-4" />;
      case 'end': return <Truck className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'start': return 'bg-green-500';
      case 'fuel': return 'bg-yellow-500';
      case 'stop': return 'bg-blue-500';
      case 'end': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="w-full h-96 bg-card rounded-lg border relative overflow-hidden">
      {/* Background Canvas for Connections */}
      <canvas
        ref={canvasRef}
        width={600}
        height={384}
        className="absolute inset-0 w-full h-full"
      />
      
      {/* Interactive Nodes */}
      {routeNodes.map((node, index) => (
        <motion.div
          key={node.id}
          className={`absolute cursor-pointer`}
          style={{
            left: `${(node.position.x / 600) * 100}%`,
            top: `${(node.position.y / 384) * 100}%`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.2, duration: 0.5 }}
          whileHover={{ scale: 1.1 }}
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
        >
          <div className={`
            relative w-12 h-12 rounded-full ${getNodeColor(node.type)} 
            flex items-center justify-center text-white shadow-lg
            ${hoveredNode === node.id ? 'ring-4 ring-primary/50' : ''}
            ${selectedNode === node.id ? 'ring-4 ring-primary' : ''}
          `}>
            {getNodeIcon(node.type)}
          </div>
          
          {/* Node Label */}
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium border">
              {node.label}
            </div>
          </div>

          {/* Detailed Info Popup */}
          {selectedNode === node.id && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-popover border rounded-lg p-3 shadow-lg z-10 min-w-[150px]"
            >
              <div className="text-sm font-medium">{node.label}</div>
              {node.state && (
                <div className="text-xs text-muted-foreground">State: {node.state}</div>
              )}
              {node.miles && (
                <div className="text-xs text-muted-foreground">Miles: {node.miles}</div>
              )}
            </motion.div>
          )}
        </motion.div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border">
        <div className="text-xs font-medium mb-2">Route Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Start Point</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Fuel Stop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Rest Stop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Destination</span>
          </div>
        </div>
      </div>

      {/* Route Stats */}
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border">
        <div className="text-xs font-medium mb-2">Route Summary</div>
        <div className="space-y-1 text-xs">
          <div>Total Miles: 880</div>
          <div>States: 4 (CO, NE, IL, MI)</div>
          <div>Fuel Stops: 1</div>
        </div>
      </div>
    </div>
  );
};