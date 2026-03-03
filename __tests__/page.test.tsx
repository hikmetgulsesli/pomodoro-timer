import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '../app/page'

describe('Home Page', () => {
  it('renders the pomodoro header', () => {
    render(<Home />)
    expect(screen.getByText('Pomodoro')).toBeInTheDocument()
  })

  it('renders the welcome message', () => {
    render(<Home />)
    expect(screen.getByText('Welcome to Pomodoro Timer')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Home />)
    expect(screen.getByText('Stats')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Log In')).toBeInTheDocument()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })
})
