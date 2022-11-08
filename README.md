Refonte (WIP) du site nosdeputes.fr en Next.js

# Roadmap / objectifs

- Refaire une version propre/moderne du site nosdeputes.fr
  - en tapant sur la base MySql existante, sans se soucier de l'alimentation des données
  - conserver les mêmes pages, les mêmes URLs
    - pour l'instant c'est un bon exercice de rester iso, pour vérifier que j'ai bien compris les données, et ça m'évite de m'embarquer dans des réflexions sur la fonctionnalité
    - à terme je pense qu'il y a plein de choses à changer sur plein de pages, plein de trucs qui pourrait être plus clairs. Mais c'est pas urgent, j'attends de mieux connaître le sujet
  - exception : je ne reprends pas les "commentaires", du coup pas besoin de gestion des utilisateurs, le site final pourra être purement statique je pense (j'espère)
  - design : rien pour l'instant. A terme j'imagine quelque chose de sobre et lisible. A voir si j'essaie de reprendre un peu certains codes de nosdeputes.fr ou pas.
- Idées long terme
  - clarifier plein de trucs (réorganisation de l'information, textes explicatifs notamment)
  - par exemple j'aimerai bien faire une page pour visualiser (chronologiquement) les changements de groupe
  - reprendre l'alimentation des données
    - le opendata de l'AN a l'air très fourni, je pense qu'il y aura beaucoup moins de scraping à faire que dans la version actuelle
    - probablement passer sur une nouvelle DB, Postgres, avec quelques ajustements dans les tables/colonnes
    - on pourra facilement utiliser les deux DBs en parallele et switcher progressivement d'une ancienne DB à la nouvelle, page par page, query par query.
  - j'aimerai merger les differentes legislatures sur un seul site et une seule DB
  - bien sûr exposer les données, sous forme d'APIs et/ou de dump.
- A terme, lorsque cette version sera propre et présentable, et **si personne n'a manifesté d'autres projets pour le site nosdeputes.fr**, je demanderai probablement aux anciens de RegardsCitoyens s'ils sont OK pour faire pointer www.nosdeputes.fr vers cette nouvelle version

## Pas d'API ?

Non finalement j'ai changé d'avis, je ne pense plus que ce soit une bonne idée. Les données ne sont pas simples. Pour beaucoup de choses qu'on veut afficher il faut faire des jointures dans tous les sens. Pour faire une API qui soit utilisée par le site ce serait compliquée, il faudrait une API très flexible, qui permette de faire plein de jointures différentes, avec plein d'options de filtrage. C'est un gros projet.

De plus quand on envisageait cette API, c'est parce qu'on pensait être nombreux à coder. Finalement ce n'est pas le cas, il faut donc être un peu plus pragmatique.

Rien n'empêchera à terme d'exposer les données, via des endpoints simples (sans trop de jointures) et/ou en publiant les dumps. Mais pas une API complète sur laquelle n'importe quel front pourrait se construire.

## Si vous avez une vision différente pour nosdeputes.fr

J'avance donc je fais des choix. Si l'un de vous a quelque chose de vraiment différent en tête, vous pouvez démarrer votre propre version dans un autre repo (je n'aurai pas besoin des autres repo scraping et api à priori). Ou vous pouvez contribuer à ce repo pendant un moment et le forker dès que ça vous arrange pour en faire quelque chose de différent. Pas de souci.

# Stack

- Next.js
- Typescript
- Kysely pour les requêtes SQL
- Tailwind pour le CSS

## Details techniques

Le point d'entrée pour comprendre le code c'est chacune des pages, dans le dossier pages/

Vous devriez trouver grosso modo pour chaque page un `getServerSideProps()` pour requêter/assembler les données et un component React `Page()` pour faire le rendu.

Les pages sont en train d'être migrées vers une nouvelle structure modulaire (cf le dossier `/src/pageModules`). C'est fait maison mais assez intuitif je pense.

# Installation / faire tourner en local

Il faut Yarn et NodeJS.

## Mariadb sans docker

Il faut installer mariadb localement et importer dessus un dump récent de la base de nosdeputes.fr https://data.regardscitoyens.org/nosdeputes.fr/ Vous pouvez aussi essayer d'utiliser le script `import-latest-dump`, c'est un script que je me suis fait pour télécharger le dernier dump, et l'importer sur mon mariadb local pour avoir régulièrement les dernières données. C'est bourrin, j'ai dû utiliser des commandes avec sudo et je fais des DROP DATABASE. Lisez le script avant de le lancer.

## Mariadb avec docker

Vous pouvez utiliser le `docker-compose.yaml` fourni pour lancer mariadb et importer les données :

    # lance mariadb
    docker-compose up
    # télécharge et restaure le dernier dump
    curl https://data.regardscitoyens.org/nosdeputes.fr/nosdeputes.fr_donnees.sql.gz | gunzip | docker-compose exec -T db sh -c 'exec mariadb -uroot -Dnosdeputes'

## Lancer le frontend

Enfin il faut créér un fichier .env.local en se basant sur le .env.local.sample

Quand tout est prêt :

    # installer les dépendances
    yarn
    # lancer
    yarn dev
    # puis aller sur http://localhost:3000

# Contribuer

Vous êtes le bienvenu, vous pouvez prendre un des items dans la TODO liste ou les issues et faire une PR

N'hésitez pas à faire signe si vous commencez à bosser sur un truc, pour qu'on ne fasse pas deux fois la même chose

# TODO liste

- faisable dès maintenant (pas d'ordre précis)

  - refacto/reorganiser le code (EN COURS)
  - POC le build static avec getStaticPaths/getStaticProps
  - faire un deploy quelque part. en mode static et/ou sur un vrai serveur avec une db.
  - implem la page /16/seance/283
  - implem la page /16/document/219
  - implem la page /16/marc-ferracci/dossier/317
  - implem les divers blocs sur la page de chaque député
  - implem le graphique et les stats sur la page de chaque député
  - implem la page /synthese
  - implem la page /16/question/QE/2497
  - implem la page deputes/tags
  - implem la homepage
  - implem les pages /circonscription et /circonscription/departement/Ardennes

- pour plus tard, ne pas attaquer de suite
  - implem la recherche (à voir en terme d'archi ce dont il y a besoin)
  - refaire une passe sur les URLs, j'en ai probablement raté une ou deux
  - un peu de design
  - implem les abonnements par mail (au député, à une recherche) ? que si vraiment utile. Est-ce utilisé ?
  - un peu de SEO, regarder les balises meta, le title, etc.
  - exposer les données via API iso à l'existant. Challenger éventuellement si trop de taf, qu'est-ce qui est vraiment utilisé ?
