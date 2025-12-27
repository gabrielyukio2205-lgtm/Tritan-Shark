// API utility functions

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function executeWorkflow(workflow) {
    const response = await fetch(`${API_URL}/api/execute/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow)
    })

    if (!response.ok) {
        throw new Error(`Execution failed: ${response.statusText}`)
    }

    return response.json()
}

export async function validateWorkflow(workflow) {
    const response = await fetch(`${API_URL}/api/workflows/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow)
    })

    if (!response.ok) {
        throw new Error(`Validation failed: ${response.statusText}`)
    }

    return response.json()
}

export async function checkHealth() {
    const response = await fetch(`${API_URL}/health`)
    return response.json()
}

export { API_URL }
