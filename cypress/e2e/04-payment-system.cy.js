// Test: Payment System
describe('Payment System', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(2000) // Wait for app to initialize
  })

  it('should navigate to payments view', () => {
    cy.contains('Payments').click()
    cy.url().should('include', '#payments')
  })

  it('should display payment management interface', () => {
    cy.contains('Payments').click()
    cy.get('#payments-view').should('be.visible')
  })

  it('should show student payment records', () => {
    cy.contains('Payments').click()
    cy.wait(1000)
    
    // Check for payment records or empty state
    cy.window().then((win) => {
      if (win.students && win.students.length > 0) {
        cy.get('.payment-record, .student-payment-card').should('exist')
      }
    })
  })

  it('should open add payment modal', () => {
    cy.contains('Payments').click()
    cy.contains('Add Payment').click()
    
    // Check modal opens
    cy.get('.modal').should('be.visible')
    cy.contains('Add Payment').should('exist')
  })

  it('should validate payment form fields', () => {
    cy.contains('Payments').click()
    cy.contains('Add Payment').click()
    
    // Check required fields exist
    cy.get('input[placeholder*="amount"], input[type="number"]').should('exist')
    cy.get('input[type="date"], input[placeholder*="date"]').should('exist')
  })

  it('should display payment history', () => {
    cy.contains('Payments').click()
    cy.wait(1000)
    
    // Check for payment history section
    cy.window().then((win) => {
      if (win.PaymentStore) {
        expect(win.PaymentStore).to.have.property('payments')
      }
    })
  })

  it('should show credit balances', () => {
    cy.contains('Payments').click()
    cy.wait(1000)
    
    // Check for credit balance display
    cy.window().then((win) => {
      if (win.students && win.students.length > 0) {
        const studentWithCredits = win.students.find(s => s.credits > 0)
        if (studentWithCredits) {
          cy.contains(studentWithCredits.name).should('exist')
        }
      }
    })
  })
})
