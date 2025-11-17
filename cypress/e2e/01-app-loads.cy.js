// Test: ARNOMA Application Loads Successfully
describe('ARNOMA Application', () => {
  beforeEach(() => {
    // Visit the application before each test
    cy.visit('/')
  })

  it('should load the homepage successfully', () => {
    // Check that the page loads
    cy.title().should('include', 'ARNOMA')
  })

  it('should display the main navigation', () => {
    // Check for main UI elements
    cy.get('.floating-nav').should('be.visible')
  })

  it('should have Supabase initialized', () => {
    // Wait for app to initialize
    cy.wait(2000)
    
    // Check console for initialization message
    cy.window().then((win) => {
      expect(win.supabase).to.exist
    })
  })

  it('should load students data', () => {
    // Wait for data to load
    cy.wait(3000)
    
    // Check if students array exists
    cy.window().then((win) => {
      expect(win.students).to.be.an('array')
    })
  })

  it('should display the calendar view', () => {
    // Click on calendar tab if not already visible
    cy.contains('Calendar').click()
    
    // Check that calendar is rendered
    cy.get('#calendar-view').should('be.visible')
  })

  it('should display the student list', () => {
    // Click on students tab
    cy.contains('Students').click()
    
    // Check that student list is rendered
    cy.get('.student-card').should('have.length.greaterThan', 0)
  })
})
