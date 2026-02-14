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

    cy.intercept('GET', '**/api/cart*').as('getCart');
    cy.visit('/carrello');
    cy.wait('@getCart');
    cy.get('.cart-skeleton', { timeout: 15000 }).should('not.exist');
    cy.visit('/checkout');
    cy.url().should('include', '/checkout');

    cy.get('#email').clear().type('maria.rossi@example.test').blur();
    cy.get('#firstName').clear().type('Maria').blur();
    cy.get('#lastName').clear().type('Rossi').blur();
    cy.get('#address').clear().type('Via Roma 10').blur();
    cy.get('#city').clear().type('Torino').blur();
    cy.get('#postalCode').clear().type('10100').blur();

    // Explicitly select shipping method from PrimeNG Select overlay
    cy.get('p-select[formControlName="shippingMethod"]')
      .should('be.visible')
      .within(() => {
        cy.get('.p-select-dropdown,[data-pc-section="trigger"]').click({
          force: true,
        });
      });
    cy.get('.p-select-overlay', { timeout: 10000 })
      .should('be.visible')
      .contains('li.p-select-option', 'Standard (2-3 giorni)')
      .click({ force: true });

    // Verify each field is valid to pinpoint the error
    cy.get('#email').should('have.class', 'ng-valid');
    cy.get('#firstName').should('have.class', 'ng-valid');
    cy.get('#lastName').should('have.class', 'ng-valid');
    cy.get('#address').should('have.class', 'ng-valid');
    cy.get('#city').should('have.class', 'ng-valid');
    cy.get('#postalCode').should('have.class', 'ng-valid');
    // Wait for the reactive form to become valid before submitting
    cy.get('form').should('have.class', 'ng-valid');

    // Set up intercept BEFORE the click action
    cy.intercept('POST', '**/api/payments/checkout-session', (req) => {
      req.headers['x-e2e-test'] = 'true';
      req.continue();
    }).as('checkoutSession');

    cy.contains('button', 'Paga con Stripe').should('be.enabled').click();
    cy.wait('@checkoutSession');
    cy.url({ timeout: 15000 }).should('include', '/ordine-confermato');
    cy.contains('h2', 'Ordine confermato').should('be.visible');

    cy.contains('button', 'I miei ordini').click();
    cy.url().should('include', '/ordini');
    // Verify order appears with paid status (rendering may apply uppercase via CSS)
    cy.contains(/pagato/i).should('be.visible');
  });

  it('ordini richiede autenticazione', () => {
    cy.visit('/ordini');
    cy.url().should('include', '/login');
    cy.get('.auth-card').should('be.visible');
    cy.get('form.auth-form #email').should('be.visible');
    cy.contains('button', 'Accedi').should('be.visible');
  });
});
