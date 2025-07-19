import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../utils/test-utils'
import { TaskCard } from '../../components/TaskCard'
import { mockTasks } from '../utils/test-utils'

describe('TaskCard', () => {
  const mockOnLogProgress = vi.fn()
  const task = mockTasks[0]

  beforeEach(() => {
    mockOnLogProgress.mockClear()
  })

  it('renders task information correctly', () => {
    render(
      <TaskCard 
        task={task}
        todayProgress={0}
        onLogProgress={mockOnLogProgress}
      />
    )

    expect(screen.getByText('Exercise')).toBeInTheDocument()
    expect(screen.getByText('1 point per minutes')).toBeInTheDocument()
  })

  it('shows no progress when todayProgress is 0', () => {
    render(
      <TaskCard 
        task={task}
        todayProgress={0}
        onLogProgress={mockOnLogProgress}
      />
    )

    expect(screen.getByRole('button', { name: /log progress/i })).toBeInTheDocument()
    expect(screen.queryByText(/minutes today/)).not.toBeInTheDocument()
  })

  it('shows progress when todayProgress > 0', () => {
    render(
      <TaskCard 
        task={task}
        todayProgress={30}
        onLogProgress={mockOnLogProgress}
      />
    )

    expect(screen.getByText('30 minutes today')).toBeInTheDocument()
  })

  it('calls onLogProgress when Log Progress button is clicked', () => {
    render(
      <TaskCard 
        task={task}
        todayProgress={0}
        onLogProgress={mockOnLogProgress}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /log progress/i }))
    expect(mockOnLogProgress).toHaveBeenCalledWith(task)
  })

  it('shows correct point calculation for multi-point tasks', () => {
    const multiPointTask = mockTasks[1] // Reading task with 2 points per unit

    render(
      <TaskCard 
        task={multiPointTask}
        todayProgress={0}
        onLogProgress={mockOnLogProgress}
      />
    )

    expect(screen.getByText('Reading')).toBeInTheDocument()
    expect(screen.getByText('2 points per pages')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(
      <TaskCard 
        task={task}
        todayProgress={0}
        onLogProgress={mockOnLogProgress}
      />
    )

    const button = screen.getByRole('button', { name: /log progress/i })
    expect(button).toBeInTheDocument()
    expect(button).not.toBeDisabled()
  })
})