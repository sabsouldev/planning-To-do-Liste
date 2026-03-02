# 📅 Planning Hebdomadaire Interactif

Une application web moderne et interactive pour organiser sa semaine, construite avec **React** + **Vite**.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Fonctionnalités

### 🗓 Planning de la semaine
- Affichage des **7 jours** de la semaine sous forme de cartes colorées
- **Tri automatique** des événements par horaire dans chaque journée
- **Modification** de chaque événement (horaire, label, catégorie) en un clic
- **Suppression** d'un événement ou d'un jour entier (avec confirmation)
- Indicateur visuel lors du **glisser-déposer** depuis la To-Do List

### 📋 To-Do List
- Liste de tâches affichée **en bas de l'écran**, en ligne
- Ajout d'une tâche avec **horaire optionnel** et **catégorie**
- **Glisser-déposer** d'une tâche directement dans un jour du planning
- Cochage des tâches terminées avec section dédiée
- Nettoyage rapide des tâches terminées

### 🎨 Interface
- Design sombre et moderne (dark theme)
- **9 catégories** colorées : Aide, Travail, Plaisir, Maison, Rendez-vous, Note, Sport, Courses, Autre
- Entièrement **responsive** grâce à CSS Grid
- Zéro dépendance externe — uniquement React

---

## 🚀 Installation & Démarrage

### Prérequis
- [Node.js](https://nodejs.org/) v18 ou supérieur
- npm v9 ou supérieur

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/votre-utilisateur/planning-hebdomadaire.git

# 2. Aller dans le dossier
cd planning-hebdomadaire

# 3. Installer les dépendances
npm install

# 4. Lancer en mode développement
npm run dev
```

L'application sera disponible sur [http://localhost:5173](http://localhost:5173)

### Build de production

```bash
npm run build
```

Les fichiers optimisés seront générés dans le dossier `dist/`.

---

## 🗂 Structure du projet

```
mon-planning/
├── public/
├── src/
│   ├── App.jsx          # Composant principal — toute la logique et l'UI
│   ├── main.jsx         # Point d'entrée React
│   └── index.css        # Styles globaux (reset CSS)
├── index.html
├── package.json
└── vite.config.js
```

---

## 🧠 Architecture & Choix techniques

| Technologie | Rôle |
|-------------|------|
| **React 18** | UI déclarative, gestion d'état avec `useState` |
| **useRef** | Référence à la tâche en cours de glisser-déposer |
| **Vite 7** | Bundler ultra-rapide, HMR instantané |
| **CSS-in-JS** | Styles inline pour un composant auto-suffisant |
| **HTML5 Drag & Drop API** | Glisser-déposer natif sans librairie externe |

Toutes les données sont gérées **en mémoire** via le state React. Il n'y a pas de backend ni de base de données — les données sont réinitialisées au rechargement de la page.

---

## 📌 Utilisation

### Modifier un événement
Cliquer sur ✏️ sur n'importe quelle carte pour éditer l'horaire, le libellé ou la catégorie.

### Glisser une tâche dans le planning
1. Créer une tâche dans la **To-Do List** en bas
2. Attraper la tâche par la poignée **⠿**
3. La faire glisser vers le jour souhaité — la carte s'illumine pour indiquer le dépôt
4. La tâche apparaît automatiquement dans le jour, triée par horaire

### Ajouter / supprimer un jour
Le bouton **✕** en haut à droite de chaque carte permet de supprimer un jour (avec confirmation).

---

## 🔮 Améliorations futures possibles

- [ ] Sauvegarde locale avec `localStorage`
- [ ] Export PDF ou impression du planning
- [ ] Semaines multiples avec navigation
- [ ] Mode clair / sombre
- [ ] Synchronisation avec Google Agenda

---

## 🙋 Origine du projet

Ce projet est né d'un besoin personnel : retranscrire un planning papier hebdomadaire en outil numérique simple, visuel et modifiable. Il a été développé de manière itérative en partant d'une photo du planning manuscrit.

---

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE) — libre d'utilisation, de modification et de distribution.
