import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TeamManagement from './TeamManagement'
import { TeamMember } from '../types'
import { useTeamStore } from '../store/teamStore'

// Mock the store
vi.mock('../store/teamStore')

const mockMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    role: 'SE',
    baseCapacityPerSprint: 2,
    roleEffectiveness: 0.8,
    companyTenureMonths: 24,
    teamTenureMonths: 12,
    isUpskilling: false,
    holidays: [],
  },
  {
    id: '2',
    name: 'Jane Smith',
    role: 'SSE',
    baseCapacityPerSprint: 2,
    roleEffectiveness: 0.9,
    companyTenureMonths: 36,
    teamTenureMonths: 24,
    isUpskilling: true,
    holidays: [],
  }
]

const defaultProps = {
  members: mockMembers,
  onMembersChange: vi.fn(),
  sprintLengthWeeks: 2,
  planningStartDate: new Date('2024-01-01'),
  planningEndDate: new Date('2024-12-31'),
}

const mockStore = {
  members: mockMembers,
  addMember: vi.fn(),
  updateMember: vi.fn(),
  deleteMember: vi.fn(),
  setMembers: vi.fn(),
}

beforeEach(() => {
  vi.mocked(useTeamStore).mockReturnValue(mockStore)
  vi.clearAllMocks()
})

describe('TeamManagement', () => {
  describe('Edit Button Functionality', () => {
    test('should show edit form when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(<TeamManagement {...defaultProps} />)
      
      const editButtons = screen.getAllByTitle('Edit member')
      await user.click(editButtons[0])
      
      expect(screen.getByText('Edit Team Member')).toBeInTheDocument()
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    })

    test('should populate edit form with member data', async () => {
      const user = userEvent.setup()
      render(<TeamManagement {...defaultProps} />)
      
      const editButtons = screen.getAllByTitle('Edit member')
      await user.click(editButtons[0])
      
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('SE')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2')).toBeInTheDocument()
      expect(screen.getByDisplayValue('24')).toBeInTheDocument()
      expect(screen.getByDisplayValue('12')).toBeInTheDocument()
    })

    test('should save changes when edit form is submitted', async () => {
      const user = userEvent.setup()
      render(<TeamManagement {...defaultProps} />)
      
      const editButtons = screen.getAllByTitle('Edit member')
      await user.click(editButtons[0])
      
      const nameInput = screen.getByDisplayValue('John Doe')
      await user.clear(nameInput)
      await user.type(nameInput, 'John Updated')
      
      const saveButton = screen.getByText('Save Changes')
      await user.click(saveButton)
      
      expect(mockStore.updateMember).toHaveBeenCalledWith('1', expect.objectContaining({
        name: 'John Updated',
        id: '1',
        role: 'SE'
      }))
    })

    test('should close edit form when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<TeamManagement {...defaultProps} />)
      
      const editButtons = screen.getAllByTitle('Edit member')
      await user.click(editButtons[0])
      
      expect(screen.getByText('Edit Team Member')).toBeInTheDocument()
      
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)
      
      expect(screen.queryByText('Edit Team Member')).not.toBeInTheDocument()
    })

    test('should only show one edit form at a time', async () => {
      const user = userEvent.setup()
      render(<TeamManagement {...defaultProps} />)
      
      const editButtons = screen.getAllByTitle('Edit member')
      
      // Click first edit button
      await user.click(editButtons[0])
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      
      // Click second edit button
      await user.click(editButtons[1])
      expect(screen.queryByDisplayValue('John Doe')).not.toBeInTheDocument()
      expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument()
    })
  })

  describe('Delete Button Functionality', () => {
    test('should show confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
      
      render(<TeamManagement {...defaultProps} />)
      
      const deleteButtons = screen.getAllByTitle('Delete member')
      await user.click(deleteButtons[0])
      
      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this team member?')
      confirmSpy.mockRestore()
    })

    test('should delete member when confirmation is accepted', async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
      
      render(<TeamManagement {...defaultProps} />)
      
      const deleteButtons = screen.getAllByTitle('Delete member')
      await user.click(deleteButtons[0])
      
      expect(mockStore.deleteMember).toHaveBeenCalledWith('1')
      confirmSpy.mockRestore()
    })

    test('should not delete member when confirmation is cancelled', async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
      
      render(<TeamManagement {...defaultProps} />)
      
      const deleteButtons = screen.getAllByTitle('Delete member')
      await user.click(deleteButtons[0])
      
      expect(mockStore.deleteMember).not.toHaveBeenCalled()
      confirmSpy.mockRestore()
    })

    test('should prevent event propagation on delete button click', async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
      const parentClickHandler = vi.fn()
      
      render(
        <div onClick={parentClickHandler}>
          <TeamManagement {...defaultProps} />
        </div>
      )
      
      const deleteButtons = screen.getAllByTitle('Delete member')
      await user.click(deleteButtons[0])
      
      expect(parentClickHandler).not.toHaveBeenCalled()
      confirmSpy.mockRestore()
    })
  })

  describe('Button Event Handling', () => {
    test('should prevent event propagation on edit button click', async () => {
      const user = userEvent.setup()
      const parentClickHandler = vi.fn()
      
      render(
        <div onClick={parentClickHandler}>
          <TeamManagement {...defaultProps} />
        </div>
      )
      
      const editButtons = screen.getAllByTitle('Edit member')
      await user.click(editButtons[0])
      
      expect(parentClickHandler).not.toHaveBeenCalled()
    })

    test('should have correct button types to prevent form submission', () => {
      render(<TeamManagement {...defaultProps} />)
      
      const editButtons = screen.getAllByTitle('Edit member')
      const deleteButtons = screen.getAllByTitle('Delete member')
      
      editButtons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button')
      })
      
      deleteButtons.forEach(button => {
        expect(button).toHaveAttribute('type', 'button')
      })
    })
  })

  describe('Form State Management', () => {
    test('should clear showAddForm when editing existing member', async () => {
      const user = userEvent.setup()
      render(<TeamManagement {...defaultProps} />)
      
      // First click add member to set showAddForm to true
      const addButton = screen.getByRole('button', { name: /add team member/i })
      await user.click(addButton)
      
      expect(screen.getByRole('heading', { name: /add team member/i })).toBeInTheDocument()
      
      // Then click edit on existing member
      const editButtons = screen.getAllByTitle('Edit member')
      await user.click(editButtons[0])
      
      // Should now show edit form, not add form
      expect(screen.getByRole('heading', { name: /edit team member/i })).toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: /add team member/i })).not.toBeInTheDocument()
    })

    test('should handle role change and update effectiveness', async () => {
      const user = userEvent.setup()
      render(<TeamManagement {...defaultProps} />)
      
      const editButtons = screen.getAllByTitle('Edit member')
      await user.click(editButtons[0])
      
      const roleSelect = screen.getByDisplayValue('SE')
      await user.selectOptions(roleSelect, 'SSE')
      
      const saveButton = screen.getByText('Save Changes')
      await user.click(saveButton)
      
      expect(mockStore.updateMember).toHaveBeenCalledWith('1', expect.objectContaining({
        role: 'SSE',
        roleEffectiveness: expect.any(Number)
      }))
    })
  })
})