import { ReactFlowProvider } from '@xyflow/react'
import TopBar from './components/TopBar/TopBar'
import NodePalette from './components/Sidebar/NodePalette'
import WorkflowCanvas from './components/Canvas/WorkflowCanvas'
import GuardianPanel from './components/Guardian/GuardianPanel'
import useWorkflowStore from './store/workflowStore'

function App() {
  const { guardianOpen } = useWorkflowStore()

  return (
    <ReactFlowProvider>
      <div className="app">
        <TopBar />
        <div className="app-content">
          <NodePalette />
          <WorkflowCanvas />
          {guardianOpen && <GuardianPanel />}
        </div>
      </div>
    </ReactFlowProvider>
  )
}

export default App
