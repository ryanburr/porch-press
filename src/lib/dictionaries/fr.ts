import type { Dictionary } from "./en";

// French puts a non-breaking space ( ) before : ? and inside « ».
export const fr: Dictionary = {
  meta: {
    description: "Le journal de votre ville, livré sur votre perron.",
  },
  masthead: {
    established: "Fondé en 2026 · Ravivé sur le perron",
    price: "Gratuit · Quotidien",
    tagline: "Le journal de chez vous, livré sur votre perron.",
    language: "Langue",
  },
  front: {
    skip: "Aller aux actualités",
    edition: "Édition de {place}",
    print: "Imprimer mon journal",
    sampleLabel: "Édition d’exemple",
    sampleNote: "Ajoutez une clé d’API Perplexity pour imprimer les vraies actualités du jour.",
    glance: "En un coup d’œil",
    howItWorks: "Comment ça marche :",
    howItWorksBody: "L’IA compose la une du jour à partir de l’actualité locale. Chaque article renvoie aux sources dont il est tiré.",
    disclaimer: "Ce journal est rédigé par une IA. Elle peut encore se tromper : vérifiez les sources avant de partager.",
  },
  picker: {
    label: "Trouvez votre quartier ou votre ville",
    placeholder: "Rechercher un quartier ou une ville",
    list: "Quartiers et villes",
    noMatch: "Aucun résultat pour « {text} ». Vérifiez l’orthographe ou essayez un quartier voisin.",
    found: { one: "{count} lieu trouvé", other: "{count} lieux trouvés" },
    none: "Aucun lieu trouvé",
  },
  sidebar: {
    weather: "La météo du jour",
    briefs: "En bref",
  },
  states: {
    loading: "Arrêtez les rotatives…",
    loadingNote: "Rédaction du journal du jour pour {town}.",
    jam: "La rotative s’est enrayée : impossible de charger cette édition.",
    retry: "Réessayer",
  },
  story: {
    sources: "Sources :",
    lead: "À la une",
  },
  sections: {
    "City Hall": "Mairie",
    Schools: "Écoles",
    Development: "Urbanisme",
    "Public Safety": "Sécurité publique",
    Business: "Économie",
    Community: "Vie locale",
    Sports: "Sports",
  },
  article: {
    skip: "Aller à l’article",
    breadcrumb: "Fil d’Ariane",
    back: "← La une",
    missing: "Cet article n’est pas dans le journal du jour",
    missingNote: "Les éditions changent chaque jour. Retournez à la une pour l’actualité du jour.",
    backToFront: "Retour à la une",
    byline: "Rédigé par une IA à partir de l’actualité locale",
    sourceCount: { one: "{count} source", other: "{count} sources" },
    failed: "Notre reporter n’a pas pu rendre cet article. Réessayez.",
    filing: "Rédaction de l’article complet…",
    about: "À propos de cet article",
    sources: "Sources",
    share: "Partager ou imprimer",
    copy: "Copier le lien",
    printLetter: "Imprimer, format Letter",
    disclaimer:
      "Ce journal est rédigé par une IA à partir de l’actualité locale. Elle peut encore se tromper : vérifiez les sources avant de partager.",
  },
  ask: {
    title: "Poser une question",
    tag: "IA",
    intro:
      "Des questions sur cet article, avec des réponses tirées de l’actualité locale la plus récente. Choisissez-en une ou écrivez la vôtre.",
    suggestedLabel: "Questions suggérées",
    suggested: [
      "Quand a lieu la prochaine réunion ou le prochain vote ?",
      "Comment les habitants peuvent-ils donner leur avis ?",
      "Que se passe-t-il ensuite ?",
    ],
    inputLabel: "Votre question sur cet article",
    placeholder: "Posez une question sur cet article",
    submit: "Demander",
    youAsked: "Votre question : {question}",
    checking: "Vérification de l’actualité la plus récente…",
    failed: "Désolé, la rédaction n’a pas pu répondre à cette question. Réessayez.",
    disclaimer: "Les réponses sont rédigées par une IA et peuvent être fausses. Vérifiez les sources indiquées.",
  },
};
