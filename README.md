# PrépaPQ

Application de révision hors ligne pour les apprentis carrossiers-tôliers et
carrossiers-peintres CFC, en préparation à la procédure de qualification
(EPAI-GIBS).

Cartes à réviser (recto/verso) et quiz, à partir de vos propres contenus.
Aucun compte, aucune donnée personnelle, aucun serveur : tout reste dans le
navigateur de l'apprenti, et l'application fonctionne aussi hors connexion
une fois installée.

Ce document explique, sans connaissances techniques particulières :

1. [Comment ajouter un jeu de cartes](#1-ajouter-un-jeu-de-cartes)
2. [Comment le vérifier avant publication](#2-vérifier-un-jeu-avant-publication)
3. [Comment les apprentis installent l'application](#3-installation-par-les-apprentis)

---

## Mise en route (une seule fois)

Pour que la publication automatique fonctionne, activez GitHub Pages une
première fois : dans le dépôt GitHub, **Settings → Pages → Build and
deployment → Source**, choisissez **« GitHub Actions »**. Le premier
`push` sur `main` publiera ensuite le site automatiquement, et chaque
`push` suivant le mettra à jour.

---

## 1. Ajouter un jeu de cartes

Les jeux sont des fichiers `.json` dans le dossier `public/decks/`. Chaque
fichier représente un jeu : son titre, son métier, ses cartes et son quiz.

### Étape par étape

1. Ouvrez le fichier `decks/MODELE.json` (à la racine du dépôt, **pas** dans
   `public/decks/`) : c'est un exemple commenté qui explique chaque champ.
2. Copiez son contenu dans un nouveau fichier, par exemple
   `public/decks/tolier-pq-soudure.json`. Choisissez un nom de fichier en
   minuscules, sans accent ni espace.
3. Dans votre nouveau fichier, **supprimez toutes les lignes de commentaire**
   (celles qui commencent par `//`) : un fichier `.json` réel ne doit
   contenir que les données, sans commentaire.
4. Remplissez vos propres cartes et questions de quiz.
5. Ouvrez `public/decks/index.json` et ajoutez le nom de votre nouveau
   fichier à la liste, par exemple :

   ```json
   ["exemple-tolier-redressage.json", "exemple-peintre-preparation-supports.json", "tolier-pq-soudure.json"]
   ```

6. Vérifiez votre jeu (voir section suivante) avant de le publier.

### Les champs d'un jeu

| Champ     | Description                                                                 |
| --------- | ---------------------------------------------------------------------------- |
| `id`      | Identifiant unique, minuscules et tirets (ex : `tolier-pq-soudure`). Ne change jamais après publication. |
| `titre`   | Titre affiché aux apprentis.                                                 |
| `metier`  | `"tolier"` ou `"peintre"`.                                                    |
| `annee`   | Année de formation, de 1 à 4.                                                 |
| `module`  | Nom du module ou de la thématique.                                           |
| `version` | Date de dernière mise à jour, format `AAAA-MM` (ex : `2026-09`).             |
| `cartes`  | Liste de cartes `{ "recto": "...", "verso": "..." }`.                        |
| `quiz`    | Liste de questions `{ "question", "options", "reponse", "explication" }`.    |

**Important — la `version` :** changez toujours cette valeur quand vous
modifiez le contenu des cartes ou du quiz d'un jeu déjà publié. Cela permet
à l'application de réinitialiser proprement la progression des apprentis
sur ce jeu (ils en sont informés), pour qu'ils ne révisent pas d'anciennes
réponses devenues fausses.

## 2. Vérifier un jeu avant publication

Avant d'envoyer vos modifications, vérifiez que vos fichiers sont bien
formés. Dans un terminal, à la racine du projet :

```bash
npm install      # une seule fois, à l'installation
npm run verifier
```

Le script contrôle chaque jeu : champs obligatoires, métier valide, index
de réponse du quiz cohérent, identifiants uniques, pas de carte ou de
question en double. En cas d'erreur, il indique précisément le fichier et
le problème à corriger.

Vous pouvez aussi prévisualiser l'application en local avant de publier :

```bash
npm run dev
```

**La vérification est aussi automatique** : à chaque envoi (`git push`) sur
la branche `main`, GitHub Actions relance `npm run verifier`. Si un jeu est
mal formé, la publication est bloquée et l'ancienne version reste en
ligne — vos apprentis ne voient jamais un contenu cassé.

Une fois satisfait, envoyez vos changements :

```bash
git add public/decks
git commit -m "Ajoute le jeu tolier-pq-soudure"
git push
```

Après quelques minutes, le site publié sur GitHub Pages est à jour.

## 3. Installation par les apprentis

L'application s'installe comme une application normale, directement depuis
le navigateur, sans passer par l'App Store ou le Play Store.

### Sur iPhone (Safari)

1. Ouvrir l'adresse du site dans **Safari** (pas Chrome : l'installation ne
   fonctionne que depuis Safari sur iPhone).
2. Toucher le bouton de partage (le carré avec une flèche vers le haut).
3. Choisir **« Sur l'écran d'accueil »**.
4. Confirmer avec **« Ajouter »**.

L'icône PrépaPQ apparaît alors sur l'écran d'accueil, comme une application
installée.

### Sur Android (Chrome)

1. Ouvrir l'adresse du site dans **Chrome**.
2. Toucher le menu (les trois points en haut à droite).
3. Choisir **« Installer l'application »** (ou **« Ajouter à l'écran
   d'accueil »**).
4. Confirmer.

### Une fois installée

L'application fonctionne hors connexion après une première visite : les
jeux déjà ouverts restent disponibles à l'atelier, dans le train, partout.
La progression de chaque apprenti reste sur son propre téléphone.

---

## Pour les curieux (détails techniques)

- **Stack** : Vite, React, TypeScript, Tailwind CSS, `vite-plugin-pwa`.
- **Contenus** : fichiers JSON validés par [Zod](https://zod.dev), dans
  `public/decks/`.
- **Tests** : `npm run test` (Vitest) — validation des jeux, calcul de la
  note suisse, logique de Leitner, réinitialisation de version.
- **Déploiement** : GitHub Actions publie automatiquement sur GitHub Pages
  à chaque push sur `main` (voir `.github/workflows/deploy.yml`).
- **Aucune donnée personnelle** : pas de compte, pas de mesure d'audience,
  aucun appel réseau après le premier chargement. Toute la progression vit
  dans le `localStorage` du navigateur de l'apprenti.

### Commandes utiles

```bash
npm install       # installer les dépendances
npm run dev       # lancer en local avec rechargement automatique
npm run verifier  # valider tous les jeux de cartes
npm run test      # lancer les tests
npm run build     # construire le site pour la production
```
