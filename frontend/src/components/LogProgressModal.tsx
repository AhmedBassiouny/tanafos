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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Log ${task.name}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div>
          <Input
            label={`How many ${task.unit}?`}
            type="number"
            step="0.1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0"
            autoFocus
          />
          
          {value && !isNaN(parseFloat(value)) && parseFloat(value) > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              You'll earn <span className="font-semibold text-primary-600">
                {pointsToEarn} points
              </span>
            </p>
          )}
        </div>
        
        <div className="flex space-x-3">
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
