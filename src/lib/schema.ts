import { z } from "zod";

/**
 * Schéma d'un jeu de cartes PrépaPQ.
 * Toute évolution de ce schéma doit rester rétrocompatible avec les jeux
 * déjà déposés dans public/decks/, ou s'accompagner d'un changement de
 * version des jeux concernés (voir decks/MODELE.json).
 */

export const metierSchema = z.enum(["tolier", "peintre"], {
  error: "le métier doit être « tolier » ou « peintre »",
});

export type Metier = z.infer<typeof metierSchema>;

export const carteSchema = z.object({
  recto: z.string().trim().min(1, "le recto d'une carte ne peut pas être vide"),
  verso: z.string().trim().min(1, "le verso d'une carte ne peut pas être vide"),
});

export type Carte = z.infer<typeof carteSchema>;

export const questionQuizSchema = z
  .object({
    question: z.string().trim().min(1, "la question ne peut pas être vide"),
    options: z
      .array(z.string().trim().min(1, "une option ne peut pas être vide"))
      .min(2, "une question doit avoir au moins 2 options")
      .max(6, "une question ne peut pas avoir plus de 6 options"),
    reponse: z.number().int().min(0, "l'index de la réponse doit être positif"),
    explication: z.string().trim().min(1, "l'explication ne peut pas être vide"),
  })
  .refine((q) => q.reponse < q.options.length, {
    message: "l'index de la réponse dépasse le nombre d'options",
    path: ["reponse"],
  });

export type QuestionQuiz = z.infer<typeof questionQuizSchema>;

const normaliser = (texte: string) => texte.trim().toLowerCase();

export const deckSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(1, "l'identifiant du jeu est obligatoire")
      .regex(
        /^[a-z0-9]+(-[a-z0-9]+)*$/,
        "l'identifiant doit être en minuscules, sans accent, avec des tirets (ex: tolier-pq-redressage)",
      ),
    titre: z.string().trim().min(1, "le titre est obligatoire"),
    metier: metierSchema,
    annee: z
      .number()
      .int("l'année doit être un nombre entier")
      .min(1, "l'année doit être comprise entre 1 et 4")
      .max(4, "l'année doit être comprise entre 1 et 4"),
    module: z.string().trim().min(1, "le module est obligatoire"),
    version: z
      .string()
      .trim()
      .regex(
        /^\d{4}-\d{2}$/,
        "la version doit être au format AAAA-MM (ex: 2026-09)",
      ),
    cartes: z.array(carteSchema).min(1, "un jeu doit contenir au moins une carte"),
    quiz: z
      .array(questionQuizSchema)
      .min(1, "un jeu doit contenir au moins une question de quiz"),
  })
  .superRefine((deck, ctx) => {
    const rectosVus = new Map<string, number>();
    deck.cartes.forEach((carte, index) => {
      const cle = normaliser(carte.recto);
      const premiereFois = rectosVus.get(cle);
      if (premiereFois !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `carte en double : « ${carte.recto} » apparaît déjà à l'index ${premiereFois}`,
          path: ["cartes", index, "recto"],
        });
      } else {
        rectosVus.set(cle, index);
      }
    });

    const questionsVues = new Map<string, number>();
    deck.quiz.forEach((question, index) => {
      const cle = normaliser(question.question);
      const premiereFois = questionsVues.get(cle);
      if (premiereFois !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `question en double : « ${question.question} » apparaît déjà à l'index ${premiereFois}`,
          path: ["quiz", index, "question"],
        });
      } else {
        questionsVues.set(cle, index);
      }
    });
  });

export type Deck = z.infer<typeof deckSchema>;

export const deckIndexSchema = z
  .array(z.string().trim().min(1))
  .min(1, "l'index des jeux ne peut pas être vide");
