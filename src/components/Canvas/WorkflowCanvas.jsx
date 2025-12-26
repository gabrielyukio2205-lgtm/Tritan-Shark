import { useCallback, useRef } from 'react'
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useReactFlow
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import useWorkflowStore from '../../store/workflowStore'
import CustomNode from '../Nodes/CustomNode'
import './WorkflowCanvas.css'

// Define custom node types
const nodeTypes = {
    custom: CustomNode
}

function WorkflowCanvas() {
    const reactFlowWrapper = useRef(null)
    const { screenToFlowPosition } = useReactFlow()

    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode
    } = useWorkflowStore()

    const onDragOver = useCallback((event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }, [])

    const onDrop = useCallback(
        (event) => {
            event.preventDefault()

            const type = event.dataTransfer.getData('application/reactflow')
            if (!type) return

            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY
            })

            addNode(type, position)
        },
        [screenToFlowPosition, addNode]
    )

    return (
        <div className="workflow-canvas" ref={reactFlowWrapper}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                fitView
                snapToGrid
                snapGrid={[15, 15]}
                defaultEdgeOptions={{
                    animated: true,
                    style: { stroke: '#6366f1', strokeWidth: 2 }
                }}
                connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2 }}
                proOptions={{ hideAttribution: true }}
            >
                <Background
                    color="#333"
                    gap={20}
                    size={1}
                    variant="dots"
                />
                <Controls
                    className="canvas-controls"
                    showInteractive={false}
                />
                <MiniMap
                    className="canvas-minimap"
                    nodeColor={(node) => node.data?.color || '#6366f1'}
                    maskColor="rgba(0, 0, 0, 0.8)"
                    style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)'
                    }}
                />
            </ReactFlow>

            {nodes.length === 0 && (
                <div className="canvas-empty">
                    <div className="empty-icon">🔱</div>
                    <h3>Start Building</h3>
                    <p>Drag nodes from the left panel to create your workflow</p>
                </div>
            )}
        </div>
    )
}

export default WorkflowCanvas
