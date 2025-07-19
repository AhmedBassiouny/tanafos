import { describe, it, expect } from 'vitest'
import { render, screen } from '../utils/test-utils'
import { StatsCard } from '../../components/StatsCard'

describe('StatsCard', () => {
  const mockIcon = (
    <svg data-testid="test-icon">
      <circle cx="50" cy="50" r="40" />
    </svg>
  )

  it('renders title, value, and subtitle correctly', () => {
    render(
      <StatsCard
        title="Total Points"
        value={150}
        subtitle="All time"
        icon={mockIcon}
      />
    )

    expect(screen.getByText('Total Points')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
    expect(screen.getByText('All time')).toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    render(
      <StatsCard
        title="Test Title"
        value={100}
        subtitle="Test Subtitle"
        icon={mockIcon}
      />
    )

    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('handles string values', () => {
    render(
      <StatsCard
        title="Current Rank"
        value="#3"
        subtitle="Overall leaderboard"
        icon={mockIcon}
      />
    )

    expect(screen.getByText('#3')).toBeInTheDocument()
  })

  it('handles zero values', () => {
    render(
      <StatsCard
        title="Tasks Today"
        value={0}
        subtitle="Completed"
        icon={mockIcon}
      />
    )

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('handles large numbers', () => {
    render(
      <StatsCard
        title="Total Points"
        value={1234567}
        subtitle="All time"
        icon={mockIcon}
      />
    )

    expect(screen.getByText('1234567')).toBeInTheDocument()
  })

  it('has proper styling classes', () => {
    const { container } = render(
      <StatsCard
        title="Test"
        value={100}
        subtitle="Test"
        icon={mockIcon}
      />
    )

    // Check that the card has proper styling
    const card = container.firstChild
    expect(card).toHaveClass('bg-white')
  })
})