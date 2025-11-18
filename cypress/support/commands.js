// Reusable Cypress commands for ARNOMA application

// Custom command to wait for Supabase initialization
Cypress.Commands.add('waitForSupabase', () => {
  cy.window().should('have.property', 'supabase');
  cy.window().its('supabase').should('exist');
});

// Custom command to wait for students data to load
Cypress.Commands.add('waitForStudents', () => {
  cy.window().should('have.property', 'students');
  cy.window().its('students').should('be.an', 'array');
});

// Custom command to wait for groups data to load
Cypress.Commands.add('waitForGroups', () => {
  cy.window().should('have.property', 'groups');
  cy.window().its('groups').should('be.an', 'array');
});

// Custom command to navigate to a specific view
Cypress.Commands.add('navigateTo', viewName => {
  cy.contains(viewName).click();
  cy.wait(500);
});

// Custom command to open student modal
Cypress.Commands.add('openStudentModal', studentName => {
  cy.navigateTo('Students');
  if (studentName) {
    cy.contains(studentName).click();
  } else {
    cy.get('.student-card').first().click();
  }
  cy.get('.modal').should('be.visible');
});

// Custom command to close modal
Cypress.Commands.add('closeModal', () => {
  cy.get('.modal-close, button')
    .contains(/cancel|close|chiudi/i)
    .click();
  cy.get('.modal').should('not.be.visible');
});

// Custom command to wait for app initialization
Cypress.Commands.add('waitForApp', () => {
  cy.waitForSupabase();
  cy.wait(1000);
});

// Custom command to check calendar date
Cypress.Commands.add('clickCalendarDate', dayNumber => {
  cy.navigateTo('Calendar');
  if (dayNumber) {
    cy.get('.calendar-day').contains(dayNumber).click();
  } else {
    cy.get('.calendar-day').first().click();
  }
  cy.get('.calendar-sidebar').should('be.visible');
});
