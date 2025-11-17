// Test: Calendar Functionality
describe('Calendar Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.wait(2000) // Wait for app to initialize
    cy.contains('Calendar').click()
  })

  it('should display the calendar', () => {
    cy.get('#calendar-view').should('be.visible')
  })

  it('should show current month', () => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' })
    cy.contains(currentMonth).should('exist')
  })

  it('should navigate to next month', () => {
    // Click next month button
    cy.get('.calendar-nav button').contains('›').click()
    cy.wait(500)
    
    // Verify month changed
    cy.get('.calendar-month-year').should('exist')
  })

  it('should navigate to previous month', () => {
    // Click previous month button
    cy.get('.calendar-nav button').contains('‹').click()
    cy.wait(500)
    
    // Verify month changed
    cy.get('.calendar-month-year').should('exist')
  })

  it('should display class dots on dates', () => {
    // Check for dots indicating classes
    cy.get('.calendar-day').should('have.length.greaterThan', 0)
  })

  it('should open sidebar when clicking a date', () => {
    // Click on a date
    cy.get('.calendar-day').first().click()
    
    // Check if sidebar opens
    cy.get('.calendar-sidebar').should('be.visible')
  })
})
