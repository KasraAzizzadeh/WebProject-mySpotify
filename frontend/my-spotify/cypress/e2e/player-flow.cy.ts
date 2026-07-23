describe('Playback interaction flows', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/login');
    cy.get('input[placeholder="Email"]').type('jane@gmail.com');
    cy.get('input[placeholder="Password"]').type('J123_abcd');
    cy.contains('button', 'Login').click();
    cy.url().should('include', '/home');
  });

  it('starts playback from the album hero action', () => {
    cy.visit('/album/a1');
    cy.contains('h1', 'Velvet Dreams').should('be.visible');
    cy.get('main').find('button').first().click();
    cy.contains('Midnight Pulse').should('be.visible');
  });

  it('opens a song from the album list and starts it', () => {
    cy.visit('/album/a1');
    cy.contains('Cosmic Drift').click();
    cy.contains('Cosmic Drift').should('be.visible');
  });

  it('pauses and resumes playback from the player controls', () => {
    cy.visit('/album/a1');
    cy.contains('h1', 'Velvet Dreams').should('be.visible');
    cy.get('main').find('button').first().click();
    cy.get('body').find('svg.lucide-pause').first().closest('button').click({ force: true });
    cy.get('body').find('svg.lucide-play').should('exist');
  });

  it('skips to the next track from the player controls', () => {
    cy.visit('/album/a1');
    cy.contains('h1', 'Velvet Dreams').should('be.visible');
    cy.get('main').find('button').first().click();
    cy.get('body').find('svg.lucide-skip-forward').first().closest('button').click({ force: true });
    cy.contains('Cosmic Drift').should('exist');
  });

  it('starts playback from a playlist view', () => {
    cy.visit('/playlist/p1');
    cy.contains('Ethereal Echoes').click();
    cy.contains('Ethereal Echoes').should('be.visible');
  });
});
