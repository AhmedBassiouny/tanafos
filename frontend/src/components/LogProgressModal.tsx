import React, { useState } from 'react'
import type { Task } from '../types'
import { Modal, Button, Input } from './ui'
import { progress as progressApi } from '../lib/api'
import { useToast } from '../contexts/toast-context'

interface LogProgressModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  onSuccess: () => void
}

export const LogProgressModal: React.FC<LogProgressModalProps> = ({
  isOpen,
  onClose,
  task,
  onSuccess
}) => {
  const { showToast } = useToast()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setValue('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!task) return
    
    // Validate input
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue <= 0) {
      setError('Please enter a valid number greater than 0')
      return
    }
    
    if (numValue > 1000) {
      setError('Value cannot exceed 1000')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await progressApi.log({
        taskId: task.id,
        value: numValue
      })
      
      // Success!
      showToast(`Successfully logged ${numValue} ${task.unit}!`, 'success')
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err && 
        err.response && typeof err.response === 'object' && 'data' in err.response && 
        err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data ? 
        String(err.response.data.error) : 'Failed to log progress'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!task) return null

  const pointsToEarn = parseFloat(value || '0') * task.pointsPerUnit

  // Keep the same imports and logic, just update the JSX:

return (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={`Log ${task.name}`}
  >
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      <div>
        <Input
          label={`How many ${task.unit}?`}
          type="number"
          step="1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0"
          autoFocus
        />
        
        {value && !isNaN(parseFloat(value)) && parseFloat(value) > 0 && (
          <div className="mt-3 bg-accent-50 text-accent-700 px-4 py-3 rounded-xl">
            <p className="text-sm font-medium">
              You'll earn {pointsToEarn} points
            </p>
          </div>
        )}
      </div>
      
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          className="flex-1"
          isLoading={isLoading}
          disabled={!value || parseFloat(value) <= 0}
        >
          Log Progress
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  </Modal>
)
}
