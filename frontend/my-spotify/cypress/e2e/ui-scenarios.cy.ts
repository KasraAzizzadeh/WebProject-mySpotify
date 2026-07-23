describe('UI scenario coverage', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/login');
  });

  it('logs in as a listener and reaches the home dashboard', () => {
    cy.get('input[placeholder="Email"]').type('alex@gmail.com');
    cy.get('input[placeholder="Password"]').type('Alex_1234');
    cy.contains('button', 'Login').click();

    cy.url().should('include', '/home');
    cy.contains('Recently Played Playlists').should('be.visible');
    cy.contains('Trending Songs').should('be.visible');
  });

  it('opens the forgot password route from login', () => {
    cy.contains('Forgot your password?').click();
    cy.url().should('include', '/reset-password');
  });

  it('registers a new listener and lands on home', () => {
    cy.visit('/register');
    cy.contains('label', 'Name').parent().find('input').type('Cleo Hart');
    cy.contains('label', 'Email').parent().find('input').type('cleo@example.com');
    cy.contains('label', 'Password').parent().find('input').type('Cleo_1234');
    cy.contains('label', 'Confirm Password').parent().find('input').type('Cleo_1234');
    cy.contains('label', 'Birthdate').parent().find('input').type('1996-07-01');
    cy.get('select').select('female');
    cy.contains('label', /Privacy Policy/i).click();
    cy.contains('button', 'Register').click();

    cy.url().should('include', '/home');
  });

  it('opens settings and shows delete account controls', () => {
    cy.visit('/login');
    cy.get('input[placeholder="Email"]').type('jane@gmail.com');
    cy.get('input[placeholder="Password"]').type('J123_abcd');
    cy.contains('button', 'Login').click();

    cy.visit('/settings');
    cy.contains('Account').should('be.visible');
    cy.contains('Subscription').should('be.visible');
    cy.contains('button', 'Delete').should('be.visible');
  });
});
