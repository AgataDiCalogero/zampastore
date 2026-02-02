const buildUser = () => {
  const stamp = Date.now();
  return {
    name: `E2E User ${stamp}`,
    email: `e2e_${stamp}@zampastore.test`,
    password: 'Demo123!',
  };
};

const registerViaUi = () => {
  const user = buildUser();
  cy.visit('/registrazione');
  cy.get('#username').type(user.name);
  cy.get('#email').type(user.email);
  cy.get('#password').type(user.password);
  cy.get('#confirmPassword').type(user.password);
  cy.contains('button', 'Crea account').click();
  cy.location('pathname').should('eq', '/');
  return user;
};

describe('ZampaStore e2e', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.visit('/');
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
  });

  it('checkout flow: register → add to cart → confirmation', () => {
    registerViaUi();

    cy.intercept('GET', '**/api/products*').as('getProducts');
    cy.visit('/prodotti');
    cy.wait('@getProducts');

    cy.get('app-product-card').first().as('productCard');
    cy.get('@productCard').should('be.visible');
    cy.get('@productCard').contains('button', 'Aggiungi').click();

    cy.visit('/carrello');
    cy.contains('button', 'Vai al checkout').should('be.visible').click();

    cy.get('#firstName').type('Maria');
    cy.get('#lastName').type('Rossi');
    cy.get('#address').type('Via Roma 10');
    cy.get('#city').type('Torino');
    cy.get('#postalCode').type('10100');
    cy.get('#country').type('Italia');

    cy.intercept('POST', '**/api/payments/checkout-session', (req) => {
      req.headers['x-e2e-test'] = 'true';
      req.continue();
    }).as('checkoutSession');

    cy.contains('button', 'Paga con Stripe (test)').click();
    cy.url().should('include', '/ordine-confermato');
    cy.contains('h2', 'Ordine confermato').should('be.visible');

    cy.contains('button', 'I miei ordini').click();
    cy.url().should('include', '/ordini');
    cy.contains('th', 'Stato').should('be.visible');
    cy.contains('Pagato').should('be.visible');
  });

  it('ordini richiede autenticazione', () => {
    cy.visit('/ordini');
    cy.url().should('include', '/login');
    cy.get('.auth-card').should('be.visible');
    cy.get('form.auth-form #email').should('be.visible');
    cy.contains('button', 'Accedi').should('be.visible');
  });
});
