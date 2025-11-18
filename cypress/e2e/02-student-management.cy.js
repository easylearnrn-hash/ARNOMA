// Test: Student Management
describe('Student Management', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.wait(2000); // Wait for app to initialize
  });

  it('should navigate to students view', () => {
    cy.contains('Students').click();
    cy.url().should('include', '#students');
  });

  it('should display student cards', () => {
    cy.contains('Students').click();
    cy.wait(1000);
    cy.get('.student-card').should('exist');
  });

  it('should open student edit modal when clicking a student', () => {
    cy.contains('Students').click();
    cy.wait(1000);

    // Click on first student card
    cy.get('.student-card').first().click();

    // Check if modal opens
    cy.get('#studentModal').should('be.visible');
  });

  it('should display student information in modal', () => {
    cy.contains('Students').click();
    cy.wait(1000);

    cy.get('.student-card').first().click();

    // Check for form fields
    cy.get('#studentName').should('exist');
    cy.get('#studentEmail').should('exist');
    cy.get('#studentPhone').should('exist');
  });

  it('should close modal when clicking cancel', () => {
    cy.contains('Students').click();
    cy.wait(1000);

    cy.get('.student-card').first().click();
    cy.get('#studentModal').should('be.visible');

    // Click cancel button
    cy.contains('Cancel').click();
    cy.get('#studentModal').should('not.be.visible');
  });
});
