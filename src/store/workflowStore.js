import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Initial workflow template
const initialWorkflow = {
    id: 'workflow-1',
    name: 'New Workflow',
    description: '',
    nodes: [],
    edges: []
}

// LLM Providers configuration
export const LLM_PROVIDERS = {
    groq: {
        name: 'Groq',
        models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768']
    },
    openrouter: {
        name: 'OpenRouter',
        models: ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'google/gemini-2.0-flash-exp:free']
    },
    cerebras: {
        name: 'Cerebras',
        models: ['llama3.1-8b', 'llama3.1-70b']
    },
    gemini: {
        name: 'Gemini',
        models: ['gemini-2.0-flash-exp', 'gemini-1.5-pro']
    }
}

// Node types with their configurations
export const NODE_TYPES = {
    trigger: {
        label: 'Trigger',
        color: '#22c55e',
        icon: '⚡',
        description: 'Start your workflow'
    },
    action: {
        label: 'Action',
        color: '#6366f1',
        icon: '▶️',
        description: 'Perform an action'
    },
    condition: {
        label: 'Condition',
        color: '#f59e0b',
        icon: '🔀',
        description: 'Branch based on condition'
    },
    loop: {
        label: 'Loop',
        color: '#8b5cf6',
        icon: '🔄',
        description: 'Iterate over items'
    },
    llm: {
        label: 'LLM',
        color: '#ec4899',
        icon: '🤖',
        description: 'AI/LLM processing'
    },
    http: {
        label: 'HTTP',
        color: '#3b82f6',
        icon: '🌐',
        description: 'Make HTTP requests'
    },
    code: {
        label: 'Code',
        color: '#14b8a6',
        icon: '💻',
        description: 'Run custom code'
    },
    transform: {
        label: 'Transform',
        color: '#f97316',
        icon: '🔧',
        description: 'Transform data'
    }
}

const useWorkflowStore = create(
    persist(
        (set, get) => ({
            // Current workflow
            workflow: initialWorkflow,

            // React Flow state
            nodes: [],
            edges: [],

            // UI state
            selectedNode: null,
            guardianOpen: true,
            isExecuting: false,
            executionResults: null,

            // Guardian state
            guardianAlerts: [],
            validationResult: null,

            // API URL (will be HuggingFace Spaces URL)
            apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',

            // Actions
            setNodes: (nodes) => set({ nodes }),
            setEdges: (edges) => set({ edges }),

            onNodesChange: (changes) => {
                const { nodes } = get()
                // Apply changes to nodes
                const newNodes = [...nodes]
                changes.forEach(change => {
                    if (change.type === 'position' && change.position) {
                        const node = newNodes.find(n => n.id === change.id)
                        if (node) {
                            node.position = change.position
                        }
                    } else if (change.type === 'remove') {
                        const index = newNodes.findIndex(n => n.id === change.id)
                        if (index !== -1) newNodes.splice(index, 1)
                    } else if (change.type === 'select') {
                        const node = newNodes.find(n => n.id === change.id)
                        if (node) node.selected = change.selected
                    }
                })
                set({ nodes: newNodes })
            },

            onEdgesChange: (changes) => {
                const { edges } = get()
                const newEdges = [...edges]
                changes.forEach(change => {
                    if (change.type === 'remove') {
                        const index = newEdges.findIndex(e => e.id === change.id)
                        if (index !== -1) newEdges.splice(index, 1)
                    }
                })
                set({ edges: newEdges })
            },

            onConnect: (connection) => {
                const { edges } = get()
                const newEdge = {
                    id: `edge-${Date.now()}`,
                    source: connection.source,
                    target: connection.target,
                    sourceHandle: connection.sourceHandle,
                    targetHandle: connection.targetHandle,
                    animated: true,
                    style: { stroke: '#6366f1' }
                }
                set({ edges: [...edges, newEdge] })
            },

            addNode: (type, position) => {
                const { nodes } = get()
                const typeConfig = NODE_TYPES[type]
                const newNode = {
                    id: `node-${Date.now()}`,
                    type: 'custom',
                    position,
                    data: {
                        label: typeConfig.label,
                        nodeType: type,
                        icon: typeConfig.icon,
                        color: typeConfig.color,
                        config: {},
                        // LLM specific
                        provider: type === 'llm' ? 'groq' : null,
                        model: type === 'llm' ? 'llama-3.3-70b-versatile' : null,
                        prompt: type === 'llm' ? '' : null,
                        temperature: type === 'llm' ? 0.7 : null
                    }
                }
                set({ nodes: [...nodes, newNode] })
            },

            updateNodeData: (nodeId, data) => {
                const { nodes } = get()
                const newNodes = nodes.map(node =>
                    node.id === nodeId
                        ? { ...node, data: { ...node.data, ...data } }
                        : node
                )
                set({ nodes: newNodes })
            },

            selectNode: (nodeId) => set({ selectedNode: nodeId }),

            toggleGuardian: () => set(state => ({ guardianOpen: !state.guardianOpen })),

            setWorkflowName: (name) => set(state => ({
                workflow: { ...state.workflow, name }
            })),

            // Save workflow to localStorage
            saveWorkflow: () => {
                const { workflow, nodes, edges } = get()
                const savedWorkflow = {
                    ...workflow,
                    nodes,
                    edges,
                    updated_at: new Date().toISOString()
                }
                set({ workflow: savedWorkflow })
                return savedWorkflow
            },

            // Load workflow
            loadWorkflow: (workflow) => {
                set({
                    workflow,
                    nodes: workflow.nodes || [],
                    edges: workflow.edges || []
                })
            },

            // Clear workflow
            clearWorkflow: () => {
                set({
                    workflow: { ...initialWorkflow, id: `workflow-${Date.now()}` },
                    nodes: [],
                    edges: [],
                    selectedNode: null,
                    executionResults: null
                })
            },

            // Execute workflow
            executeWorkflow: async () => {
                const { nodes, edges, workflow, apiUrl } = get()

                set({ isExecuting: true, executionResults: null })

                try {
                    // Build workflow object for API
                    const workflowData = {
                        id: workflow.id,
                        name: workflow.name,
                        nodes: nodes.map(n => ({
                            id: n.id,
                            type: n.data.nodeType,
                            position: n.position,
                            data: {
                                label: n.data.label,
                                config: n.data.config || {},
                                provider: n.data.provider,
                                model: n.data.model,
                                prompt: n.data.prompt,
                                temperature: n.data.temperature
                            }
                        })),
                        edges: edges.map(e => ({
                            id: e.id,
                            source: e.source,
                            target: e.target,
                            sourceHandle: e.sourceHandle,
                            targetHandle: e.targetHandle
                        }))
                    }

                    const response = await fetch(`${apiUrl}/api/execute/`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(workflowData)
                    })

                    if (!response.ok) {
                        throw new Error(`Execution failed: ${response.statusText}`)
                    }

                    const result = await response.json()
                    set({ executionResults: result })

                    return result
                } catch (error) {
                    console.error('Execution error:', error)
                    set({
                        executionResults: {
                            status: 'failed',
                            error: error.message
                        }
                    })
                    throw error
                } finally {
                    set({ isExecuting: false })
                }
            },

            // Validate workflow with Guardian
            validateWorkflow: async () => {
                const { nodes, edges, workflow, apiUrl } = get()

                try {
                    const workflowData = {
                        id: workflow.id,
                        name: workflow.name,
                        nodes: nodes.map(n => ({
                            id: n.id,
                            type: n.data.nodeType,
                            position: n.position,
                            data: {
                                label: n.data.label,
                                config: n.data.config || {},
                                provider: n.data.provider,
                                model: n.data.model,
                                prompt: n.data.prompt
                            }
                        })),
                        edges
                    }

                    const response = await fetch(`${apiUrl}/api/workflows/validate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(workflowData)
                    })

                    if (!response.ok) {
                        throw new Error('Validation failed')
                    }

                    const result = await response.json()
                    set({ validationResult: result })

                    return result
                } catch (error) {
                    // Offline validation
                    const errors = []
                    const warnings = []

                    const triggerNodes = nodes.filter(n => n.data.nodeType === 'trigger')
                    if (triggerNodes.length === 0) {
                        errors.push({ message: 'Workflow must have at least one trigger node' })
                    }

                    if (nodes.length === 0) {
                        errors.push({ message: 'Workflow has no nodes' })
                    }

                    const result = { valid: errors.length === 0, errors, warnings }
                    set({ validationResult: result })
                    return result
                }
            },

            setGuardianAlerts: (alerts) => set({ guardianAlerts: alerts })
        }),
        {
            name: 'tritan-workflow-storage',
            partialize: (state) => ({
                workflow: state.workflow,
                nodes: state.nodes,
                edges: state.edges
            })
        }
    )
)

export default useWorkflowStore
