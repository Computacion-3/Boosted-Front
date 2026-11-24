import {
  addComment,
  apiLogin,
  createPost,
  deletePost,
  toggleLike,
  type ApiSession,
} from "../support/api";
import { loginThroughUi } from "../support/auth";

// Tiempo real (issue #40). Dos cuentas distintas:
//  - la AUTORA, que mira la app en el navegador y recibe los avisos;
//  - la OTRA PERSONA, que da like y comenta por la API mientras la autora mira.
// Credenciales: variables CYPRESS_AUTHOR_EMAIL / _PASSWORD y CYPRESS_ACTOR_EMAIL / _PASSWORD
// (o `cypress.env.json`, que no se sube al repositorio). Ver la sección de E2E del README.
describe("Notificaciones en tiempo real", () => {
  let authorCredentials: { email: string; password: string };
  let author: ApiSession; // token propio de la prueba, distinto del que usa el navegador
  let actor: ApiSession;
  let postId: string;
  let postTitle: string;

  const bell = () => cy.get('button[aria-label^="Notificaciones"]');
  const panel = () => cy.contains("section", "Notificaciones");

  before(() => {
    cy.env(["AUTHOR_EMAIL", "AUTHOR_PASSWORD", "ACTOR_EMAIL", "ACTOR_PASSWORD"]).then((env) => {
      authorCredentials = { email: env.AUTHOR_EMAIL, password: env.AUTHOR_PASSWORD };
      apiLogin(authorCredentials).then((session) => (author = session));
      apiLogin({ email: env.ACTOR_EMAIL, password: env.ACTOR_PASSWORD }).then(
        (session) => (actor = session),
      );
    });
    // Dos inicios de sesión de la misma cuenta dentro del mismo segundo dan el mismo token. Como
    // "Cerrar sesión" revoca el token, esperar evita que la última prueba invalide el de `author`.
    cy.wait(1100);
  });

  beforeEach(() => {
    postTitle = `E2E notificaciones ${Date.now()}`;
    createPost(author.token, postTitle).then((id) => (postId = id));

    loginThroughUi(authorCredentials);
    cy.visit("/events");
    // Los avisos no se guardan: quien no esté conectado cuando ocurre algo no lo recibe. Por eso
    // se espera a que el socket esté conectado antes de que la otra persona actúe.
    cy.get('[data-connection="connected"]').should("exist");
  });

  afterEach(() => {
    deletePost(author.token, postId);
  });

  it("muestra la campana conectada y sin avisos", () => {
    bell().should("have.attr", "aria-label", "Notificaciones");
    cy.get("header .indicator-item").should("not.exist");

    bell().click();
    panel().should("contain.text", "Aún no tienes notificaciones.");
  });

  it("un like de otra persona sube el contador y muestra un aviso flotante", () => {
    toggleLike(actor.token, postId);

    bell().should("have.attr", "aria-label", "Notificaciones, 1 sin leer");
    cy.get(".toast").should("contain.text", `${actor.name} le dio like a tu publicación`);
  });

  it("un comentario aparece en la lista y su enlace lleva a la publicación", () => {
    addComment(actor.token, postId, "Muy buen trabajo con ese escape.");

    bell().should("have.attr", "aria-label", "Notificaciones, 1 sin leer");
    bell().click();
    panel()
      .find("li a")
      .should("have.length", 1)
      .and("contain.text", `${actor.name} comentó tu publicación «${postTitle}»`)
      .and("have.attr", "href", `/posts/${postId}`)
      .click();

    cy.location("pathname").should("eq", `/posts/${postId}`);
  });

  it("acumula los avisos y «Marcar como leídas» deja el contador en cero", () => {
    toggleLike(actor.token, postId);
    addComment(actor.token, postId, "Primer comentario.");

    bell().should("have.attr", "aria-label", "Notificaciones, 2 sin leer");
    bell().click();
    panel().find("li a").should("have.length", 2);

    panel().contains("button", "Marcar como leídas").click();

    bell().should("have.attr", "aria-label", "Notificaciones");
    // Siguen en la lista, solo que ya no están marcadas como sin leer.
    panel().find("li a").should("have.length", 2);
  });

  it("no avisa del like propio ni de quitar un like", () => {
    toggleLike(author.token, postId); // la autora se da like a sí misma
    toggleLike(actor.token, postId); //  like de la otra persona: avisa
    toggleLike(actor.token, postId); //  lo quita: no avisa
    addComment(actor.token, postId, "Control: este sí debe avisar."); // el comentario llega después

    // Los eventos llegan en orden: cuando se ve el aviso del comentario, los anteriores ya pasaron.
    bell().should("have.attr", "aria-label", "Notificaciones, 2 sin leer");
    bell().click();
    panel().find("li a").should("have.length", 2);
  });

  // Va al final: cerrar sesión revoca el token del navegador.
  it("al cerrar sesión desaparece la campana", () => {
    cy.get('button[aria-label^="Menú de"]').click();
    cy.contains('[role="menuitem"]', "Cerrar sesión").click();

    cy.location("pathname").should("eq", "/");
    cy.get('button[aria-label^="Notificaciones"]').should("not.exist");
  });
});
