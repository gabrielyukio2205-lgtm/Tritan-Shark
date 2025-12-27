import { motion } from 'framer-motion'
import { NODE_TYPES } from '../../store/workflowStore'
import './NodePalette.css'

function NodePalette() {
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType)
        event.dataTransfer.effectAllowed = 'move'
    }

    return (
        <motion.aside
            className="node-palette"
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className="palette-header">
                <h3>📦 Nodes</h3>
                <span className="palette-hint">Drag to canvas</span>
            </div>

            <div className="palette-nodes">
                {Object.entries(NODE_TYPES).map(([type, config]) => (
                    <motion.div
                        key={type}
                        className="palette-node"
                        draggable
                        onDragStart={(e) => onDragStart(e, type)}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ '--node-color': config.color }}
                    >
                        <div className="palette-node-icon">
                            {config.icon}
                        </div>
                        <div className="palette-node-info">
                            <span className="palette-node-label">{config.label}</span>
                            <span className="palette-node-desc">{config.description}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="palette-footer">
                <div className="palette-tip">
                    💡 <strong>Tip:</strong> Connect nodes by dragging from output to input handles
                </div>
            </div>
        </motion.aside>
    )
}

export default NodePalette
