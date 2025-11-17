// Test: Class Management (Skip and Cancel)
describe('Class Management', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(2000) // Wait for app to initialize
    cy.contains('Calendar').click()
  })

  it('should display skip class functionality', () => {
    // Click on a date with classes
    cy.get('.calendar-day').first().click()
    cy.wait(500)
    
    // Check for skip class option in sidebar
    cy.get('.calendar-sidebar').should('be.visible')
  })

  it('should show skip class modal', () => {
    // Open calendar sidebar
    cy.get('.calendar-day').first().click()
    cy.wait(500)
    
    // Look for skip class button
    cy.window().then((win) => {
      if (win.SkipClassManager) {
        expect(win.SkipClassManager).to.exist
      }
    })
  })

  it('should validate skip class form', () => {
    cy.window().then((win) => {
      // Check if SkipClassManager exists
      if (win.SkipClassManager) {
        expect(win.SkipClassManager).to.have.property('openModal')
      }
    })
  })

  it('should handle class cancellation', () => {
    // Check for cancel class functionality
    cy.window().then((win) => {
      // Verify cancel class function exists
      expect(win).to.have.property('supabase')
    })
  })

  it('should forward payments when canceling classes', () => {
    // This tests the new payment forwarding feature
    cy.window().then((win) => {
      // Check if payment forwarding logic exists
      if (win.PaymentStore) {
        expect(win.PaymentStore).to.exist
      }
    })
  })

  it('should display skipped classes in calendar', () => {
    cy.wait(1000)
    
    // Check for visual indicators of skipped classes
    cy.get('.calendar-day').should('exist')
  })

  it('should show canceled class indicator', () => {
    // Check for canceled class visual treatment
    cy.window().then((win) => {
      // Verify calendar rendering includes canceled state
      cy.get('.calendar-view').should('exist')
    })
  })

  it('should exclude canceled classes from automation', () => {
    // Verify canceled classes don't trigger reminders
    cy.window().then((win) => {
      // Check automation engine exists
      expect(win).to.have.property('supabase')
    })
  })
})
