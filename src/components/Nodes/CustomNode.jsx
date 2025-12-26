import { memo, useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import { motion } from 'framer-motion'
import useWorkflowStore, { LLM_PROVIDERS } from '../../store/workflowStore'
import './CustomNode.css'

function CustomNode({ id, data, selected }) {
    const [isEditing, setIsEditing] = useState(false)
    const { updateNodeData } = useWorkflowStore()

    const handleLabelChange = (e) => {
        updateNodeData(id, { label: e.target.value })
    }

    const handleConfigChange = (key, value) => {
        updateNodeData(id, { [key]: value })
    }

    return (
        <motion.div
            className={`custom-node ${selected ? 'selected' : ''}`}
            style={{ '--node-color': data.color }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            onDoubleClick={() => setIsEditing(true)}
        >
            {/* Input Handle */}
            {data.nodeType !== 'trigger' && (
                <Handle
                    type="target"
                    position={Position.Left}
                    className="node-handle input-handle"
                />
            )}

            {/* Node Header */}
            <div className="node-header">
                <span className="node-icon">{data.icon}</span>
                {isEditing ? (
                    <input
                        type="text"
                        className="node-label-input"
                        value={data.label}
                        onChange={handleLabelChange}
                        onBlur={() => setIsEditing(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                        autoFocus
                    />
                ) : (
                    <span className="node-label">{data.label}</span>
                )}
            </div>

            {/* Node Body - LLM specific */}
            {data.nodeType === 'llm' && (
                <div className="node-body">
                    <div className="node-field">
                        <label>Provider</label>
                        <select
                            value={data.provider || 'groq'}
                            onChange={(e) => handleConfigChange('provider', e.target.value)}
                            className="node-select"
                        >
                            {Object.entries(LLM_PROVIDERS).map(([key, config]) => (
                                <option key={key} value={key}>{config.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="node-field">
                        <label>Model</label>
                        <select
                            value={data.model || ''}
                            onChange={(e) => handleConfigChange('model', e.target.value)}
                            className="node-select"
                        >
                            {(LLM_PROVIDERS[data.provider || 'groq']?.models || []).map(model => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </select>
                    </div>

                    <div className="node-field">
                        <label>Prompt</label>
                        <textarea
                            value={data.prompt || ''}
                            onChange={(e) => handleConfigChange('prompt', e.target.value)}
                            className="node-textarea"
                            placeholder="Enter your prompt..."
                            rows={2}
                        />
                    </div>
                </div>
            )}

            {/* Node Body - HTTP specific */}
            {data.nodeType === 'http' && (
                <div className="node-body">
                    <div className="node-field">
                        <label>Method</label>
                        <select
                            value={data.config?.method || 'GET'}
                            onChange={(e) => handleConfigChange('config', { ...data.config, method: e.target.value })}
                            className="node-select"
                        >
                            <option value="GET">GET</option>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="DELETE">DELETE</option>
                        </select>
                    </div>
                    <div className="node-field">
                        <label>URL</label>
                        <input
                            type="text"
                            value={data.config?.url || ''}
                            onChange={(e) => handleConfigChange('config', { ...data.config, url: e.target.value })}
                            className="node-input"
                            placeholder="https://api.example.com"
                        />
                    </div>
                </div>
            )}

            {/* Node Body - Condition specific */}
            {data.nodeType === 'condition' && (
                <div className="node-body">
                    <div className="node-field">
                        <label>Condition</label>
                        <input
                            type="text"
                            value={data.config?.condition || ''}
                            onChange={(e) => handleConfigChange('config', { ...data.config, condition: e.target.value })}
                            className="node-input font-mono"
                            placeholder="value > 10"
                        />
                    </div>
                </div>
            )}

            {/* Node Body - Code specific */}
            {data.nodeType === 'code' && (
                <div className="node-body">
                    <div className="node-field">
                        <label>Code</label>
                        <textarea
                            value={data.config?.code || ''}
                            onChange={(e) => handleConfigChange('config', { ...data.config, code: e.target.value })}
                            className="node-textarea font-mono"
                            placeholder="return variables.data"
                            rows={3}
                        />
                    </div>
                </div>
            )}

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Right}
                className="node-handle output-handle"
            />

            {/* Condition node has two output handles */}
            {data.nodeType === 'condition' && (
                <>
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="true"
                        className="node-handle output-handle condition-true"
                        style={{ top: '35%' }}
                    />
                    <Handle
                        type="source"
                        position={Position.Right}
                        id="false"
                        className="node-handle output-handle condition-false"
                        style={{ top: '65%' }}
                    />
                </>
            )}
        </motion.div>
    )
}

export default memo(CustomNode)
