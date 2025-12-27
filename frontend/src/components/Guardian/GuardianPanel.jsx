import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useWorkflowStore from '../../store/workflowStore'
import './GuardianPanel.css'

function GuardianPanel() {
    const {
        validationResult,
        validateWorkflow,
        executionResults,
        nodes
    } = useWorkflowStore()

    // Auto-validate when nodes change
    useEffect(() => {
        if (nodes.length > 0) {
            validateWorkflow()
        }
    }, [nodes.length])

    return (
        <motion.aside
            className="guardian-panel"
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className="guardian-header">
                <div className="guardian-title">
                    <span className="guardian-icon">🛡️</span>
                    <span>Guardian</span>
                </div>
                <span className="guardian-status">
                    {validationResult?.valid ? (
                        <span className="status-valid">✓ Valid</span>
                    ) : validationResult?.errors?.length > 0 ? (
                        <span className="status-error">✕ Errors</span>
                    ) : (
                        <span className="status-idle">Watching...</span>
                    )}
                </span>
            </div>

            <div className="guardian-content">
                {/* Validation Section */}
                <div className="guardian-section">
                    <h4>Validation</h4>

                    <AnimatePresence>
                        {validationResult?.errors?.map((error, index) => (
                            <motion.div
                                key={`error-${index}`}
                                className="guardian-alert alert-error"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <span className="alert-icon">❌</span>
                                <div className="alert-content">
                                    <span className="alert-message">{error.message}</span>
                                    {error.suggestion && (
                                        <span className="alert-suggestion">💡 {error.suggestion}</span>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {validationResult?.warnings?.map((warning, index) => (
                            <motion.div
                                key={`warning-${index}`}
                                className="guardian-alert alert-warning"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <span className="alert-icon">⚠️</span>
                                <div className="alert-content">
                                    <span className="alert-message">{warning.message}</span>
                                    {warning.suggestion && (
                                        <span className="alert-suggestion">💡 {warning.suggestion}</span>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {validationResult?.suggestions?.map((suggestion, index) => (
                            <motion.div
                                key={`suggestion-${index}`}
                                className="guardian-alert alert-info"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <span className="alert-icon">💡</span>
                                <div className="alert-content">
                                    <span className="alert-message">{suggestion.message}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {validationResult?.valid && !validationResult?.warnings?.length && (
                        <div className="guardian-empty">
                            <span>✨</span>
                            <p>Workflow looks good!</p>
                        </div>
                    )}

                    {!validationResult && nodes.length === 0 && (
                        <div className="guardian-empty">
                            <span>🔱</span>
                            <p>Add nodes to start</p>
                        </div>
                    )}
                </div>

                {/* Execution Results */}
                {executionResults && (
                    <div className="guardian-section">
                        <h4>Execution</h4>

                        <div className={`execution-status status-${executionResults.status}`}>
                            <span className="status-icon">
                                {executionResults.status === 'completed' ? '✅' :
                                    executionResults.status === 'failed' ? '❌' : '⏳'}
                            </span>
                            <span className="status-text">
                                {executionResults.status === 'completed' ? 'Completed' :
                                    executionResults.status === 'failed' ? 'Failed' : 'Running'}
                            </span>
                            {executionResults.total_duration_ms && (
                                <span className="status-duration">
                                    {Math.round(executionResults.total_duration_ms)}ms
                                </span>
                            )}
                        </div>

                        {executionResults.error && (
                            <div className="guardian-alert alert-error">
                                <span className="alert-icon">❌</span>
                                <div className="alert-content">
                                    <span className="alert-message">{executionResults.error}</span>
                                </div>
                            </div>
                        )}

                        {executionResults.node_results?.map((result, index) => (
                            <div key={index} className={`node-result result-${result.status}`}>
                                <div className="result-header">
                                    <span className="result-icon">
                                        {result.status === 'completed' ? '✓' : '✕'}
                                    </span>
                                    <span className="result-node">{result.node_id}</span>
                                    {result.duration_ms && (
                                        <span className="result-duration">{Math.round(result.duration_ms)}ms</span>
                                    )}
                                </div>
                                {result.output && (
                                    <pre className="result-output">
                                        {typeof result.output === 'string'
                                            ? result.output
                                            : JSON.stringify(result.output, null, 2)}
                                    </pre>
                                )}
                                {result.error && (
                                    <div className="result-error">{result.error}</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats */}
                <div className="guardian-section">
                    <h4>Stats</h4>
                    <div className="guardian-stats">
                        <div className="stat">
                            <span className="stat-value">{nodes.length}</span>
                            <span className="stat-label">Nodes</span>
                        </div>
                        <div className="stat">
                            <span className="stat-value">{useWorkflowStore.getState().edges.length}</span>
                            <span className="stat-label">Connections</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.aside>
    )
}

export default GuardianPanel
