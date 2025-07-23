import { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Truck, MapPin, Fuel } from 'lucide-react';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 100, y: 100 },
    data: { 
      label: 'Denver, CO',
      type: 'start',
      icon: <MapPin className="h-4 w-4" />
    },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 300, y: 150 },
    data: { 
      label: 'Kansas City, MO',
      type: 'fuel',
      icon: <Fuel className="h-4 w-4" />
    },
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 500, y: 100 },
    data: { 
      label: 'Chicago, IL',
      type: 'destination',
      icon: <Truck className="h-4 w-4" />
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    style: { stroke: 'hsl(var(--primary))', strokeWidth: 3 },
    label: '387 miles',
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    animated: true,
    style: { stroke: 'hsl(var(--primary))', strokeWidth: 3 },
    label: '426 miles',
  },
];

const CustomNode = ({ data }: { data: any }) => {
  const getNodeStyle = () => {
    switch (data.type) {
      case 'start':
        return 'bg-green-100 border-green-500 text-green-700';
      case 'fuel':
        return 'bg-blue-100 border-blue-500 text-blue-700';
      case 'destination':
        return 'bg-red-100 border-red-500 text-red-700';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  return (
    <div className={`px-4 py-2 shadow-md rounded-md border-2 ${getNodeStyle()}`}>
      <div className="flex items-center space-x-2">
        {data.icon}
        <div className="text-sm font-medium">{data.label}</div>
      </div>
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

export const RouteVisualization = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="w-full h-96 bg-card rounded-lg border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="rounded-lg"
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};