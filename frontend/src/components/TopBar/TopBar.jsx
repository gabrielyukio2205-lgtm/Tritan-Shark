import { motion } from 'framer-motion'
import useWorkflowStore from '../../store/workflowStore'
import './TopBar.css'

function TopBar() {
    const {
        workflow,
        setWorkflowName,
        saveWorkflow,
        clearWorkflow,
        executeWorkflow,
        validateWorkflow,
        isExecuting,
        toggleGuardian,
        guardianOpen
    } = useWorkflowStore()

    const handleSave = () => {
        saveWorkflow()
        // Show toast or notification
    }

    const handleRun = async () => {
        try {
            // Validate first
            const validation = await validateWorkflow()
            if (!validation.valid) {
                alert('Workflow has errors. Check the Guardian panel.')
                return
            }
            await executeWorkflow()
        } catch (error) {
            console.error('Execution failed:', error)
        }
    }

    const handleExport = () => {
        const saved = saveWorkflow()
        const blob = new Blob([JSON.stringify(saved, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${workflow.name.replace(/\s+/g, '_')}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleImport = () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = (e) => {
            const file = e.target.files[0]
            if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    try {
                        const workflow = JSON.parse(e.target.result)
                        useWorkflowStore.getState().loadWorkflow(workflow)
                    } catch (error) {
                        alert('Invalid workflow file')
                    }
                }
                reader.readAsText(file)
            }
        }
        input.click()
    }

    return (
        <motion.header
            className="topbar"
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className="topbar-left">
                <div className="topbar-logo">
                    <span className="logo-icon">🔱</span>
                    <span className="logo-text">Tritan</span>
                </div>

                <div className="topbar-divider" />

                <input
                    type="text"
                    className="workflow-name-input"
                    value={workflow.name}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    placeholder="Workflow name..."
                />
            </div>

            <div className="topbar-center">
                <motion.button
                    className="btn btn-secondary"
                    onClick={handleImport}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    📂 Import
                </motion.button>

                <motion.button
                    className="btn btn-secondary"
                    onClick={handleExport}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    💾 Export
                </motion.button>

                <motion.button
                    className="btn btn-secondary"
                    onClick={handleSave}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    ✅ Save
                </motion.button>
            </div>

            <div className="topbar-right">
                <motion.button
                    className="btn btn-secondary"
                    onClick={clearWorkflow}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    🗑️ Clear
                </motion.button>

                <motion.button
                    className={`btn btn-secondary guardian-toggle ${guardianOpen ? 'active' : ''}`}
                    onClick={toggleGuardian}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    🛡️ Guardian
                </motion.button>

                <motion.button
                    className="btn btn-success run-btn"
                    onClick={handleRun}
                    disabled={isExecuting}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isExecuting ? (
                        <>
                            <span className="animate-spin">⏳</span>
                            Running...
                        </>
                    ) : (
                        <>
                            ▶️ Run
                        </>
                    )}
                </motion.button>
            </div>
        </motion.header>
    )
}

export default TopBar
